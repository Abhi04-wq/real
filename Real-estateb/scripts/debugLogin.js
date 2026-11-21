/**
 * Diagnose "Invalid email or password" without exposing the password.
 *
 * Usage (from Real-estateb/):
 *   node scripts/debugLogin.js user@example.com "ThePasswordYouTyped"
 *
 * Prints: user found?, role, status, password-hash present?, password match?
 * Run this locally only — it touches the real DB via MONGO_URI in .env.
 */
require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.log('Usage: node scripts/debugLogin.js user@example.com "Password"');
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select("+password");
  if (!user) {
    console.log("RESULT: no user with that email in THIS database.");
    console.log("Check: wrong email, or MONGO_URI points to a different DB than where you registered.");
    process.exit(0);
  }

  console.log("RESULT: user found.");
  console.log("  role:", user.role);
  console.log("  status:", user.status);
  console.log("  hasPasswordHash:", Boolean(user.password && user.password.startsWith("$2")));

  if (String(user.status || "").toLowerCase() !== "active") {
    console.log(`CAUSE: account status is '${user.status}' — login is blocked until active.`);
    process.exit(0);
  }

  const match = await user.comparePassword(password);
  console.log("  passwordMatch:", match);
  if (!match) {
    console.log("CAUSE: password does not match the stored hash.");
    console.log("Fix: use /forgot-password in the app, or reset it from the Super Admin panel (Users -> reset password).");
  } else {
    console.log("Password is CORRECT — if the API still says invalid, the frontend is likely talking to a different backend/DB. Check VITE_BACKEND_URL and backend console.");
  }
  process.exit(0);
};

run().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
