const Lead = require("../models/Lead");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { buildQuery, paginate } = require("../utils/query");
const { recordActivity } = require("../middleware/activity");

const list = asyncHandler(async (req, res) => {
  const { filters, page, limit, skip, sort } = buildQuery(req, {
    searchFields: ["name", "email", "phone"],
    allowedFilters: ["status", "source", "priority", "assignedAgent", "property"],
  });
  const result = await paginate(Lead, filters, {
    page, limit, skip, sort,
    populate: [
      { path: "property", select: "title propertyId price city" },
      { path: "assignedAgent", select: "name email phone" },
      { path: "followUps.by", select: "name email role" },
    ],
  });
  res.json(result);
});
const getOne = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
    .populate("property", "title propertyId price city")
    .populate("assignedAgent", "name email phone")
    .populate("followUps.by", "name email role");
  if (!lead) return res.status(404).json({ message: "Lead not found" });
  res.json({ lead });
});
const create = asyncHandler(async (req, res) => {
  const lead = await Lead.create(req.body);
  await recordActivity({ user: req.user, module: "leads", action: "Lead created", description: `Created lead ${lead.name}`, req });
  res.status(201).json({ lead });
});
const update = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate("property", "title propertyId price city")
    .populate("assignedAgent", "name email phone")
    .populate("followUps.by", "name email role");
  if (!lead) return res.status(404).json({ message: "Lead not found" });
  await recordActivity({ user: req.user, module: "leads", action: "Lead updated", description: `Updated lead ${lead.name}`, req });
  res.json({ lead });
});
const addNote = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead not found" });
  lead.followUps.push({
    kind: req.body.kind || "note",
    note: req.body.note,
    durationMin: req.body.durationMin,
    date: req.body.date || new Date(),
    by: req.user._id,
  });
  if (req.body.nextFollowUp) lead.nextFollowUp = req.body.nextFollowUp;
  if (req.body.notes) lead.notes = req.body.notes;
  await lead.save();
  await lead.populate("followUps.by", "name email role");
  res.json({ lead });
});
const convert = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead not found" });
  let customer = await User.findOne({ email: lead.email });
  if (!customer && lead.email) customer = await User.create({ name: lead.name, email: lead.email, phone: lead.phone, password: "Customer@123", role: "CUSTOMER" });
  lead.status = "Converted";
  if (customer) lead.convertedToCustomer = customer._id;
  await lead.save();
  await recordActivity({ user: req.user, module: "leads", action: "Lead converted", description: `Converted lead ${lead.name}`, req });
  res.json({ lead, customer });
});
const remove = asyncHandler(async (req, res) => {
  await Lead.findByIdAndDelete(req.params.id);
  await recordActivity({ user: req.user, module: "leads", action: "Lead deleted", description: `Deleted lead ${req.params.id}`, req });
  res.json({ message: "Lead deleted" });
});
module.exports = { list, getOne, create, update, addNote, convert, remove };
