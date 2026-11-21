const mongoose = require("mongoose");
const User = require("../models/User");
const Property = require("../models/Property");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");
const Offer = require("../models/Offer");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const { ok, fail } = require("../middleware/agentScope"); // shared {success,message,data} envelope
const { recordActivity } = require("../middleware/activity");

const isPrivileged = (req) => req.user.role === "SUPER_ADMIN";

// ---------- Overview ----------
const overview = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const [myBookings, myOffers, favorites, myListings, listingsAgg, txAgg] = await Promise.all([
    Booking.find({ user: me }).sort({ bookingDate: 1 }).populate("property", "title city images").populate("agent", "name phone"),
    Offer.find({ buyer: me }).sort({ createdAt: -1 }).populate("property", "title price"),
    User.findById(me).select("favorites").populate("favorites", "title price city images status"),
    Property.find({ owner: me }).select("title propertyId price city status approvalStatus images createdAt").sort({ createdAt: -1 }),
    isPrivileged(req) ? [] : Property.aggregate([{ $match: { owner: me } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Transaction.aggregate([{ $match: { user: me } }, { $group: { _id: "$status", total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
  ]);
  ok(res, {
    buyer: {
      bookings: myBookings,
      upcoming: myBookings.filter((b) => ["Pending", "Confirmed"].includes(b.status)).length,
      offers: myOffers,
      activeOffers: myOffers.filter((o) => ["Pending", "Countered"].includes(o.status)).length,
      favorites: favorites?.favorites || [],
    },
    seller: {
      listings: myListings,
      byStatus: listingsAgg,
      pendingReview: myListings.filter((p) => p.approvalStatus === "pending").length,
    },
    transactions: txAgg,
  }, "Client overview");
});

// ---------- Buyer: book a tour ----------
const createBooking = asyncHandler(async (req, res) => {
  const { property, bookingDate, tourType = "In-Person", notes = "" } = req.body;
  if (!property || !bookingDate) return fail(res, 400, "Property and date/time are required");
  if (new Date(bookingDate) <= new Date()) return fail(res, 400, "Tour must be scheduled in the future");
  const prop = await Property.findById(property).select("title owner assignedAgent status approvalStatus");
  if (!prop || prop.status !== "Available" || prop.approvalStatus !== "approved")
    return fail(res, 400, "This property is not available for tours right now");
  const b = await Booking.create({
    user: req.user._id, property: prop._id, agent: prop.assignedAgent,
    bookingDate: new Date(bookingDate), amount: 0, tourType,
    status: "Pending", paymentStatus: "Pending", notes,
    timeline: [{ status: "Pending", note: `Tour request (${tourType}) pending approval`, by: req.user._id }],
  });
  try {
    await Notification.create({ sender: req.user._id, recipient: prop.assignedAgent || null, title: "New tour request", message: `${req.user.name} requested a tour of ${prop.title}`, type: "new_booking" });
  } catch { /* never break booking */ }
  await recordActivity({ user: req.user, module: "bookings", action: "Tour booked", description: `Booked tour ${b.bookingId}`, req });
  ok(res, { booking: b, bookingId: b.bookingId }, "Tour request received");
});

const myBookings = asyncHandler(async (req, res) => {
  const rows = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 })
    .populate("property", "title propertyId price city images address")
    .populate("agent", "name email phone");
  ok(res, { bookings: rows }, "My bookings");
});

const cancelBooking = asyncHandler(async (req, res) => {
  const b = await Booking.findOneAndUpdate({ _id: req.params.id, user: req.user._id, status: { $in: ["Pending", "Confirmed"] } }, { status: "Cancelled" }, { new: true });
  if (!b) return fail(res, 404, "Active booking not found");
  ok(res, { booking: b }, "Booking cancelled");
});

const submitBookingPayment = asyncHandler(async (req, res) => {
  const { paymentMethod, amount, transactionId, payerName, screenshot, notes } = req.body;
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return fail(res, 400, "Please enter a valid payment amount");
  }
  if (!paymentMethod) {
    return fail(res, 400, "Please select a payment method");
  }
  if (paymentMethod !== "Cash" && !transactionId) {
    return fail(res, 400, "Transaction ID or reference number is required for online payments");
  }

  const b = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!b) return fail(res, 404, "Booking not found");

  b.amount = numAmount;
  b.paymentMethod = paymentMethod;
  b.transactionId = paymentMethod === "Cash" ? "CASH-PAYMENT" : (transactionId || "").trim();
  b.payerName = payerName || req.user.name;
  b.paymentScreenshot = paymentMethod === "Cash" ? "" : (screenshot || "");
  if (notes) {
    b.notes = b.notes ? `${b.notes} | ${notes}` : notes;
  }
  b.paymentStatus = "Submitted";
  b.approvalStatus = "Submitted";

  b.timeline.push({
    status: "Submitted",
    note: `Payment of ₹${numAmount.toLocaleString("en-IN")} submitted via ${paymentMethod}${paymentMethod !== "Cash" ? ` (Ref: ${b.transactionId})` : " (Cash)"}. Awaiting Admin Approval.`,
    by: req.user._id,
  });

  await b.save();

  // Create or update Transaction record in Pending state
  try {
    await Transaction.findOneAndUpdate(
      { booking: b._id },
      {
        user: req.user._id,
        property: b.property,
        booking: b._id,
        amount: numAmount,
        paymentMethod: paymentMethod === "Cash" ? "Cash" : (paymentMethod === "Bank Transfer" ? "Bank Transfer" : "Online Payment"),
        gatewayTransactionId: paymentMethod === "Cash" ? "CASH" : b.transactionId,
        status: "Pending",
      },
      { upsert: true, new: true }
    );
  } catch {}

  // Notify Admins
  try {
    const admins = await User.find({ role: { $in: ["ADMIN", "SUPER_ADMIN"] } }).select("_id");
    for (const admin of admins) {
      await Notification.create({
        sender: req.user._id,
        recipient: admin._id,
        title: "New Booking Payment Submitted",
        message: `${req.user.name} submitted ${paymentMethod} payment of ₹${numAmount.toLocaleString("en-IN")} for booking ${b.bookingId}. Verification required.`,
        type: "payment_submitted",
      });
    }
  } catch {}

  await recordActivity({
    user: req.user,
    module: "bookings",
    action: "Payment submitted",
    description: `Submitted ${paymentMethod} payment of ₹${numAmount} for booking ${b.bookingId}`,
    req,
  });

  const updatedBooking = await Booking.findById(b._id)
    .populate("property", "title propertyId price city images address")
    .populate("agent", "name email phone");

  ok(res, { booking: updatedBooking }, "Payment submitted successfully. Awaiting admin approval.");
});

// ---------- Buyer: favorites ----------
const favorites = asyncHandler(async (req, res) => {
  const u = await User.findById(req.user._id).populate("favorites", "title propertyId price city images status approvalStatus");
  ok(res, { favorites: (u.favorites || []).filter((p) => p) }, "Saved properties");
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const pid = String(req.params.propertyId);
  const isValidId = mongoose.Types.ObjectId.isValid(pid);
  if (!isValidId) {
    return ok(res, { saved: true }, "Saved to wishlist");
  }
  const u = await User.findById(req.user._id);
  const has = (u.favorites || []).some((f) => String(f) === pid);
  await User.findByIdAndUpdate(req.user._id, has ? { $pull: { favorites: pid } } : { $addToSet: { favorites: pid } });
  ok(res, { saved: !has }, has ? "Removed from wishlist" : "Saved to wishlist");
});

// ---------- Buyer & Seller: offers ----------
const myOffers = asyncHandler(async (req, res) => {
  const rows = await Offer.find({ buyer: req.user._id }).sort({ createdAt: -1 }).populate("property", "title price city images");
  ok(res, { offers: rows }, "My offers");
});

const createOffer = asyncHandler(async (req, res) => {
  const { property, amount, message = "" } = req.body;
  if (!property || !amount || Number(amount) <= 0) return fail(res, 400, "Property and a valid offer amount are required");
  const prop = await Property.findById(property).select("owner title");
  if (!prop) return fail(res, 404, "Property not found");
  const offer = await Offer.create({
    property: prop._id, buyer: req.user._id, seller: prop.owner,
    amount: Number(amount), message,
    timeline: [{ status: "Pending", note: `Offer of ${amount} placed`, by: req.user._id }],
  });
  ok(res, { offer }, "Offer submitted");
});

const respondOffer = asyncHandler(async (req, res) => {
  const { status, counterAmount } = req.body; // Accepted | Rejected | Countered
  if (!["Accepted", "Rejected", "Countered"].includes(status)) return fail(res, 400, "Invalid response");
  const offer = await Offer.findById(req.params.id).populate("property", "owner");
  if (!offer) return fail(res, 404, "Offer not found");
  const sellerId = String(offer.seller || offer.property?.owner || "");
  if (sellerId !== String(req.user._id) && !isPrivileged(req)) return fail(res, 403, "Only the seller can respond");
  offer.status = status;
  if (status === "Countered") offer.counterAmount = Number(counterAmount);
  offer.timeline.push({ status, note: status === "Countered" ? `Counter-offer: ${counterAmount}` : `Offer ${status.toLowerCase()}`, by: req.user._id });
  await offer.save();
  ok(res, { offer }, `Offer ${status.toLowerCase()}`);
});

// ---------- Seller: listings ----------
const submitListing = asyncHandler(async (req, res) => {
  const data = { ...req.body, owner: req.user._id, approvalStatus: "pending", status: "Pending", isPublished: false };
  delete data.propertyId;
  delete data.assignedAgent;

  if (req.body.latitude && req.body.longitude) {
    data.location = {
      type: "Point",
      coordinates: [Number(req.body.longitude), Number(req.body.latitude)],
    };
  }

  const p = await Property.create(data); // status "pending_admin_approval" ~= Pending + approval pending
  await recordActivity({ user: req.user, module: "properties", action: "Listing submitted", description: `Seller listed ${p.title}`, req });
  ok(res, { property: p }, "Listing submitted for admin approval");
});

const myListings = asyncHandler(async (req, res) => {
  const rows = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 }).populate("propertyType", "name");
  ok(res, { listings: rows }, "My listings");
});

const updateListing = asyncHandler(async (req, res) => {
  const p = await Property.findOne({ _id: req.params.id, owner: req.user._id });
  if (!p) return fail(res, 404, "Listing not found");
  const { approvalStatus, isPublished, isFeatured, propertyId, owner, assignedAgent, status, ...safe } = req.body;
  Object.assign(p, safe);
  if (req.body.latitude && req.body.longitude) {
    p.location = {
      type: "Point",
      coordinates: [Number(req.body.longitude), Number(req.body.latitude)],
    };
  }
  if (p.approvalStatus === "approved") p.approvalStatus = "pending"; // edits re-trigger review
  await p.save();
  ok(res, { property: p }, "Listing updated and re-submitted for review");
});

// ---------- Seller: visit requests & inquiries on my homes ----------
const sellerLeads = asyncHandler(async (req, res) => {
  const mine = await Property.find({ owner: req.user._id }).select("_id");
  const ids = mine.map((p) => p._id);
  const [tours, offers] = await Promise.all([
    Booking.find({ property: { $in: ids } }).sort({ createdAt: -1 }).populate("user property", "name email phone title"),
    Offer.find({ property: { $in: ids } }).sort({ createdAt: -1 }).populate("buyer property", "name email phone title amount"),
  ]);
  ok(res, { tours, offers }, "Visit requests & inquiries");
});

// ---------- Common: my transactions ledger ----------
const myTransactions = asyncHandler(async (req, res) => {
  const rows = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 }).populate("property booking", "title propertyId bookingId");
  ok(res, { transactions: rows }, "My transactions");
});

// ---------- Common: profile & preferences ----------
const getClientProfile = asyncHandler(async (req, res) => {
  const u = await User.findById(req.user._id).populate("preferences.searchMatch.propertyType", "name");
  ok(res, { user: u.toSafeJSON() }, "Profile");
});

const updateClientProfile = asyncHandler(async (req, res) => {
  const { name, phone, profileImage, preferences } = req.body;
  const u = await User.findById(req.user._id);
  if (name !== undefined) u.name = name;
  if (phone !== undefined) u.phone = phone;
  if (profileImage !== undefined) u.profileImage = profileImage;
  if (preferences) {
    u.preferences = u.preferences || {};
    if (preferences.whatsappAlerts !== undefined) u.preferences.whatsappAlerts = preferences.whatsappAlerts;
    if (preferences.searchMatch) u.preferences.searchMatch = { ...u.preferences.searchMatch, ...preferences.searchMatch };
  }
  await u.save();
  ok(res, { user: u.toSafeJSON() }, "Profile updated");
});

module.exports = {
  overview, createBooking, myBookings, cancelBooking, submitBookingPayment,
  favorites, toggleFavorite, myOffers, createOffer, respondOffer,
  submitListing, myListings, updateListing, sellerLeads,
  myTransactions, getClientProfile, updateClientProfile,
};
