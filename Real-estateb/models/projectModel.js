const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      unique: true
    },
    location: {
      type: String,
      required: [true, "Location is required"]
    },
    type: {
      type: String,
      required: true,
      enum: ["plot", "residential", "commercial"]
    },
    reraNumber: {
      type: String,
      required: [true, "RERA registration number is required"]
    },
    status: {
      type: String,
      enum: ["Upcoming", "Under Construction", "Ready to Move", "Completed"],
      default: "Under Construction"
    },
    description: {
      type: String,
      default: ""
    },
    image: {
      type: String,
      default: ""
    },
    priceRange: {
      type: String,
      default: ""
    },
    pincode: {
      type: String,
      default: ""
    },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    },
    tagline: {
      type: String,
      default: ""
    },
    amenities: {
      type: [String],
      default: []
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Project", projectSchema);
