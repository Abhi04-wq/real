const mongoose = require("mongoose");

const supportQuerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"]
    },
    email: {
      type: String,
      required: [true, "Email is required"]
    },
    subject: {
      type: String,
      required: [true, "Subject is required"]
    },
    message: {
      type: String,
      required: [true, "Message is required"]
    },
    status: {
      type: String,
      enum: ["Open", "Resolved"],
      default: "Open"
    },
    reply: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SupportQuery", supportQuerySchema);
