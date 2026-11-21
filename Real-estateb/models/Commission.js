const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema(
  {
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Paid", "Cancelled"],
      default: "Pending",
    },
    paidDate: { type: Date },
    payoutRequested: { type: Boolean, default: false },
    payoutRequestedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Commission", commissionSchema);
