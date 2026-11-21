const Booking = require("../models/Booking");
const asyncHandler = require("../utils/asyncHandler");
const { buildQuery, paginate } = require("../utils/query");
const { ok, fail } = require("../middleware/agentScope");
const { recordActivity } = require("../middleware/activity");

const scope = (req) => (req.user.role === "SUPER_ADMIN" ? {} : { agent: req.user._id });

const create = asyncHandler(async (req, res) => {
  const { user, property, bookingDate, amount = 0, notes = "" } = req.body;
  if (!user || !property) return fail(res, 400, "Customer and property are required");
  const b = await Booking.create({
    user, property, agent: req.user._id,
    bookingDate: bookingDate ? new Date(bookingDate) : new Date(),
    amount: Number(amount) || 0, notes,
    timeline: [{ status: "Pending", note: "Tour scheduled by agent", by: req.user._id }],
  });
  await recordActivity({ user: req.user, module: "bookings", action: "Tour scheduled", description: `Scheduled ${b.bookingId}`, req });
  ok(res, { booking: b }, "Tour scheduled");
});

const list = asyncHandler(async (req, res) => {
  const { filters, page, limit, skip, sort } = buildQuery(req, {
    searchFields: ["bookingId", "notes"],
    allowedFilters: ["status", "paymentStatus"],
  });
  if (req.query.from || req.query.to) {
    filters.bookingDate = {};
    if (req.query.from) filters.bookingDate.$gte = new Date(req.query.from);
    if (req.query.to) filters.bookingDate.$lte = new Date(req.query.to);
  }
  const result = await paginate(Booking, { ...scope(req), ...filters }, {
    page, limit, skip, sort,
    populate: [{ path: "user", select: "name email phone" }, { path: "property", select: "title propertyId price city images" }],
  });
  ok(res, result, "Site visits & bookings");
});

const getOne = asyncHandler(async (req, res) => {
  const b = await Booking.findOne({ _id: req.params.id, ...scope(req) }).populate("user property");
  if (!b) return fail(res, 404, "Booking not found");
  ok(res, { booking: b }, "Booking details");
});

const accept = asyncHandler(async (req, res) => {
  const b = await Booking.findOne({ _id: req.params.id, ...scope(req) });
  if (!b) return fail(res, 404, "Booking not found");
  b.status = "Confirmed";
  b.timeline.push({ status: "Confirmed", note: "Tour accepted by agent", by: req.user._id });
  await b.save();
  await recordActivity({ user: req.user, module: "bookings", action: "Tour accepted", description: `Accepted ${b.bookingId}`, req });
  ok(res, { booking: b }, "Tour accepted");
});

const decline = asyncHandler(async (req, res) => {
  const b = await Booking.findOne({ _id: req.params.id, ...scope(req) });
  if (!b) return fail(res, 404, "Booking not found");
  b.status = "Cancelled";
  b.timeline.push({ status: "Cancelled", note: req.body.note || "Declined by agent", by: req.user._id });
  await b.save();
  ok(res, { booking: b }, "Tour declined");
});

const reschedule = asyncHandler(async (req, res) => {
  const b = await Booking.findOne({ _id: req.params.id, ...scope(req) });
  if (!b) return fail(res, 404, "Booking not found");
  if (!req.body.bookingDate) return fail(res, 400, "New bookingDate is required");
  b.bookingDate = new Date(req.body.bookingDate);
  b.timeline.push({ status: b.status, note: `Rescheduled to ${b.bookingDate.toLocaleString()}`, by: req.user._id });
  await b.save();
  ok(res, { booking: b }, "Tour rescheduled");
});

const feedback = asyncHandler(async (req, res) => {
  const b = await Booking.findOne({ _id: req.params.id, ...scope(req) });
  if (!b) return fail(res, 404, "Booking not found");
  b.notes = [b.notes, req.body.feedback].filter(Boolean).join("\n");
  b.timeline.push({ status: b.status, note: `Post-visit feedback: ${req.body.feedback}`, by: req.user._id });
  await b.save();
  ok(res, { booking: b }, "Feedback saved");
});

// Agent visit status: Pending / Ongoing / Done (mapped onto shared enum, no schema change)
const STATUS_MAP = { Pending: "Pending", Ongoing: "Confirmed", Done: "Completed" };
const setStatus = asyncHandler(async (req, res) => {
  const mapped = STATUS_MAP[req.body.status];
  if (!mapped) return fail(res, 400, "Status must be Pending, Ongoing or Done");
  const b = await Booking.findOne({ _id: req.params.id, ...scope(req) });
  if (!b) return fail(res, 404, "Booking not found");
  b.status = mapped;
  b.timeline.push({ status: mapped, note: `Agent marked visit as ${req.body.status}`, by: req.user._id });
  await b.save();
  await recordActivity({ user: req.user, module: "bookings", action: "Visit status updated", description: `${b.bookingId} -> ${req.body.status}`, req });
  ok(res, { booking: b }, `Visit marked as ${req.body.status}`);
});

module.exports = { list, getOne, create, setStatus, accept, decline, reschedule, feedback };
