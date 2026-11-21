const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false
    },
    action: {
      type: String,
      required: true
    },
    oldStatus: {
      type: String,
      default: ""
    },
    newStatus: {
      type: String,
      default: ""
    },
    ipAddress: {
      type: String,
      default: ""
    },
    device: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
