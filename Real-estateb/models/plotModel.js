const mongoose = require("mongoose");

const segmentSchema = new mongoose.Schema({
  plotNumber: {
    type: String,
    required: [true, "Segment plot number is required"]
  },
  totalSqft: {
    type: Number,
    required: [true, "Segment Sqft is required"]
  },
  basePrice: {
    type: Number,
    required: [true, "Segment base price is required"]
  },
  status: {
    type: String,
    enum: ["vacant", "locked", "booked"],
    default: "vacant"
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  bookedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String, default: "" },
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

const plotSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false
    },
    name: {
      type: String,
      required: [true, "Plot Block/Layout name is required"]
    },
    totalSqft: {
      type: Number,
      required: [true, "Total Sqft of main layout is required"]
    },
    address: {
      type: String,
      default: "Greenwood Enclave, Sector 82, Gurgaon"
    },
    lat: {
      type: Number,
      default: 28.4595
    },
    lng: {
      type: Number,
      default: 77.0266
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    highlightedImageUrl: {
      type: String,
      default: ""
    },
    segments: [segmentSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Plot", plotSchema);

