const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bookingDate: { type: Date, default: Date.now },
    tourType: { type: String, enum: ["In-Person", "Video", "In-Person Physical Visit", "Live Video Tour"], default: "In-Person" },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Card", "Online Payment"],
      default: "Cash",
    },
    transactionId: { type: String, default: "" },
    payerName: { type: String, default: "" },
    paymentScreenshot: { type: String, default: "" },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Submitted", "Approved", "Rejected"],
      default: "Pending",
    },
    rejectionReason: { type: String, default: "" },
    commissionCalculated: { type: Boolean, default: false },
    commissionRate: { type: Number, default: 0 },
    commissionAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Submitted", "Paid", "Failed", "Refunded", "Cancelled"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
    notes: { type: String, default: "" },
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

bookingSchema.pre("save", async function () {
  if (!this.bookingId) {
    const count = await mongoose.model("Booking").countDocuments();
    this.bookingId = `BKG-${String(count + 1).padStart(6, "0")}`;
  }
});

module.exports = mongoose.model("Booking", bookingSchema);
