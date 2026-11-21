const Role = require("../models/Role");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { recordActivity } = require("../middleware/activity");

const PERMISSIONS = [
  "users.view", "users.create", "users.edit", "users.delete",
  "properties.view", "properties.create", "properties.edit", "properties.delete", "properties.approve",
  "leads.view", "leads.create", "leads.edit", "leads.delete",
  "bookings.view", "bookings.edit",
  "transactions.view", "transactions.manage",
  "reports.view", "settings.manage", "notifications.send",
];

const list = asyncHandler(async (req, res) => {
  const roles = await Role.find().sort({ createdAt: -1 });
  const withCounts = await Promise.all(roles.map(async (r) => ({ ...r.toObject(), userCount: await User.countDocuments({ $or: [{ role: r.name }, { roleRef: r._id }] }) })));
  res.json({ data: withCounts, permissions: PERMISSIONS });
});
const create = asyncHandler(async (req, res) => {
  const r = await Role.create(req.body);
  await recordActivity({ user: req.user, module: "roles", action: "Role created", description: `Created role ${r.name}`, req });
  res.status(201).json({ role: r });
});
const update = asyncHandler(async (req, res) => {
  const r = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!r) return res.status(404).json({ message: "Not found" });
  await recordActivity({ user: req.user, module: "roles", action: "Role updated", description: `Updated role ${r.name}`, req });
  res.json({ role: r });
});
const remove = asyncHandler(async (req, res) => {
  await Role.findByIdAndDelete(req.params.id);
  res.json({ message: "Role deleted" });
});
module.exports = { list, create, update, remove, PERMISSIONS };
