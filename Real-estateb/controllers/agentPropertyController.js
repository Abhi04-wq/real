const Property = require("../models/Property");
const Lead = require("../models/Lead");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");
const ActivityLog = require("../models/ActivityLog");
const asyncHandler = require("../utils/asyncHandler");
const { buildQuery, paginate } = require("../utils/query");
const { agentScope, ok, fail } = require("../middleware/agentScope");
const { recordActivity } = require("../middleware/activity");

const mine = (req) => (req.user.role === "SUPER_ADMIN" ? {} : { $or: [{ assignedAgent: req.user._id }, { owner: req.user._id }] });

const list = asyncHandler(async (req, res) => {
  const { filters, page, limit, skip, sort } = buildQuery(req, {
    searchFields: ["title", "city", "address", "propertyId"],
    allowedFilters: ["status", "approvalStatus", "listingType", "city", "propertyType"],
  });
  // chip mapping from portal UI
  if (req.query.chip === "published") { filters.status = "Available"; filters.approvalStatus = "approved"; }
  if (req.query.chip === "pending") filters.approvalStatus = "pending";
  if (req.query.chip === "contract") filters.status = "Reserved";
  if (req.query.chip === "sold") filters.status = { $in: ["Sold", "Rented"] };
  if (req.query.minPrice || req.query.maxPrice) {
    filters.price = {};
    if (req.query.minPrice) filters.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filters.price.$lte = Number(req.query.maxPrice);
  }
  const result = await paginate(Property, { ...mine(req), ...filters }, {
    page, limit, skip, sort,
    populate: [{ path: "propertyType", select: "name" }],
  });
  ok(res, result, "My properties");
});

const getOne = asyncHandler(async (req, res) => {
  const p = await Property.findOne({ _id: req.params.id, ...mine(req) }).populate("propertyType owner", "name email phone");
  if (!p) return fail(res, 404, "Property not found");
  const [leads, bookings, transactions, activity] = await Promise.all([
    Lead.find({ property: p._id, ...agentScope(req) }).select("name phone status createdAt"),
    Booking.find({ property: p._id, ...(req.user.role === "SUPER_ADMIN" ? {} : { agent: req.user._id }) }).populate("user", "name"),
    Transaction.find({ property: p._id }).select("transactionId amount status createdAt"),
    ActivityLog.find({ description: { $regex: p.title.slice(0, 20), $options: "i" } }).sort({ createdAt: -1 }).limit(10),
  ]);
  ok(res, { property: p, leads, bookings, transactions, activity }, "Property details");
});

const create = asyncHandler(async (req, res) => {
  const data = { ...req.body, owner: req.user._id, assignedAgent: req.user._id, approvalStatus: "pending", status: "Pending", isPublished: false };
  delete data.propertyId;
  if (req.body.latitude && req.body.longitude)
    data.location = { type: "Point", coordinates: [Number(req.body.longitude), Number(req.body.latitude)] };
  const p = await Property.create(data);
  await recordActivity({ user: req.user, module: "properties", action: "Property submitted", description: `Agent submitted ${p.title} for approval`, req });
  ok(res, { property: p }, "Submitted for admin approval");
});

const update = asyncHandler(async (req, res) => {
  const p = await Property.findOne({ _id: req.params.id, ...mine(req) });
  if (!p) return fail(res, 404, "Property not found");
  const { approvalStatus, isPublished, isFeatured, propertyId, owner, assignedAgent, ...safe } = req.body; // agents cannot self-approve/feature
  Object.assign(p, safe);
  await p.save();
  await recordActivity({ user: req.user, module: "properties", action: "Property updated", description: `Agent updated ${p.title}`, req });
  ok(res, { property: p }, "Property updated");
});

const remove = asyncHandler(async (req, res) => {
  const p = await Property.findOne({ _id: req.params.id, ...mine(req) });
  if (!p) return fail(res, 404, "Property not found");
  if (p.approvalStatus === "approved") return fail(res, 403, "Approved listings cannot be deleted. Contact admin.");
  await p.deleteOne();
  ok(res, null, "Property deleted");
});

const submit = asyncHandler(async (req, res) => {
  const p = await Property.findOneAndUpdate({ _id: req.params.id, ...mine(req) }, { approvalStatus: "pending" }, { new: true });
  if (!p) return fail(res, 404, "Property not found");
  await recordActivity({ user: req.user, module: "properties", action: "Property submitted", description: `Re-submitted ${p.title} for approval`, req });
  ok(res, { property: p }, "Submitted for admin approval");
});

module.exports = { list, getOne, create, update, remove, submit };
