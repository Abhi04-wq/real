const User = require("../models/User");
const Lead = require("../models/Lead");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");
const ActivityLog = require("../models/ActivityLog");
const asyncHandler = require("../utils/asyncHandler");
const { buildQuery, paginate } = require("../utils/query");
const { recordActivity } = require("../middleware/activity");

// Customers = users with CUSTOMER role. Reuses the User collection (no duplicate schema).
const baseFilter = (extra = {}) => ({ role: "CUSTOMER", ...extra });

const list = asyncHandler(async (req, res) => {
  const { filters, page, limit, skip, sort } = buildQuery(req, {
    searchFields: ["name", "email", "phone"],
    allowedFilters: ["status"],
  });
  const result = await paginate(User, baseFilter(filters), { page, limit, skip, sort });
  const enriched = await Promise.all(
    result.data.map(async (u) => {
      const o = u.toObject();
      delete o.password;
      const [inquiries, bookings, transactions] = await Promise.all([
        Lead.countDocuments({ $or: [{ email: u.email }, { phone: u.phone }] }),
        Booking.countDocuments({ user: u._id }),
        Transaction.countDocuments({ user: u._id }),
      ]);
      return { ...o, totalInquiries: inquiries, totalBookings: bookings, totalTransactions: transactions };
    })
  );
  res.json({ ...result, data: enriched });
});

const getOne = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: "CUSTOMER" }).populate("notes.by", "name email");
  if (!user) return res.status(404).json({ message: "Customer not found" });
  const [leads, bookings, transactions, activity, interested] = await Promise.all([
    Lead.find({ $or: [{ email: user.email }, { phone: user.phone }] }).populate("property", "title propertyId price").sort({ createdAt: -1 }),
    Booking.find({ user: user._id }).populate("property", "title propertyId price").sort({ createdAt: -1 }),
    Transaction.find({ user: user._id }).populate("property", "title propertyId").sort({ createdAt: -1 }),
    ActivityLog.find({ user: user._id }).sort({ createdAt: -1 }).limit(30),
    Lead.find({ $or: [{ email: user.email }, { phone: user.phone }], property: { $ne: null } }).populate("property", "title propertyId price city images").select("property"),
  ]);
  const safe = user.toSafeJSON();
  res.json({ customer: safe, leads, bookings, transactions, activity, interestedProperties: interested.map((l) => l.property).filter(Boolean) });
});

const update = asyncHandler(async (req, res) => {
  const { name, phone, status } = req.body;
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: "CUSTOMER" },
    { ...(name !== undefined ? { name } : {}), ...(phone !== undefined ? { phone } : {}), ...(status !== undefined ? { status } : {}) },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: "Customer not found" });
  await recordActivity({ user: req.user, module: "users", action: "Customer updated", description: `Updated customer ${user.email}`, req });
  res.json({ customer: user.toSafeJSON() });
});

const addNote = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: "CUSTOMER" });
  if (!user) return res.status(404).json({ message: "Customer not found" });
  user.notes.push({ text: req.body.text, by: req.user._id });
  await user.save();
  await recordActivity({ user: req.user, module: "users", action: "Customer note added", description: `Note added for ${user.email}`, req });
  res.json({ customer: user.toSafeJSON() });
});

module.exports = { list, getOne, update, addNote };
