const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Role hierarchy (higher number = more privilege). SUPER_ADMIN bypasses all checks.
const ROLE_LEVEL = {
  CUSTOMER: 1,
  OWNER: 2,
  AGENT: 3,
  MANAGER: 4,
  ADMIN: 5,
  SUPER_ADMIN: 6,
};

// Dashboard access map: which roles may view each dashboard route.
// - /customer      -> CUSTOMER only (+ higher roles can peek for support, except we keep strict per spec)
// - /agent         -> AGENT + MANAGER/ADMIN/SUPER_ADMIN
// - /super-admin   -> SUPER_ADMIN only
const DASHBOARD_ACCESS = {
  "/customer": ["CUSTOMER", "AGENT", "MANAGER", "ADMIN", "SUPER_ADMIN"],
  "/owner": ["OWNER", "MANAGER", "ADMIN", "SUPER_ADMIN"],
  "/agent": ["AGENT", "MANAGER", "ADMIN", "SUPER_ADMIN"],
  "/manager": ["MANAGER", "ADMIN", "SUPER_ADMIN"],
  "/admin": ["ADMIN", "SUPER_ADMIN"],
  "/super-admin": ["SUPER_ADMIN"],
};

// 401 when no/invalid token. Attaches full user (without password) to req.user.
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "propestate_jwt_secret_key_2026");
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authenticated. Account no longer exists." });
    }
    if (user.status !== "ACTIVE") {
      return res.status(403).json({ success: false, message: `Account is ${user.status.toLowerCase()}. Contact support.` });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
  }
};

// 403 when authenticated but role is insufficient.
// Usage: authorize("ADMIN", "SUPER_ADMIN") or authorize("AGENT")
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated. Please log in." });
    }
    // SUPER_ADMIN can access everything
    if (req.user.role === "SUPER_ADMIN") return next();
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden. You do not have permission." });
    }
    next();
  };
};

// Minimum-level check, e.g. requireLevel("MANAGER") allows MANAGER/ADMIN/SUPER_ADMIN
const requireLevel = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated. Please log in." });
    }
    const have = ROLE_LEVEL[req.user.role] || 0;
    const need = ROLE_LEVEL[minRole] || 0;
    if (have < need) {
      return res.status(403).json({ success: false, message: "Forbidden. Insufficient role level." });
    }
    next();
  };
};

module.exports = { protect, authorize, requireLevel, ROLE_LEVEL, DASHBOARD_ACCESS };
