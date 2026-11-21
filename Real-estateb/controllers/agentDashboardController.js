const Property = require("../models/Property");
const Lead = require("../models/Lead");
const Booking = require("../models/Booking");
const Commission = require("../models/Commission");
const asyncHandler = require("../utils/asyncHandler");
const { agentScope, ok } = require("../middleware/agentScope");

// GET /api/agent/dashboard — strict agent_id isolation on every query
const stats = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const scope = agentScope(req); // { assignedAgent: me } or {} for SUPER_ADMIN
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

  // Six months window for actual historical activity trend
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    activeListings,
    myLeads,
    visitsToday,
    commissionAgg,
    followUpsDue,
    todaysBookings,
    recentLeads,
    pendingCommissions,
    bookingMonthly,
    leadMonthly,
    leadSourcesAgg,
    pipelineStagesAgg
  ] = await Promise.all([
    Property.countDocuments({ ...scope, status: "Available", approvalStatus: "approved" }),
    Lead.find({ assignedAgent: req.user.role === "SUPER_ADMIN" ? { $exists: true } : me }).sort({ createdAt: -1 }).limit(50).populate("property", "title price"),
    Booking.countDocuments({ ...(req.user.role === "SUPER_ADMIN" ? {} : { agent: me }), bookingDate: { $gte: today, $lt: tomorrow }, status: { $in: ["Pending", "Confirmed"] } }),
    Commission.aggregate([
      { $match: req.user.role === "SUPER_ADMIN" ? {} : { agent: me } },
      { $group: { _id: "$status", total: { $sum: "$amount" } } },
    ]),
    Lead.find({ assignedAgent: req.user.role === "SUPER_ADMIN" ? { $exists: true } : me, nextFollowUp: { $lte: tomorrow } }).sort({ nextFollowUp: 1 }).limit(10).select("name phone status nextFollowUp"),
    Booking.find({ ...(req.user.role === "SUPER_ADMIN" ? {} : { agent: me }), bookingDate: { $gte: today, $lt: tomorrow } }).populate("user property", "name title").sort({ bookingDate: 1 }).limit(10),
    Lead.find({ assignedAgent: req.user.role === "SUPER_ADMIN" ? { $exists: true } : me }).sort({ createdAt: -1 }).limit(5).select("name status source createdAt"),
    Commission.find(req.user.role === "SUPER_ADMIN" ? {} : { agent: me }).sort({ createdAt: -1 }).limit(5).populate("property", "title"),
    Booking.aggregate([
      {
        $match: {
          ...(req.user.role === "SUPER_ADMIN" ? {} : { agent: me }),
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      }
    ]),
    Lead.aggregate([
      {
        $match: {
          assignedAgent: req.user.role === "SUPER_ADMIN" ? { $exists: true } : me,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      }
    ]),
    Lead.aggregate([
      {
        $match: {
          assignedAgent: req.user.role === "SUPER_ADMIN" ? { $exists: true } : me
        }
      },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]),
    Lead.aggregate([
      {
        $match: {
          assignedAgent: req.user.role === "SUPER_ADMIN" ? { $exists: true } : me
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  // Construct actual 6-month chronological flow from database aggregates
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const activityFlow = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const y = d.getFullYear();
    const m = d.getMonth() + 1; // 1-12
    const monthLabel = monthNames[m - 1];

    const visitMatch = (bookingMonthly || []).find((b) => b._id.year === y && b._id.month === m);
    const leadMatch = (leadMonthly || []).find((l) => l._id.year === y && l._id.month === m);

    activityFlow.push({
      month: `${monthLabel}${y !== today.getFullYear() ? ` '${String(y).slice(2)}` : ""}`,
      Visits: visitMatch ? visitMatch.count : 0,
      Inquiries: leadMatch ? leadMatch.count : 0,
    });
  }

  const leadSources = (leadSourcesAgg || []).map((s) => ({
    name: s._id || "Other",
    value: s.count,
  }));

  const pipelineStages = (pipelineStagesAgg || []).map((s) => ({
    stage: s._id || "Unclassified",
    count: s.count,
  }));

  const byStatus = Object.fromEntries(commissionAgg.map((c) => [c._id, c.total]));
  ok(res, {
    cards: {
      activeListings,
      totalLeads: myLeads.length,
      newLeads: myLeads.filter((l) => l.status === "New").length,
      visitsToday,
      projectedCommission: (byStatus.Pending || 0) + (byStatus.Approved || 0),
      earnedCommission: byStatus.Paid || 0,
    },
    agenda: { followUpsDue, todaysBookings },
    recentLeads,
    pendingCommissions,
    charts: {
      activityFlow,
      leadSources,
      pipelineStages,
    },
  }, "Agent dashboard");
});

module.exports = { stats };
