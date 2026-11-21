require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/userModel");

const run = async () => {
  const [fullName, email, phone, password] = ["Abhijit kayal", "kayalabhi04@gmail.com", "9883756335", "Abhijit@2004"];

  if (!fullName || !email || !phone || !password) {
    console.log('Usage: node scripts/createSuperAdmin.js "Full Name" email phone "PasswordMin8"');
    process.exit(1);
  }
  if (String(password).length < 8) {
    console.log("Password must be at least 8 characters.");
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existing) {
    console.log("An account with this email already exists with role:", existing.role);
    process.exit(1);
  }

  const user = await User.create({
    fullName: String(fullName).trim(),
    email: String(email).toLowerCase().trim(),
    phone: String(phone).trim(),
    password, // hashed by pre-save hook — never stored plain
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    isEmailVerified: true,
  });

  console.log("SUPER_ADMIN created:");
  console.log("  id:", user._id.toString());
  console.log("  email:", user.email);
  console.log("Now log in at /login — you will land on /super-admin.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
