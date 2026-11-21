const User = require("../models/User");
const Agent = require("../models/Agent");
const Property = require("../models/Property");
const PropertyType = require("../models/PropertyType");
const Lead = require("../models/Lead");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");
const Commission = require("../models/Commission");
const ActivityLog = require("../models/ActivityLog");
const asyncHandler = require("../utils/asyncHandler");

function rangeFor(preset, from, to) {
  const now = new Date();
  if (from || to) return { gte: from ? new Date(from) : new Date(0), lte: to ? new Date(to) : now };
  const start = new Date(now);
  if (preset === "today") start.setHours(0, 0, 0, 0);
  else if (preset === "week") start.setDate(now.getDate() - 7);
  else if (preset === "month") start.setMonth(now.getMonth() - 1);
  else if (preset === "year") start.setFullYear(now.getFullYear() - 1);
  else if (preset === "all") return null;
  else return null;
  return { gte: start, lte: now };
}

const stats = asyncHandler(async (req, res) => {
  const { preset = "all", from, to } = req.query;
  const range = rangeFor(preset, from, to);
  const dateFilter = range ? { createdAt: { $gte: range.gte, $lte: range.lte } } : {};

  const [
    totalUsers,
    totalAgents,
    totalProperties,
    availableProperties,
    soldProperties,
    rentedProperties,
    pendingApprovals,
    totalLeads,
    newLeads,
    activeLeads,
    totalBookings,
    pendingBookings,
    completedBookings,
    totalTxns,
    revenueAgg,
    portfolioAgg,
    pendingPayments,
    propertyByStatus,
    leadsByStatus,
    bookingsByStatus,
  ] = await Promise.all([
    User.countDocuments(),
    Agent.countDocuments(),
    Property.countDocuments(),
    Property.countDocuments({ status: "Available" }),
    Property.countDocuments({ status: "Sold" }),
    Property.countDocuments({ status: "Rented" }),
    Property.countDocuments({ approvalStatus: "pending" }),
    Lead.countDocuments(dateFilter),
    Lead.countDocuments({ ...dateFilter, status: "New" }),
    Lead.countDocuments({ ...dateFilter, status: { $nin: ["Converted", "Lost"] } }),
    Booking.countDocuments(dateFilter),
    Booking.countDocuments({ ...dateFilter, status: "Pending" }),
    Booking.countDocuments({ ...dateFilter, status: "Completed" }),
    Transaction.countDocuments(dateFilter),
    Transaction.aggregate([
      ...(range ? [{ $match: { createdAt: { $gte: range.gte, $lte: range.lte }, status: "Paid" } }] : [{ $match: { status: "Paid" } }]),
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Property.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]),
    Transaction.countDocuments({ ...dateFilter, status: "Pending" }),
    Property.aggregate([
      ...(range ? [{ $match: { createdAt: { $gte: range.gte, $lte: range.lte } } }] : []),
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      ...(range ? [{ $match: { createdAt: { $gte: range.gte, $lte: range.lte } } }] : []),
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Booking.aggregate([
      ...(range ? [{ $match: { createdAt: { $gte: range.gte, $lte: range.lte } } }] : []),
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  // Monthly revenue & sales timeline (12 months)
  const twelveAgo = new Date();
  twelveAgo.setMonth(twelveAgo.getMonth() - 11);
  twelveAgo.setDate(1);

  const [monthlyRevenue, propertyGrowth, salesByMonth] = await Promise.all([
    Transaction.aggregate([
      { $match: { status: "Paid", createdAt: { $gte: twelveAgo } } },
      { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
    Property.aggregate([
      { $match: { createdAt: { $gte: twelveAgo } } },
      { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
    Booking.aggregate([
      { $match: { createdAt: { $gte: twelveAgo } } },
      { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, count: { $sum: 1 }, sales: { $sum: "$amount" } } },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
  ]);

  // Property type distribution
  const typeDist = await Property.aggregate([
    { $group: { _id: "$propertyType", count: { $sum: 1 }, totalValue: { $sum: "$price" } } },
    { $sort: { count: -1 } },
  ]);
  const typeIds = typeDist.map((t) => t._id).filter(Boolean);
  const types = await PropertyType.find({ _id: { $in: typeIds } }).select("name");
  const typeMap = Object.fromEntries(types.map((t) => [String(t._id), t.name]));
  const propertyTypeDistribution = typeDist.map((t) => ({
    name: (t._id && typeMap[String(t._id)]) || "Residential",
    count: t.count,
    totalValue: t.totalValue || 0,
    share: totalProperties > 0 ? Math.round((t.count / totalProperties) * 100) : 0,
  }));

  // Geographic city aggregation
  const cityAgg = await Property.aggregate([
    {
      $group: {
        _id: { $ifNull: ["$city", "Other"] },
        count: { $sum: 1 },
        totalValuation: { $sum: "$price" },
        activeCount: { $sum: { $cond: [{ $eq: ["$status", "Available"] }, 1, 0] } },
        avgPrice: { $avg: "$price" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  // Featured property & Top properties
  let featuredProperty = await Property.findOne({ isFeatured: true, isPublished: { $ne: false } })
    .populate("propertyType", "name")
    .populate("assignedAgent", "name email phone profileImage")
    .populate("owner", "name email phone");
  if (!featuredProperty) {
    featuredProperty = await Property.findOne({ isPublished: { $ne: false } })
      .sort({ price: -1 })
      .populate("propertyType", "name")
      .populate("assignedAgent", "name email phone profileImage")
      .populate("owner", "name email phone");
  }

  const topProperties = await Property.find({ isPublished: { $ne: false } })
    .sort({ price: -1 })
    .limit(6)
    .populate("propertyType", "name")
    .populate("assignedAgent", "name email phone profileImage")
    .select("title propertyId price city state address images status avgRating totalReviews bedrooms bathrooms area listingType");

  // Agent performance
  const agents = await Agent.find().populate("user", "name email phone profileImage").lean();
  const performance = await Promise.all(
    agents.map(async (a) => {
      const uid = a.user?._id;
      if (!uid) return null;
      const [assignedLeads, convertedLeads, bookings, commissions, assignedProps] = await Promise.all([
        Lead.countDocuments({ assignedAgent: uid }),
        Lead.countDocuments({ assignedAgent: uid, status: "Converted" }),
        Booking.find({ agent: uid }).lean(),
        Commission.find({ agent: uid }).lean(),
        Property.countDocuments({ assignedAgent: uid }),
      ]);
      const sales = bookings.filter((b) => b.status === "Completed").reduce((s, b) => s + (b.amount || 0), 0);
      return {
        _id: a._id,
        name: a.user?.name || "Agent",
        email: a.user?.email || "",
        phone: a.user?.phone || "",
        avatar: a.user?.profileImage || "",
        specialization: a.specialization || "Luxury Residential",
        assignedLeads,
        convertedLeads,
        conversionRate: assignedLeads ? Math.round((convertedLeads / assignedLeads) * 100) : 0,
        properties: assignedProps,
        bookings: bookings.length,
        sales,
        commission: commissions.reduce((s, c) => s + (c.amount || 0), 0),
      };
    })
  );

  const [recentUsers, recentProperties, recentLeads, recentBookings, recentTransactions, recentActivity] = await Promise.all([
    User.find().sort({ createdAt: -1 }).limit(6).select("name email phone role createdAt"),
    Property.find().sort({ createdAt: -1 }).limit(6).populate("propertyType", "name").select("title propertyId price city status images createdAt"),
    Lead.find().sort({ createdAt: -1 }).limit(6).populate("assignedAgent", "name").select("name email phone status source createdAt"),
    Booking.find().sort({ createdAt: -1 }).limit(8).populate("user", "name email phone fullName").populate("property", "title propertyId city price images").populate("agent", "name email phone").select("bookingId status tourType bookingDate amount timeline createdAt"),
    Transaction.find().sort({ createdAt: -1 }).limit(10).populate("user", "name email phone").populate("property", "title propertyId city price").select("transactionId amount status paymentMethod transactionDate createdAt"),
    ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate("user", "name email"),
  ]);

  res.json({
    cards: {
      totalUsers,
      totalAgents,
      totalProperties,
      availableProperties,
      soldProperties,
      rentedProperties,
      pendingApprovals,
      totalLeads,
      newLeads,
      activeLeads,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalSales: completedBookings,
      totalRevenue: revenueAgg[0]?.total || 0,
      totalPortfolioValue: portfolioAgg[0]?.total || 0,
      pendingPayments,
      totalTransactions: totalTxns,
      occupancyRate: totalProperties > 0 ? ((soldProperties + rentedProperties) / totalProperties * 100).toFixed(1) : "0.0",
    },
    charts: {
      monthlyRevenue,
      propertyGrowth,
      salesByMonth,
      leadsByStatus,
      propertyByStatus,
      bookingsByStatus,
      propertyTypeDistribution,
      cityDistribution: cityAgg,
    },
    featuredProperty,
    topProperties,
    agentPerformance: performance.filter(Boolean).sort((a, b) => b.sales - a.sales || b.bookings - a.bookings).slice(0, 10),
    recent: {
      recentUsers,
      recentProperties,
      recentLeads,
      recentBookings,
      recentTransactions,
      recentActivity,
    },
  });
});

module.exports = { stats };
