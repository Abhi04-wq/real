const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const Agent = require("../models/Agent");
const Commission = require("../models/Commission");
const Transaction = require("../models/Transaction");
const Property = require("../models/Property");
const asyncHandler = require("../utils/asyncHandler");
const { buildQuery, paginate } = require("../utils/query");
const { recordActivity } = require("../middleware/activity");

const list = asyncHandler(async (req, res) => {
  const { filters, page, limit, skip, sort } = buildQuery(req, {
    searchFields: ["bookingId", "notes", "transactionId", "payerName"],
    allowedFilters: ["status", "paymentStatus", "approvalStatus", "user", "property", "agent"],
  });
  const result = await paginate(Booking, filters, {
    page, limit, skip, sort,
    populate: [
      { path: "user", select: "name email phone" },
      { path: "property", select: "title propertyId price city" },
      { path: "agent", select: "name email phone" },
    ],
  });
  res.json(result);
});
const getOne = asyncHandler(async (req, res) => {
  const b = await Booking.findById(req.params.id).populate("user property agent");
  if (!b) return res.status(404).json({ message: "Booking not found" });

  let agentProfile = null;
  if (b.agent) {
    agentProfile = await Agent.findOne({ user: b.agent._id || b.agent }).select("commissionRate employeeId");
  }
  res.json({ booking: b, agentProfile });
});
const create = asyncHandler(async (req, res) => {
  const b = await Booking.create({ ...req.body, timeline: [{ status: req.body.status || "Pending", note: "Booking created", by: req.user._id }] });
  await recordActivity({ user: req.user, module: "bookings", action: "Booking created", description: `Created booking ${b.bookingId}`, req });
  res.status(201).json({ booking: b });
});
const updateStatus = asyncHandler(async (req, res) => {
  const b = await Booking.findById(req.params.id);
  if (!b) return res.status(404).json({ message: "Booking not found" });

  const isApprove = req.body.action === "approve" || req.body.approvalStatus === "Approved" || (req.body.status === "Confirmed" && req.body.paymentStatus === "Paid");
  const isReject = req.body.action === "reject" || req.body.approvalStatus === "Rejected";

  if (isApprove) {
    b.status = "Confirmed";
    b.paymentStatus = "Paid";
    b.approvalStatus = "Approved";

    // Commission logic: If an agent is assigned, get agent's profile commissionRate and award commission
    if (!b.commissionCalculated) {
      let agentUserId = b.agent;
      if (!agentUserId && b.property) {
        const propDoc = await Property.findById(b.property).select("assignedAgent");
        if (propDoc?.assignedAgent) {
          agentUserId = propDoc.assignedAgent;
          b.agent = agentUserId;
        }
      }

      if (agentUserId) {
        // Query Agent profile to get commissionRate
        const agentDoc = await Agent.findOne({ user: agentUserId });
        const rate = Number(agentDoc?.commissionRate) || 2;
        const bookingAmt = Number(b.amount) || 0;
        const commAmount = (bookingAmt * rate) / 100;

        b.commissionRate = rate;
        b.commissionAmount = commAmount;
        b.commissionCalculated = true;

        if (commAmount > 0) {
          let txn = await Transaction.findOne({ booking: b._id });
          if (!txn) {
            txn = await Transaction.create({
              user: b.user,
              property: b.property,
              booking: b._id,
              amount: bookingAmt,
              paymentMethod: b.paymentMethod || "Cash",
              gatewayTransactionId: b.transactionId || "APPROVED-BOOKING",
              status: "Paid",
            });
          } else {
            txn.status = "Paid";
            await txn.save();
          }

          await Commission.create({
            agent: agentUserId,
            property: b.property,
            transaction: txn._id,
            percentage: rate,
            amount: commAmount,
            status: "Approved",
          });

          try {
            await Notification.create({
              recipient: agentUserId,
              title: "Commission Earned!",
              message: `Booking ${b.bookingId} payment approved. ₹${commAmount.toLocaleString("en-IN")} commission (${rate}%) credited to your account.`,
              type: "commission",
            });
          } catch {}
        }
      }
    }

    b.timeline.push({
      status: "Confirmed",
      note: req.body.note || `Payment approved by ${req.user.name || "Admin"}. Agent commission calculated.`,
      by: req.user._id,
    });

    try {
      await Notification.create({
        recipient: b.user,
        title: "Booking Payment Approved!",
        message: `Your payment of ₹${Number(b.amount).toLocaleString("en-IN")} for booking ${b.bookingId} has been verified and approved!`,
        type: "booking_confirmed",
      });
    } catch {}
  } else if (isReject) {
    const cause = (req.body.cause || req.body.reason || req.body.rejectionReason || req.body.note || "Payment details could not be verified.").trim();
    b.status = "Cancelled";
    b.paymentStatus = "Failed";
    b.approvalStatus = "Rejected";
    b.rejectionReason = cause;
    b.timeline.push({
      status: "Rejected",
      note: `Payment rejected by ${req.user.name || "Admin"}. Cause: ${cause}`,
      by: req.user._id,
    });
    try {
      await Notification.create({
        recipient: b.user,
        title: "Booking Payment Rejected",
        message: `Your payment for booking ${b.bookingId} was rejected. Cause: ${cause}`,
        type: "booking_cancelled",
      });
    } catch {}
    try {
      await Transaction.findOneAndUpdate(
        { booking: b._id, status: { $ne: "Paid" } },
        { status: "Cancelled", rejectionReason: cause }
      );
    } catch {}
  } else {
    // Normal update (assign agent, change status)
    if (req.body.status) b.status = req.body.status;
    if (req.body.paymentStatus) b.paymentStatus = req.body.paymentStatus;
    if (req.body.approvalStatus) b.approvalStatus = req.body.approvalStatus;
  }

  const prevAgent = String(b.agent || "");
  if (req.body.agent && String(req.body.agent) !== prevAgent) {
    b.agent = req.body.agent;
    b.timeline.push({ status: b.status, note: "Agent assigned by admin", by: req.user._id });
    try {
      await Notification.create({
        sender: req.user._id, recipient: req.body.agent,
        title: "Booking assigned to you",
        message: `Booking ${b.bookingId} has been assigned to you.`,
        type: "new_booking",
      });
    } catch {}
    await recordActivity({ user: req.user, module: "bookings", action: "Agent assigned", description: `Assigned agent to booking ${b.bookingId}`, req });
  }
  if (req.body.notes) b.notes = req.body.notes;
  await b.save();
  await recordActivity({ user: req.user, module: "bookings", action: "Booking updated", description: `Booking ${b.bookingId} -> ${b.status} (${b.approvalStatus || ""})`, req });

  const updated = await Booking.findById(b._id).populate("user property agent");
  res.json({ booking: updated });
});
const remove = asyncHandler(async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  res.json({ message: "Booking deleted" });
});
module.exports = { list, getOne, create, updateStatus, remove };
