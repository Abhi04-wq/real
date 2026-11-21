const User = require("../models/User");
const Role = require("../models/Role");
const Settings = require("../models/Settings");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const { signToken, setAuthCookie } = require("../utils/tokens");
const { recordActivity } = require("../middleware/activity");
const sendEmail = require("../utils/sendEmail");

// Reset links expire after this many minutes (must match the ForgotPassword page text).
const RESET_TOKEN_EXPIRES_MIN = 30;

const signResetToken = (user) =>
  jwt.sign(
    { id: user._id, purpose: "password-reset" },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: `${RESET_TOKEN_EXPIRES_MIN}m` }
  );

const me = asyncHandler(async (req, res) => {
  const perms = req.user.roleRef?.permissions || (await Role.findOne({ name: req.user.role }).then((r) => r?.permissions || []));
  res.json({ user: req.user.toSafeJSON(), permissions: req.user.role === "SUPER_ADMIN" ? ["*"] : perms });
});

const register = asyncHandler(async (req, res) => {
  // Public self-registration: Buyer -> CUSTOMER, Seller -> OWNER (roles cannot be freely assigned).
  const name = req.body.name || req.body.fullName;
  const email = String(req.body.email || "").trim().toLowerCase();
  const { phone, password } = req.body;
  const acct = req.body.accountType || req.body.customerType;
  const role = acct === "seller" ? "OWNER" : "CUSTOMER";
  const settings = await Settings.findOne();
  if (settings?.systemSettings?.registrationEnabled === false)
    return res.status(403).json({ message: "New registrations are currently disabled" });
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already registered" });
  const user = await User.create({ name, email, phone, password, role });
  await recordActivity({ user: user._id, module: "users", action: "User registered", description: `Self-registered ${email}`, req });
  const token = signToken(user);
  setAuthCookie(res, token);
  res.status(201).json({ token, user: user.toSafeJSON() });
});

const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const { password } = req.body;
  const user = await User.findOne({ email }).select("+password").populate("roleRef");
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: "Invalid credentials" });
  if (String(user.status || "").toLowerCase() !== "active")
    return res.status(403).json({ message: "Account is disabled" });
  user.lastLogin = new Date();
  await user.save();
  const token = signToken(user);
  setAuthCookie(res, token);
  const perms = user.roleRef?.permissions || (await Role.findOne({ name: user.role }).then((r) => r?.permissions || []));
  res.json({ token, user: user.toSafeJSON(), permissions: user.role === "SUPER_ADMIN" ? ["*"] : perms });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { userId, newPassword } = req.body;
  const user = await User.findById(userId || req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.password = newPassword;
  await user.save();
  await recordActivity({ user: req.user, module: "users", action: "Password reset", description: `Reset password for ${user.email}`, req });
  res.json({ message: "Password updated" });
});

// Public: request a password reset link. Always returns success so
// attackers cannot enumerate registered emails.
const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const user = await User.findOne({ email });
  if (user && String(user.status || "").toLowerCase() === "active") {
    const token = signResetToken(user);
    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim();
    const resetLink = `${clientUrl.replace(/\/$/, "")}/reset-password?token=${token}`;
    try {
      await sendEmail({
        email: user.email,
        subject: "Reset your PrimeNest password",
        message: `Reset your password using this link (valid ${RESET_TOKEN_EXPIRES_MIN} minutes): ${resetLink}`,
        html: `<p>Hello ${user.name || ""},</p><p>Click the link below to set a new password. It expires in ${RESET_TOKEN_EXPIRES_MIN} minutes.</p><p><a href="${resetLink}">Reset password</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
      });
    } catch (e) {
      console.error("Forgot-password email failed:", e);
      // In development, surface the real SMTP error so the frontend
      // doesn't falsely report "reset link has been sent".
      if ((process.env.NODE_ENV || "development") !== "production") {
        return res.status(500).json({ message: `Email send failed: ${e.message}` });
      }
    }
    await recordActivity({ user: user._id, module: "users", action: "Password reset requested", description: `Reset link requested for ${user.email}`, req });
  }
  res.json({ message: "If an account exists for that email, a reset link has been sent." });
});

// Public: set a new password using a forgot-password token.
const resetPasswordWithToken = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
  } catch {
    return res.status(400).json({ message: "Reset link is invalid or has expired." });
  }
  if (!decoded || decoded.purpose !== "password-reset" || !decoded.id) {
    return res.status(400).json({ message: "Reset link is invalid or has expired." });
  }
  const user = await User.findById(decoded.id);
  if (!user || String(user.status || "").toLowerCase() !== "active") {
    return res.status(400).json({ message: "Reset link is invalid or has expired." });
  }
  user.password = password;
  await user.save();
  await recordActivity({ user: user._id, module: "users", action: "Password reset", description: `Password changed via reset link for ${user.email}`, req });
  res.json({ message: "Password has been reset. Please sign in." });
});

module.exports = { me, register, login, logout, resetPassword, forgotPassword, resetPasswordWithToken };
