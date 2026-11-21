const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Role = require("../models/Role");

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token || (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Not authenticated" });
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  const user = await User.findById(decoded.id).populate("roleRef");
  if (!user) return res.status(401).json({ message: "User no longer exists" });
  if (String(user.status || "").toLowerCase() !== "active")
    return res.status(403).json({ message: "Account is disabled" });
  req.user = user;
  next();
});

// usage: requireAny('leads.convert', 'leads.edit') — passes if user has ANY listed perm.
const requireAny = (...permissions) => async (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role === "SUPER_ADMIN") return next();
  const perms =
    req.user.roleRef?.permissions ||
    (await Role.findOne({ name: req.user.role }).then((r) => r?.permissions || []));
  if (perms.includes("*") || permissions.some((p) => perms.includes(p))) return next();
  return res.status(403).json({ message: `Forbidden: missing permission ${permissions.join(" or ")}` });
};

// usage: requireDecisionOrEdit({ decision: 'bookings.approve', assign: 'bookings.assign', edit: 'bookings.edit' })
// Approve/reject payloads need the decision perm (or edit, which implies it);
// agent assignment / status handling needs the assign perm (or edit);
// all other writes need the edit perm.
const requireDecisionOrEdit = ({ decision, edit, assign }) => async (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role === "SUPER_ADMIN") return next();
  const b = req.body || {};
  const wantsDecision =
    b.action === "approve" || b.action === "reject" ||
    b.approvalStatus === "Approved" || b.approvalStatus === "Rejected" ||
    b.paymentStatus === "Paid" ||
    ["Paid", "Cancelled", "Failed"].includes(b.status);
  const wantsOperational =
    !wantsDecision &&
    (b.agent !== undefined || (typeof b.status === "string" && b.status.length > 0));
  const perms =
    req.user.roleRef?.permissions ||
    (await Role.findOne({ name: req.user.role }).then((r) => r?.permissions || []));
  if (perms.includes("*")) return next();
  if (wantsDecision && (perms.includes(decision) || perms.includes(edit))) return next();
  if (wantsOperational && (perms.includes(edit) || (assign && perms.includes(assign)))) return next();
  if (!wantsDecision && !wantsOperational && perms.includes(edit)) return next();
  const need = wantsDecision ? decision : wantsOperational ? (assign || edit) : edit;
  return res.status(403).json({ message: `Forbidden: missing permission ${need}` });
};
const requirePerm = (permission) => async (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role === "SUPER_ADMIN") return next(); // full access
  const perms =
    req.user.roleRef?.permissions ||
    (await Role.findOne({ name: req.user.role }).then((r) => r?.permissions || []));
  if (!perms.includes(permission))
    return res.status(403).json({ message: `Forbidden: missing permission ${permission}` });
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role === "SUPER_ADMIN") return next();
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  next();
};

module.exports = { protect, requirePerm, requireRole, requireDecisionOrEdit, requireAny };
