const Lead = require("../models/Lead");
const Property = require("../models/Property");
const asyncHandler = require("../utils/asyncHandler");
const { buildQuery, paginate } = require("../utils/query");
const { ok, fail } = require("../middleware/agentScope");
const { recordActivity } = require("../middleware/activity");

const STAGES = ["New", "Contacted", "Showing Scheduled", "Closed", "Lost"];

const scope = (req) => (req.user.role === "SUPER_ADMIN" ? {} : { assignedAgent: req.user._id });

const pipeline = asyncHandler(async (req, res) => {
  const leads = await Lead.find(scope(req)).populate("property", "title price city images").populate("assignedAgent", "name email").sort({ createdAt: -1 }).lean();
  const columns = STAGES.map((s) => ({ stage: s, count: leads.filter((l) => l.status === s).length, leads: leads.filter((l) => l.status === s) }));
  // legacy statuses fold into nearest stage so nothing disappears
  const fold = {
    "Follow-up": "Contacted",
    Interested: "Contacted",
    Negotiation: "Showing Scheduled",
    "Under Contract": "Closed",
    Converted: "Closed"
  };
  for (const l of leads) {
    if (!STAGES.includes(l.status)) {
      const col = columns.find((c) => c.stage === (fold[l.status] || "Contacted"));
      if (col) {
        col.leads.push(l);
        col.count += 1;
      }
    }
  }
  ok(res, { columns }, "Lead pipeline");
});

const getOne = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, ...scope(req) })
    .populate("property", "title price city images propertyId")
    .populate("followUps.by", "name role email");
  if (!lead) return fail(res, 404, "Lead not found");
  const matched = lead.property ? [] : await Property.find({ status: "Available", approvalStatus: "approved" }).select("title price city images").limit(5);
  ok(res, { lead, matchedProperties: matched }, "Lead details");
});

const create = asyncHandler(async (req, res) => {
  const lead = await Lead.create({ ...req.body, assignedAgent: req.user._id, status: "New" });
  await recordActivity({ user: req.user, module: "leads", action: "Lead logged", description: `Agent logged lead ${lead.name}`, req });
  ok(res, { lead }, "Lead logged");
});

const move = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!STAGES.includes(status)) return fail(res, 400, `Invalid stage. Allowed: ${STAGES.join(", ")}`);
  const lead = await Lead.findOneAndUpdate({ _id: req.params.id, ...scope(req) }, { status }, { new: true });
  if (!lead) return fail(res, 404, "Lead not found");
  await recordActivity({ user: req.user, module: "leads", action: "Lead moved", description: `Lead ${lead.name} -> ${status}`, req });
  ok(res, { lead }, `Lead moved to ${status}`);
});

const logActivity = asyncHandler(async (req, res) => {
  const { kind = "note", note, durationMin, date, nextFollowUp } = req.body;
  if (!note) return fail(res, 400, "Note/call summary is required");
  const lead = await Lead.findOne({ _id: req.params.id, ...scope(req) });
  if (!lead) return fail(res, 404, "Lead not found");
  lead.followUps.push({ kind, note, durationMin, date: date || new Date(), by: req.user._id });
  if (nextFollowUp) lead.nextFollowUp = nextFollowUp;
  await lead.save();
  await lead.populate("followUps.by", "name role email");
  ok(res, { lead }, "Timeline updated");
});

module.exports = { pipeline, getOne, create, move, logActivity, STAGES };
