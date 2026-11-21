const { z } = require("zod");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId").optional();
// Accepts "" (sent by forms when nothing is selected) as "not provided"
const optionalId = z.preprocess((v) => (v === "" || v === null ? undefined : v), objectId);

const emailField = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
  z.string().email()
);

const registerSchema = z.object({
  name: z.string().min(2).optional(),
  fullName: z.string().min(2).optional(),
  email: emailField,
  accountType: z.enum(["buyer", "seller"]).optional(),
  customerType: z.enum(["buyer", "seller"]).optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toUpperCase() : v),
    z.enum(["ADMIN", "MANAGER", "AGENT", "STAFF", "CUSTOMER", "OWNER"]).optional()
  ),
}).refine((v) => v.name || v.fullName, {
  path: ["name"],
  message: "Name must contain at least 2 character(s)",
});

const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: emailField,
});

const resetPasswordTokenSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().optional(),
}).refine((v) => !v.confirmPassword || v.password === v.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  profileImage: z.string().optional(),
});

const propertySchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  propertyType: optionalId,
  listingType: z.enum(["Sale", "Rent", "Lease"]).optional(),
  price: z.number().min(0),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  area: z.number().optional(),
  furnishingStatus: z.enum(["Unfurnished", "Semi-Furnished", "Fully-Furnished"]).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  owner: optionalId,
  assignedAgent: optionalId,
  status: z.enum(["Available", "Sold", "Rented", "Reserved", "Pending", "Inactive"]).optional(),
});

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string().email().optional().or(z.literal(""))
  ),
  phone: z.string().min(5),
  property: optionalId,
  assignedAgent: optionalId,
  source: z.enum(["Website", "Phone", "Email", "Social Media", "Advertisement", "Referral", "Walk-in", "Other"]).optional(),
  status: z.enum(["New", "Contacted", "Follow-up", "Interested", "Negotiation", "Converted", "Lost", "Showing Scheduled", "Under Contract", "Closed"]).optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
  notes: z.string().optional(),
  nextFollowUp: z.string().optional(),
});

const bookingSchema = z.object({
  user: z.string().regex(/^[0-9a-fA-F]{24}$/),
  property: z.string().regex(/^[0-9a-fA-F]{24}$/),
  agent: optionalId,
  amount: z.number().min(0),
  notes: z.string().optional(),
  status: z.enum(["Pending", "Confirmed", "Cancelled", "Completed"]).optional(),
  paymentStatus: z.enum(["Pending", "Paid", "Failed", "Refunded", "Cancelled"]).optional(),
});

const transactionSchema = z.object({
  user: z.string().regex(/^[0-9a-fA-F]{24}$/),
  property: optionalId,
  booking: optionalId,
  amount: z.number().min(0),
  paymentMethod: z.enum(["Cash", "Bank Transfer", "Card", "UPI", "Online Payment"]).optional(),
  status: z.enum(["Pending", "Paid", "Failed", "Refunded", "Cancelled"]).optional(),
});

const roleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

const propertyTypeSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  image: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

const inquirySchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(5, "Valid phone number is required"),
  email: emailField,
  iamA: z.enum(["Individual Buyer", "Property Owner / Seller", "Tenant / Rent Seeker", "Real Estate Agent", "Investor"]),
  purpose: z.enum(["Schedule a Site Visit", "Pricing & Floor Plan Inquiry", "Sell / List My Property", "Home Loan Assistance", "General Inquiry"]),
  property: z.string().optional(),
  propertyCode: z.string().optional(),
  visitType: z.enum(["In-Person Physical Visit", "Live Video Tour"]).optional(),
  visitAt: z.string().optional(), // ISO datetime from calendar picker; required when purpose is a site visit
  budget: z.enum(["Under ₹30L", "₹30L - ₹50L", "₹50L - ₹1Cr", "₹1Cr - ₹2.5Cr", "Above ₹2.5Cr"]).optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
  whatsappConsent: z.boolean().optional().default(true),
}).superRefine((v, ctx) => {
  if (v.purpose === "Schedule a Site Visit") {
    if (!v.visitAt) ctx.addIssue({ code: "custom", path: ["visitAt"], message: "Preferred date & time is required" });
    else if (Number.isNaN(Date.parse(v.visitAt)) || new Date(v.visitAt) <= new Date())
      ctx.addIssue({ code: "custom", path: ["visitAt"], message: "Visit must be scheduled in the future" });
  }
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordTokenSchema,
  userUpdateSchema,
  propertySchema,
  leadSchema,
  bookingSchema,
  transactionSchema,
  roleSchema,
  propertyTypeSchema,
  inquirySchema,
};
