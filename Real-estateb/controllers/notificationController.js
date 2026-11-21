const Notification = require("../models/Notification");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { buildQuery, paginate } = require("../utils/query");

const list = asyncHandler(async (req, res) => {
  const { filters, page, limit, skip, sort } = buildQuery(req, {
    searchFields: ["title", "message"],
    allowedFilters: ["type", "isRead", "recipient"],
  });
  const [result, unreadCount] = await Promise.all([
    paginate(Notification, filters, {
      page, limit, skip, sort,
      populate: [{ path: "recipient", select: "name email" }, { path: "sender", select: "name email" }],
    }),
    Notification.countDocuments({
      ...(req.user.role === "SUPER_ADMIN" ? {} : { $or: [{ recipient: req.user._id }, { recipient: null }] }),
      isRead: false,
    }),
  ]);
  res.json({ ...result, unreadCount });
});
const create = asyncHandler(async (req, res) => {
  const { recipient, recipients, broadcast, title, message, type } = req.body;
  let docs = [];
  if (broadcast) {
    docs = [{ recipient: null, sender: req.user._id, title, message, type: type || "system" }];
  } else if (recipients?.length) {
    docs = recipients.map((r) => ({ recipient: r, sender: req.user._id, title, message, type: type || "system" }));
  } else {
    docs = [{ recipient: recipient || null, sender: req.user._id, title, message, type: type || "system" }];
  }
  const created = await Notification.insertMany(docs);
  res.status(201).json({ notifications: created });
});
const markRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findById(req.params.id);
  if (!notif) return res.status(404).json({ message: "Notification not found" });
  let isRead = true;
  if (typeof req.body?.isRead === "boolean") {
    isRead = req.body.isRead;
  } else if (typeof req.body?.read === "boolean") {
    isRead = req.body.read;
  } else if (req.query?.unread === "true" || req.query?.isRead === "false") {
    isRead = false;
  } else if (req.query?.toggle === "true") {
    isRead = !notif.isRead;
  } else if (Object.keys(req.body || {}).length === 0) {
    // If empty payload sent to toggle endpoint, toggle the state
    isRead = !notif.isRead;
  }
  notif.isRead = isRead;
  await notif.save();
  res.json({ message: isRead ? "Marked as read" : "Marked as unread", notification: notif, isRead });
});
const markAllRead = asyncHandler(async (req, res) => {
  const filter = req.user.role === "SUPER_ADMIN" ? {} : { $or: [{ recipient: req.user._id }, { recipient: null }] };
  await Notification.updateMany(filter, { isRead: true });
  res.json({ message: "All notifications marked as read" });
});
const remove = asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});
module.exports = { list, create, markRead, markAllRead, remove };
