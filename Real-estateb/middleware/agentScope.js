const { protect } = require("./auth");

// Agent portal gate: AGENT role (SUPER_ADMIN passes through for support).
// Ownership isolation is enforced per-controller via agentScope().
const requireAgent = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });
  if (["AGENT", "SUPER_ADMIN"].includes(req.user.role)) return next();
  return res.status(403).json({ success: false, message: "Forbidden: agent portal access only" });
};

// Returns a Mongo filter scoping a collection to the logged-in agent.
// SUPER_ADMIN sees everything (support/debug); agents see only their own rows.
const agentScope = (req, field = "assignedAgent") => {
  if (req.user.role === "SUPER_ADMIN") return {};
  return { [field]: req.user._id };
};

const ok = (res, data, message = "OK") => res.json({ success: true, message, data });
const fail = (res, status, message) => res.status(status).json({ success: false, message });

module.exports = { protect, requireAgent, agentScope, ok, fail };
