const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    employeeId: { type: String, unique: true, index: true },
    department: { type: String, default: "Sales" },
    designation: { type: String, default: "Agent" },
    joiningDate: { type: Date, default: Date.now },
    assignedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
    assignedLeads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lead" }],
    commissionRate: { type: Number, default: 2 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    profileImage: { type: String, default: "" },
    bio: { type: String, default: "" },
    licenseNumber: { type: String, default: "" },
    socials: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
    notificationPrefs: {
      sms: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

agentSchema.pre("save", async function () {
  if (!this.employeeId) {
    const count = await mongoose.model("Agent").countDocuments();
    this.employeeId = `EMP-${String(count + 1).padStart(5, "0")}`;
  }
});

module.exports = mongoose.model("Agent", agentSchema);
