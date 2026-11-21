const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Card", "UPI", "Online Payment"],
      default: "Online Payment",
    },
    paymentGateway: { type: String, default: "" },
    gatewayTransactionId: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded", "Cancelled"],
      default: "Pending",
    },
    rejectionReason: { type: String, default: "" },
    transactionDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

transactionSchema.pre("save", async function () {
  if (!this.transactionId) {
    const count = await mongoose.model("Transaction").countDocuments();
    this.transactionId = `TXN-${String(count + 1).padStart(6, "0")}`;
  }
});

module.exports = mongoose.model("Transaction", transactionSchema);
