const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "MANAGER", "AGENT", "STAFF", "CUSTOMER", "OWNER"],
      default: "CUSTOMER",
    },
    roleRef: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    profileImage: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
    emailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    notes: [
      {
        text: String,
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
    preferences: {
      whatsappAlerts: { type: Boolean, default: true },
      searchMatch: {
        city: { type: String, default: "" },
        maxBudget: { type: Number },
        propertyType: { type: mongoose.Schema.Types.ObjectId, ref: "PropertyType" },
        bedrooms: { type: Number },
      },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  // Normalize legacy values (old DB stored "ACTIVE"/"INACTIVE" uppercase)
  if (this.status) this.status = String(this.status).toLowerCase();
  if (this.role) {
    const r = String(this.role).toUpperCase();
    if (["SUPER_ADMIN", "ADMIN", "MANAGER", "AGENT", "STAFF", "CUSTOMER", "OWNER"].includes(r)) this.role = r;
  }
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeJSON = function () {
  const o = this.toObject();
  delete o.password;
  return o;
};

module.exports = mongoose.model("User", userSchema);
