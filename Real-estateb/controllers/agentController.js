const Agent = require("../models/Agent");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Commission = require("../models/Commission");
const Lead = require("../models/Lead");
const asyncHandler = require("../utils/asyncHandler");
const { buildQuery, paginate } = require("../utils/query");
const { recordActivity } = require("../middleware/activity");

const list = asyncHandler(async (req, res) => {
  const q = { ...req.query };
  const page = Math.max(parseInt(q.page) || 1, 1);
  const limit = Math.min(parseInt(q.limit) || 10, 100);
  const skip = (page - 1) * limit;
  const filters = {};
  if (q.status) filters.status = q.status;
  if (q.department) filters.department = q.department;
  if (q.designation) filters.designation = q.designation;
  if (q.search) {
    const users = await User.find({ $or: [{ name: { $regex: q.search, $options: "i" } }, { email: { $regex: q.search, $options: "i" } }] }).select("_id");
    filters.user = { $in: users.map((u) => u._id) };
  }
  const [data, total] = await Promise.all([
    Agent.find(filters).populate("user", "name email phone profileImage role status").populate("assignedProperties", "title propertyId price").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Agent.countDocuments(filters),
  ]);
  res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) || 1 });
});

const DESIGNATION_ROLES = { Admin: "ADMIN", Agent: "AGENT", Customer: "CUSTOMER" };
const DEPARTMENTS = ["Sales", "Marketing", "Support", "Operations", "HR", "Finance", "Management"];

const create = asyncHandler(async (req, res) => {
  const { name, email, phone, password, department, designation, commissionRate } = req.body;
  if (department && !DEPARTMENTS.includes(department))
    return res.status(400).json({ message: `Invalid department. Allowed: ${DEPARTMENTS.join(", ")}` });
  if (designation && !Object.keys(DESIGNATION_ROLES).includes(designation))
    return res.status(400).json({ message: `Invalid designation. Allowed: ${Object.keys(DESIGNATION_ROLES).join(", ")}` });
  const user = await User.findOne({ email });
  if (user) return res.status(400).json({ message: `Email "${email}" already exists in users collection` });
  const role = DESIGNATION_ROLES[designation] || "AGENT";
  const created = await User.create({ name, email, phone, password: password || "Agent@123", role });
  const agent = await Agent.create({ user: created._id, department, designation, commissionRate });
  await recordActivity({ user: req.user, module: "agents", action: "Agent created", description: `Created agent ${email}`, req });
  res.status(201).json({ agent });
});

const getOne = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id)
    .populate("user", "name email phone profileImage role status")
    .populate("assignedProperties", "title propertyId price status city");
  if (!agent) return res.status(404).json({ message: "Agent not found" });
  const [leads, bookings, commissions] = await Promise.all([
    Lead.find({ assignedAgent: agent.user._id }).limit(20).sort({ createdAt: -1 }),
    Booking.find({ agent: agent.user._id }).populate("property", "title propertyId").limit(20).sort({ createdAt: -1 }),
    Commission.find({ agent: agent.user._id }).limit(50).sort({ createdAt: -1 }),
  ]);
  const totalCommission = commissions.reduce((s, c) => s + (c.amount || 0), 0);
  const completedSales = bookings.filter((b) => b.status === "Completed").length;
  res.json({ agent, leads, bookings, commissions, stats: { activeLeads: leads.filter((l) => !["Converted", "Lost"].includes(l.status)).length, completedSales, totalCommission } });
});

const update = asyncHandler(async (req, res) => {
  const { department, designation, commissionRate, status, assignedProperties, assignedLeads, name, phone } = req.body;
  const agent = await Agent.findById(req.params.id);
  if (!agent) return res.status(404).json({ message: "Agent not found" });
  if (department !== undefined) {
    if (department && !DEPARTMENTS.includes(department))
      return res.status(400).json({ message: `Invalid department. Allowed: ${DEPARTMENTS.join(", ")}` });
    agent.department = department;
  }
  if (designation !== undefined) {
    if (designation && !Object.keys(DESIGNATION_ROLES).includes(designation))
      return res.status(400).json({ message: `Invalid designation. Allowed: ${Object.keys(DESIGNATION_ROLES).join(", ")}` });
    agent.designation = designation;
    if (designation) await User.findByIdAndUpdate(agent.user, { role: DESIGNATION_ROLES[designation] });
  }
  if (commissionRate !== undefined) agent.commissionRate = commissionRate;
  if (status !== undefined) agent.status = status;
  if (assignedProperties !== undefined) agent.assignedProperties = assignedProperties;
  if (assignedLeads !== undefined) agent.assignedLeads = assignedLeads;
  await agent.save();
  if (name || phone) await User.findByIdAndUpdate(agent.user, { ...(name ? { name } : {}), ...(phone ? { phone } : {}) });
  await recordActivity({ user: req.user, module: "agents", action: "Agent updated", description: `Updated agent ${agent._id}`, req });
  res.json({ agent });
});

const remove = asyncHandler(async (req, res) => {
  const agent = await Agent.findByIdAndDelete(req.params.id);
  if (!agent) return res.status(404).json({ message: "Agent not found" });
  await recordActivity({ user: req.user, module: "agents", action: "Agent deleted", description: `Deleted agent ${agent._id}`, req });
  res.json({ message: "Agent deleted" });
});

module.exports = { list, create, getOne, update, remove };
