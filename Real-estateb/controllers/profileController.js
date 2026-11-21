const User = require("../models/User");
const Agent = require("../models/Agent");
const Role = require("../models/Role");
const asyncHandler = require("../utils/asyncHandler");
const { recordActivity } = require("../middleware/activity");

const getProfile = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  let agent = null;
  try {
    agent = await Agent.findOne({ user: req.user._id }).select("employeeId department designation joiningDate commissionRate status");
  } catch (e) {
    console.error("getProfile: Agent lookup failed:", e.message);
  }
  let perms = [];
  try {
    perms = req.user.roleRef?.permissions || (await Role.findOne({ name: req.user.role }).then((r) => r?.permissions || []));
  } catch (e) {
    console.error("getProfile: Role lookup failed:", e.message);
  }
  const safe = typeof req.user.toSafeJSON === "function" ? req.user.toSafeJSON() : (() => { const o = req.user.toObject ? req.user.toObject() : { ...req.user }; delete o.password; return o; })();
  res.json({ user: safe, employee: agent, permissions: req.user.role === "SUPER_ADMIN" ? ["*"] : perms });
});

const updateProfile = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });
  const { name, phone, profileImage } = req.body; // role/permissions deliberately NOT editable here
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { ...(name !== undefined ? { name } : {}), ...(phone !== undefined ? { phone } : {}), ...(profileImage !== undefined ? { profileImage } : {}) },
    { new: true }
  );
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  if (profileImage !== undefined) {
    await Agent.findOneAndUpdate({ user: req.user._id }, { profileImage });
  }
  await recordActivity({ user: req.user, module: "users", action: "Profile updated", description: `Updated own profile`, req });
  res.json({ success: true, user: user.toSafeJSON(), data: { user: user.toSafeJSON() } });
});

const changePassword = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  const user = await User.findById(req.user._id).select("+password");
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!(await user.comparePassword(currentPassword || "")))
    return res.status(400).json({ message: "Current password is incorrect" });
  user.password = newPassword;
  await user.save();
  await recordActivity({ user: req.user, module: "users", action: "Password changed", description: "Changed own password", req });
  res.json({ message: "Password changed successfully" });
});

module.exports = { getProfile, updateProfile, changePassword };
