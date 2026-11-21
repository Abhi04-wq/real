const Transaction = require("../models/Transaction");
const Booking = require("../models/Booking");
const Commission = require("../models/Commission");
const Agent = require("../models/Agent");
const Settings = require("../models/Settings");
const asyncHandler = require("../utils/asyncHandler");
const { buildQuery, paginate } = require("../utils/query");
const { recordActivity } = require("../middleware/activity");

const list = asyncHandler(async (req, res) => {
  const { filters, page, limit, skip, sort } = buildQuery(req, {
    searchFields: ["transactionId", "gatewayTransactionId"],
    allowedFilters: ["status", "paymentMethod", "user", "property", "booking"],
  });
  const result = await paginate(Transaction, filters, {
    page, limit, skip, sort,
    populate: [
      { path: "user", select: "name email phone" },
      { path: "property", select: "title propertyId price" },
      { path: "booking", select: "bookingId status" },
    ],
  });
  res.json(result);
});
const getOne = asyncHandler(async (req, res) => {
  const t = await Transaction.findById(req.params.id).populate("user property booking");
  if (!t) return res.status(404).json({ message: "Not found" });
  res.json({ transaction: t });
});
const create = asyncHandler(async (req, res) => {
  const t = await Transaction.create(req.body);
  if (req.body.booking) await Booking.findByIdAndUpdate(req.body.booking, { paymentStatus: t.status === "Paid" ? "Paid" : "Pending" });
  // auto commission on paid transaction with agent booking
  if (t.status === "Paid") {
    const booking = t.booking ? await Booking.findById(t.booking) : null;
    const agentUserId = booking?.agent;
    if (agentUserId) {
      const agentProfile = await Agent.findOne({ user: agentUserId });
      const settings = await Settings.findOne();
      const pct = agentProfile?.commissionRate ?? settings?.systemSettings?.defaultCommission ?? 2;
      await Commission.create({ agent: agentUserId, property: t.property, transaction: t._id, percentage: pct, amount: (t.amount * pct) / 100 });
    }
  }
  await recordActivity({ user: req.user, module: "transactions", action: "Transaction created", description: `Txn ${t.transactionId} ${t.amount}`, req });
  res.status(201).json({ transaction: t });
});
const update = asyncHandler(async (req, res) => {
  const t = await Transaction.findById(req.params.id);
  if (!t) return res.status(404).json({ message: "Not found" });

  const isApprove = req.body.action === "approve" || req.body.status === "Paid";
  const isReject = req.body.action === "reject" || req.body.status === "Cancelled" || req.body.status === "Failed";

  if (isApprove) {
    t.status = "Paid";
    if (t.booking) {
      const booking = await Booking.findById(t.booking);
      if (booking) {
        booking.paymentStatus = "Paid";
        booking.approvalStatus = "Approved";
        booking.status = "Confirmed";
        booking.timeline.push({
          status: "Confirmed",
          note: `Payment verified and approved by ${req.user?.name || "Admin"}`,
          by: req.user?._id,
        });

        // Commission calculation
        const agentUserId = booking.agent;
        if (agentUserId && !booking.commissionCalculated) {
          const agentProfile = await Agent.findOne({ user: agentUserId });
          const settings = await Settings.findOne();
          const pct = agentProfile?.commissionRate ?? settings?.systemSettings?.defaultCommission ?? 2;
          const commAmt = (Number(t.amount || booking.amount) * pct) / 100;
          booking.commissionCalculated = true;
          booking.commissionRate = pct;
          booking.commissionAmount = commAmt;
          await Commission.create({
            agent: agentUserId,
            property: t.property || booking.property,
            transaction: t._id,
            percentage: pct,
            amount: commAmt,
            status: "Approved",
          });
        }
        await booking.save();
      }
    }
  } else if (isReject) {
    const cause = (req.body.cause || req.body.reason || req.body.rejectionReason || "Payment verification declined").trim();
    t.status = "Cancelled";
    t.rejectionReason = cause;
    if (t.booking) {
      const booking = await Booking.findById(t.booking);
      if (booking) {
        booking.paymentStatus = "Failed";
        booking.approvalStatus = "Rejected";
        booking.status = "Cancelled";
        booking.rejectionReason = cause;
        booking.timeline.push({
          status: "Rejected",
          note: `Payment rejected by ${req.user?.name || "Admin"}. Cause: ${cause}`,
          by: req.user?._id,
        });
        await booking.save();
      }
    }
  } else {
    Object.assign(t, req.body);
  }

  await t.save();
  await recordActivity({
    user: req.user,
    module: "transactions",
    action: "Transaction updated",
    description: `Updated txn ${t.transactionId} -> ${t.status}`,
    req,
  });
  res.json({ transaction: t });
});
module.exports = { list, getOne, create, update };
