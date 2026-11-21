const mongoose = require("mongoose");

const propertyLockSchema = new mongoose.Schema(
  {
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
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // Status flow: pending_admin → admin_approved → agent_assigned → agent_accepted | agent_rejected | admin_rejected
    status: {
      type: String,
      enum: [
        "pending_payment",
        "pending_admin",
        "admin_approved",
        "admin_rejected",
        "agent_assigned",
        "agent_accepted",
        "agent_rejected",
        "cancelled"
      ],
      default: "pending_payment"
    },
    tokenAmount: {
      type: Number,
      default: 100000
    },
    tokenAmountPaid: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ["pending_payment", "paid", "failed"],
      default: "pending_payment"
    },
    paymentMethod: {
      type: String,
      default: ""
    },
    paymentReference: {
      type: String,
      default: ""
    },
    paymentDueAt: {
      type: Date,
      default: null
    },
    paymentPaidAt: {
      type: Date,
      default: null
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    adminNote: {
      type: String,
      default: ""
    },
    agentNote: {
      type: String,
      default: ""
    },
    rejectionReason: {
      type: String,
      default: ""
    },
    // Chat session becomes available after agent_accepted
    chatSessionId: {
      type: String,
      default: null
    },
    lockedAt: {
      type: Date,
      default: Date.now
    },
    agentAssignedAt: {
      type: Date,
      default: null
    },
    agentRespondedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("PropertyLock", propertyLockSchema);
