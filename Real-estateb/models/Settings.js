const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: "PrimeNest Realty" },
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    email: { type: String, default: "admin@primenest.com" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    website: { type: String, default: "" },
    tagline: { type: String, default: "Luxury Estates & Curated Residences" },
    reraNumber: { type: String, default: "RERA/PRM/2026/0891" },
    taxNumber: { type: String, default: "" },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
    currency: { type: String, default: "INR" },
    timezone: { type: String, default: "Asia/Kolkata" },
    emailSettings: {
      smtpHost: { type: String, default: "" },
      smtpPort: { type: Number, default: 587 },
      smtpUser: { type: String, default: "" },
      smtpPass: { type: String, default: "" },
      senderEmail: { type: String, default: "" },
    },
    notificationSettings: {
      emailNotifications: { type: Boolean, default: true },
      bookingNotifications: { type: Boolean, default: true },
      leadNotifications: { type: Boolean, default: true },
      paymentNotifications: { type: Boolean, default: true },
      propertyApprovalNotifications: { type: Boolean, default: true },
    },
    systemSettings: {
      maintenanceMode: { type: Boolean, default: false },
      registrationEnabled: { type: Boolean, default: true },
      propertyApprovalRequired: { type: Boolean, default: true },
      defaultCommission: { type: Number, default: 2 },
      defaultCurrency: { type: String, default: "INR" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
