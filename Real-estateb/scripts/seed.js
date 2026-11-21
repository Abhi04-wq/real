require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Role = require("../models/Role");
const PropertyType = require("../models/PropertyType");
const Settings = require("../models/Settings");

const PERMS = [
  "users.view", "users.create", "users.edit", "users.delete",
  "properties.view", "properties.create", "properties.edit", "properties.delete", "properties.approve",
  "leads.view", "leads.create", "leads.edit", "leads.delete", "leads.convert", "leads.note",
  "bookings.view", "bookings.edit", "bookings.approve", "bookings.assign",
  "transactions.view", "transactions.manage",
  "reports.view", "settings.manage", "notifications.send",
];

// Admin panel (operations): sees everything, edits nothing — accept/reject only.
const ADMIN_PERMS = [
  "users.view",
  "properties.view", "properties.approve",
  "leads.view", "leads.create", "leads.convert", "leads.note",
  "bookings.view", "bookings.approve", "bookings.assign",
  "transactions.view", "transactions.manage",
  "reports.view",
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/propestate");
  console.log("Seeding...");

  const roles = [
    { name: "SUPER_ADMIN", description: "Full access", permissions: ["*"] },
    { name: "ADMIN", description: "Admin access (view + accept/reject)", permissions: ADMIN_PERMS },
    { name: "MANAGER", description: "Manager", permissions: ["users.view", "properties.view", "properties.edit", "leads.view", "leads.edit", "bookings.view", "bookings.edit", "reports.view"] },
    { name: "AGENT", description: "Agent", permissions: ["properties.view", "leads.view", "leads.edit", "bookings.view"] },
    { name: "STAFF", description: "Support staff", permissions: ["leads.view", "bookings.view"] },
  ];
  for (const r of roles) await Role.updateOne({ name: r.name }, { $set: r }, { upsert: true });

  const email = process.env.SEED_ADMIN_EMAIL || "superadmin@primenest.com";
  const pass = process.env.SEED_ADMIN_PASSWORD || "SuperAdmin@123";
  const superRole = await Role.findOne({ name: "SUPER_ADMIN" });
  let admin = await User.findOne({ email }).select("+password");
  if (!admin) {
    admin = await User.create({ name: "Super Admin", email, password: pass, role: "SUPER_ADMIN", roleRef: superRole._id, status: "active", emailVerified: true });
    console.log(`Super admin created: ${email} / ${pass}`);
  } else console.log("Super admin exists:", email);

  const defaults = ["Apartment", "Villa", "House", "Plot", "Office", "Shop", "Warehouse", "Commercial Building", "Land", "Farm House"];
  for (const name of defaults) {
    await PropertyType.updateOne({ name }, { $setOnInsert: { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), description: `${name} properties`, status: "active" } }, { upsert: true });
  }
  if (!(await Settings.findOne())) await Settings.create({});
  console.log("Seed complete");
  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
