const { protect, requirePerm } = require("./auth");

// Allows SUPER_ADMIN (full access), ADMIN and MANAGER into the operations panel.
// Fine-grained access is still enforced per-route by requirePerm().
const requireOpsRole = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (["SUPER_ADMIN", "ADMIN", "MANAGER", "AGENT"].includes(req.user.role)) return next();
  return res.status(403).json({ message: "Forbidden: Admin/Manager panel access only" });
};

const ops = [protect, requireOpsRole];

module.exports = { protect, requireOpsRole, ops, requirePerm };
