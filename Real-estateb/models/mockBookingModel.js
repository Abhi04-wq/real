const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema({
  installmentNo: { type: Number, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["Pending", "Paid"], default: "Pending" }
});

const mockBookingSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    propertyName: {
      type: String,
      required: true
    },
    propertyPrice: {
      type: Number,
      required: true,
      default: 5000000
    },
    status: {
      type: String,
      enum: ["form_sent", "form_submitted", "approved", "Booked", "rejected"],
      default: "form_sent"
    },
    buyerTextData: {
      type: String,
      default: ""
    },
    paymentMatrix: [installmentSchema],
    downloadCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("MockBooking", mockBookingSchema);
