const Commission = require("../models/Commission");
const Agent = require("../models/Agent");
const asyncHandler = require("../utils/asyncHandler");
const { buildQuery, paginate } = require("../utils/query");
const { ok, fail } = require("../middleware/agentScope");
const { recordActivity } = require("../middleware/activity");

const scope = (req) => (req.user.role === "SUPER_ADMIN" ? {} : { agent: req.user._id });

const ledger = asyncHandler(async (req, res) => {
  const { filters, page, limit, skip, sort } = buildQuery(req, {
    searchFields: [],
    allowedFilters: ["status"],
  });
  const result = await paginate(Commission, { ...scope(req), ...filters }, {
    page, limit, skip, sort,
    populate: [{ path: "property", select: "title propertyId price" }, { path: "transaction", select: "transactionId amount status" }],
  });
  const totals = await Commission.aggregate([
    { $match: scope(req) },
    { $group: { _id: "$status", total: { $sum: "$amount" } } },
  ]);
  const byStatus = Object.fromEntries(totals.map((t) => [t._id, t.total]));
  const profile = await Agent.findOne({ user: req.user._id }).select("commissionRate");
  ok(res, {
    ...result,
    summary: {
      earned: byStatus.Paid || 0,
      pendingApproval: (byStatus.Pending || 0) + (byStatus.Approved || 0),
      paid: byStatus.Paid || 0,
      splitRate: profile?.commissionRate ?? null,
    },
  }, "Commission ledger");
});

const requestPayout = asyncHandler(async (req, res) => {
  const c = await Commission.findOne({ _id: req.params.id, ...scope(req) });
  if (!c) return fail(res, 404, "Commission not found");
  if (c.status === "Paid") return fail(res, 400, "Already paid");
  c.payoutRequested = true;
  c.payoutRequestedAt = new Date();
  await c.save();
  await recordActivity({ user: req.user, module: "commissions", action: "Payout requested", description: `Requested payout for ${c._id}`, req });
  ok(res, { commission: c }, "Payout requested. Admin will review.");
});

module.exports = { ledger, requestPayout };
