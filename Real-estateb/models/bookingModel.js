const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  mode: {
    type: String,
    required: true,
    enum: ["UPI", "Card", "Netbanking", "Cheque", "Demand Draft"]
  },
  utr: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "completed"
  },
  receiptUrl: {
    type: String,
    default: ""
  }
});

const bookingSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true
    },
    coApplicantDetails: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      relation: { type: String, default: "" }
    },
    financingType: {
      type: String,
      required: true,
      enum: ["self-funded", "home-loan"]
    },
    paymentPlan: {
      type: String,
      required: true,
      enum: ["construction-linked", "time-linked"]
    },
    tokenAmountPaid: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending_approval", "confirmed", "cancelled"],
      default: "pending_approval"
    },
    bookingLetterUrl: {
      type: String,
      default: ""
    },
    paymentLedger: [paymentSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
