const express = require("express");
const { me, register, login, logout, resetPassword, forgotPassword, resetPasswordWithToken } = require("../controllers/authController");
const { protect, requirePerm } = require("../middleware/auth");
const { validate } = require("../middleware/common");
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordTokenSchema } = require("../utils/validators");
const router = express.Router();
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", protect, me);
router.post("/register", validate(registerSchema), register);
// Public: email a 30-minute reset link (generic response, no email enumeration).
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
// Dual-purpose: token payload -> public self-service reset; otherwise the
// existing staff/admin reset (requires auth + users.edit permission).
const resetPasswordRouter = (req, res, next) => {
  if (req.body && req.body.token) {
    return validate(resetPasswordTokenSchema)(req, res, () => resetPasswordWithToken(req, res, next));
  }
  return next();
};
router.post("/reset-password", resetPasswordRouter, protect, requirePerm("users.edit"), resetPassword);
module.exports = router;
