const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Property name is required"]
    },
    type: {
      type: String,
      required: [true, "Property type is required"],
      enum: ["Apartment", "Villa", "Penthouse", "Flat", "House", "Land"]
    },
    status: {
      type: String,
      required: [true, "Property status is required"],
      enum: ["For Sale", "For Rent"],
      default: "For Sale"
    },
    price: {
      type: Number,
      required: [true, "Price is required"]
    },
    maxRooms: {
      type: Number,
      default: 1
    },
    beds: {
      type: Number,
      default: 1
    },
    baths: {
      type: Number,
      default: 1
    },
    streetAddress: {
      type: String,
      required: [true, "Street address is required"]
    },
    city: {
      type: String,
      required: [true, "City is required"]
    },
    state: {
      type: String,
      required: [true, "State is required"]
    },
    country: {
      type: String,
      required: [true, "Country is required"]
    },
    zipCode: {
      type: String,
      required: [true, "Zip code is required"]
    },
    area: {
      type: Number, // In Sq. Ft.
      required: [true, "Area is required"]
    },
    videoUrl: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    },
    image: {
      type: String,
      default: ""
    },
    additionalFeatures: {
      type: [String],
      default: []
    },
    style: {
      type: String,
      enum: ["A-Frame", "Office", "Building", "Shop"],
      default: "Building"
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: { type: String, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    coordinates: {
      lat: { type: Number, default: 28.4595 },
      lng: { type: Number, default: 77.0266 }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Property", propertySchema);
