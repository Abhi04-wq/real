const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true
    },
    otp: {
      type: String,
      required: [true, "OTP is required"]
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300 // Document will automatically be deleted after 5 minutes
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

module.exports = mongoose.model("Otp", otpSchema);
