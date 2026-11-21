const mongoose = require("mongoose");

// Formal price offers & counter-offers on listings (buyer <-> seller via property)
const offerSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected", "Countered", "Withdrawn"], default: "Pending" },
    counterAmount: { type: Number },
    message: { type: String, default: "" },
    timeline: [
      {
        status: String,
        note: String,
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

offerSchema.index({ buyer: 1, createdAt: -1 });
offerSchema.index({ property: 1, createdAt: -1 });

module.exports = mongoose.model("Offer", offerSchema);
