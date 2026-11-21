const mongoose = require("mongoose");

const siteVisitSchema = new mongoose.Schema(
  {
    visitId: {
      type: String,
      unique: true,
      required: true
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: false
    },
    plot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plot",
      required: false
    },
    plotSegmentId: {
      type: String,
      required: false
    },
    // Form fields
    fullName: {
      type: String,
      required: true
    },
    mobileNumber: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    timeSlot: {
      type: String,
      required: true
    },
    visitType: {
      type: String,
      enum: ["physical", "virtual"],
      default: "physical"
    },
    visitorsCount: {
      type: Number,
      default: 1
    },
    remarks: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "rescheduled",
        "follow_up",
        "booked"
      ],
      default: "pending"
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    // OTP verification fields
    otp: {
      type: String,
      default: ""
    },
    otpGeneratedAt: {
      type: Date
    },
    otpVerifiedAt: {
      type: Date
    },
    isOtpVerified: {
      type: Boolean,
      default: false
    },
    // GPS coordinates check-in/out fields
    checkInLocation: {
      lat: { type: Number },
      lng: { type: Number },
      timestamp: { type: Date }
    },
    checkOutLocation: {
      lat: { type: Number },
      lng: { type: Number },
      timestamp: { type: Date }
    },
    // Post-visit summary fields filled by Agent
    visitSummary: {
      type: String,
      default: ""
    },
    buyerInterestLevel: {
      type: String,
      enum: ["Interested", "Need Follow-up", "Not Interested", ""],
      default: ""
    },
    completionRemarks: {
      type: String,
      default: ""
    },
    nextFollowUpDate: {
      type: Date
    },
    // Buyer feedback fields after visit
    buyerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    buyerComments: {
      type: String,
      default: ""
    },
    wasVisitCompleted: {
      type: Boolean,
      default: false
    },
    buyerInterest: {
      type: String,
      enum: ["Interested", "Need Follow-up", "Not Interested", ""],
      default: ""
    },
    pipelineStage: {
      type: String,
      default: "Site Visit"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SiteVisit", siteVisitSchema);
