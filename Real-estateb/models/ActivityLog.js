const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true }, // e.g. "Property approved"
    module: { type: String, required: true }, // e.g. "properties"
    description: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activityLogSchema.index({ module: 1, createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
