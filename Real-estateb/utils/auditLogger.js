const ActivityLog = require("../models/activityLogModel");

const logActivity = async ({ user, agent, property, action, oldStatus, newStatus, req }) => {
  try {
    const ipAddress = req ? (req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress) : "unknown";
    const device = req ? req.headers["user-agent"] : "unknown";

    // Detect sender user context automatically if not manually provided
    let loggedUser = user;
    let loggedAgent = agent;

    if (req && req.user) {
      if (req.user.role === "buyer" && !loggedUser) {
        loggedUser = req.user.id;
      }
      if (req.user.role === "agent" && !loggedAgent) {
        loggedAgent = req.user.id;
      }
    }

    await ActivityLog.create({
      user: loggedUser,
      agent: loggedAgent,
      property,
      action,
      oldStatus: oldStatus || "",
      newStatus: newStatus || "",
      ipAddress,
      device
    });
  } catch (error) {
    console.error("Activity logging failed:", error.message);
  }
};

module.exports = { logActivity };
