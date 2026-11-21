const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    unitNumber: {
      type: String,
      required: [true, "Unit/Plot number is required"]
    },
    floor: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      default: "Apartment" // Apartment, Plot, Office, etc.
    },
    bhk: {
      type: Number,
      default: null
    },
    area: {
      type: Number,
      required: [true, "Area in sq.ft. is required"]
    },
    price: {
      type: Number,
      required: [true, "Price is required"]
    },
    status: {
      type: String,
      enum: ["available", "reserved", "booked", "sold", "blocked"],
      default: "available"
    },
    reservedUntil: {
      type: Date,
      default: null
    },
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    plcCharges: {
      type: Number,
      default: 0
    },
    facing: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Unit", unitSchema);
