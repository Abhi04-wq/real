const ActivityLog = require("../models/ActivityLog");

const logActivity = (module, action) => async (req, _res, next) => {
  try {
    await ActivityLog.create({
      user: req.user?._id,
      module,
      action,
      description: `${action} by ${req.user?.email || "system"} ${req.method} ${req.originalUrl}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || "",
    });
  } catch (e) {
    console.error("Activity log failed:", e.message);
  }
  next();
};

const recordActivity = async ({ user, module, action, description, req }) => {
  try {
    await ActivityLog.create({
      user: user?._id || user,
      module,
      action,
      description: description || action,
      ipAddress: req?.ip || "",
      userAgent: req?.headers?.["user-agent"] || "",
    });
  } catch (e) {
    console.error("Activity log failed:", e.message);
  }
};

module.exports = { logActivity, recordActivity };
