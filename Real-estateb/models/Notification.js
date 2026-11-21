const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // null = broadcast
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "new_property",
        "property_approved",
        "property_rejected",
        "new_booking",
        "booking_confirmation",
        "payment_received",
        "payment_failed",
        "new_lead",
        "lead_assigned",
        "system",
      ],
      default: "system",
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
