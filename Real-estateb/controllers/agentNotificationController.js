const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../middleware/agentScope");
const { buildQuery, paginate } = require("../utils/query");

// Agent notification center: forced to own + broadcast only (data isolation)
const list = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const filters = req.user.role === "SUPER_ADMIN" ? {} : { $or: [{ recipient: req.user._id }, { recipient: null }] };
  if (req.query.type) filters.type = req.query.type;
  const [data, total, unread] = await Promise.all([
    Notification.find(filters).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Notification.countDocuments(filters),
    Notification.countDocuments({ ...filters, isRead: false }),
  ]);
  ok(res, { data, total, page, limit, totalPages: Math.ceil(total / limit) || 1, unread }, "Notifications");
});

module.exports = { list };
