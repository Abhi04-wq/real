const { protect } = require("./auth");

// Client portal gate: buyers (CUSTOMER), sellers (OWNER), SUPER_ADMIN passthrough.
const requireClient = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });
  if (["CUSTOMER", "OWNER", "AGENT", "MANAGER", "ADMIN", "SUPER_ADMIN", "STAFF"].includes(req.user.role)) return next();
  return res.status(403).json({ success: false, message: "Forbidden: client portal access only" });
};

module.exports = { protect, requireClient };
