const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    source: {
      type: String,
      enum: ["Website", "Phone", "Email", "Social Media", "Advertisement", "Referral", "Walk-in", "Other"],
      default: "Website",
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Follow-up", "Interested", "Negotiation", "Converted", "Lost", "Showing Scheduled", "Under Contract", "Closed"],
      default: "New",
    },
    priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },
    notes: { type: String, default: "" },
    followUps: [
      {
        kind: { type: String, enum: ["note", "call", "visit", "email"], default: "note" },
        note: String,
        durationMin: Number,
        date: Date,
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    nextFollowUp: { type: Date },
    convertedToCustomer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
