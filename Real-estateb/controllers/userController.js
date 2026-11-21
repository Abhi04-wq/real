const User = require("../models/User");
const Booking = require("../models/Booking");
const Lead = require("../models/Lead");
const Transaction = require("../models/Transaction");
const ActivityLog = require("../models/ActivityLog");
const asyncHandler = require("../utils/asyncHandler");
const { buildQuery, paginate } = require("../utils/query");
const { recordActivity } = require("../middleware/activity");

const list = asyncHandler(async (req, res) => {
  const { filters, page, limit, skip, sort } = buildQuery(req, {
    searchFields: ["name", "email", "phone"],
    allowedFilters: ["role", "status"],
  });
  const result = await paginate(User, filters, { page, limit, skip, sort });
  result.data = result.data.map((u) => { const o = u.toObject(); delete o.password; return o; });
  res.json(result);
});

const getOne = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate("roleRef");
  if (!user) return res.status(404).json({ message: "User not found" });
  const [bookings, transactions, activity, leads] = await Promise.all([
    Booking.find({ user: user._id }).populate("property", "title propertyId price").limit(20).sort({ createdAt: -1 }),
    Transaction.find({ user: user._id }).populate("property", "title propertyId").limit(20).sort({ createdAt: -1 }),
    ActivityLog.find({ user: user._id }).limit(30).sort({ createdAt: -1 }),
    Lead.find({ $or: [{ email: user.email }, { phone: user.phone }] }).populate("property", "title propertyId price city").sort({ createdAt: -1 }).limit(20),
  ]);
  const safe = user.toSafeJSON();
  res.json({ user: safe, bookings, transactions, activity, leads });
});

const update = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  await recordActivity({ user: req.user, module: "users", action: "User updated", description: `Updated user ${user.email}`, req });
  res.json({ user: user.toSafeJSON() });
});

const setStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  await recordActivity({ user: req.user, module: "users", action: `User ${status}`, description: `${status} user ${user.email}`, req });
  res.json({ user: user.toSafeJSON() });
});

const remove = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  await recordActivity({ user: req.user, module: "users", action: "User deleted", description: `Deleted user ${user.email}`, req });
  res.json({ message: "User deleted" });
});

module.exports = { list, getOne, update, setStatus, remove };
