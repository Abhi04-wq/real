const mongoose = require("mongoose");

const propertyTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

propertyTypeSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  }
});

module.exports = mongoose.model("PropertyType", propertyTypeSchema);
