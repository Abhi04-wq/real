const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "AGENT", "OWNER", "CUSTOMER"];
const STATUS = ["ACTIVE", "INACTIVE", "SUSPENDED"];

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      trim: true,
      default: undefined,
      // Unique only when provided (sparse) so legacy "N/A" / missing phones don't collide
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      default: "CUSTOMER",
    },
    profileImage: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: STATUS,
      default: "ACTIVE",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: undefined,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      default: undefined,
      select: false,
    },
    // ---- Legacy optional fields (kept so existing property/booking/chat modules don't crash) ----
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    reraId: { type: String, default: "" },
    experience: { type: Number, default: null },
    specialization: { type: String, default: "" },
    referralCode: { type: String, default: "" },
    serviceAreas: { type: [String], default: [] },
    isAvailable: { type: Boolean, default: true },
    staffDept: { type: String, default: "" },
    kycStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },
    kycDetails: {
      occupation: { type: String, default: "" },
      annualIncome: { type: String, default: "" },
      panNumber: { type: String, default: "" },
      aadhaarNumber: { type: String, default: "" },
      coApplicantName: { type: String, default: "" },
      coApplicantPhone: { type: String, default: "" },
    },
    kycDocs: {
      panCardUrl: { type: String, default: "" },
      aadhaarFrontUrl: { type: String, default: "" },
      aadhaarBackUrl: { type: String, default: "" },
      addressProofUrl: { type: String, default: "" },
      photographUrl: { type: String, default: "" },
      incomeProofUrl: { type: String, default: "" },
      bankStatementUrl: { type: String, default: "" },
    },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

// Sparse unique index for phone (unique where provided)
userSchema.index(
  { phone: 1 },
  { unique: true, sparse: true, partialFilterExpression: { phone: { $type: "string" } } }
);

// Keep legacy `name` in sync with `fullName`
userSchema.pre("validate", function () {
  if (this.fullName && !this.name) this.name = this.fullName;
  if (this.name && !this.fullName) this.fullName = this.name;
  // Normalize empty-string phones to undefined so the sparse index ignores them
  if (this.phone === "" || this.phone === "N/A") this.phone = undefined;
});

// Hash password before saving (never store plain text)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Secure password comparison
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Never leak password / reset tokens in JSON responses
userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
module.exports.ROLES = ROLES;
module.exports.STATUS = STATUS;
