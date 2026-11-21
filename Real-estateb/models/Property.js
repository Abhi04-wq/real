const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    propertyId: { type: String, unique: true, index: true },
    description: { type: String, default: "" },
    propertyType: { type: mongoose.Schema.Types.ObjectId, ref: "PropertyType" },
    listingType: { type: String, enum: ["Sale", "Rent", "Lease"], default: "Sale" },
    price: { type: Number, required: true, min: 0 },
    address: { type: String, default: "" },
    city: { type: String, default: "", index: true },
    state: { type: String, default: "" },
    country: { type: String, default: "India" },
    zipCode: { type: String, default: "" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    area: { type: Number, default: 0 }, // sqft
    furnishingStatus: {
      type: String,
      enum: ["Unfurnished", "Semi-Furnished", "Fully-Furnished"],
      default: "Unfurnished",
    },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    documents: { type: [String], default: [], select: false }, // private verification docs (tax receipt/porcha) — super admin only
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["Available", "Sold", "Rented", "Reserved", "Pending", "Inactive"],
      default: "Pending",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        role: { type: String, default: "Verified Client" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    avgRating: { type: Number, default: 4.8 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

propertySchema.index({ title: "text", city: "text", address: "text" });
propertySchema.index({ location: "2dsphere" });

propertySchema.pre("save", async function () {
  if (!this.propertyId) {
    const count = await mongoose.model("Property").countDocuments();
    this.propertyId = `PROP-${String(count + 1).padStart(6, "0")}`;
  }
});

module.exports = mongoose.model("Property", propertySchema);
