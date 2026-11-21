const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Property = require("../models/Property");
const Lead = require("../models/Lead");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../middleware/agentScope"); // {success,message,data} envelope helpers

// Public: properties for the "Property of Interest" dropdown (approved + available only)
const publicProperties = asyncHandler(async (req, res) => {
  const q = {};
  if (req.query.search) q.$or = [{ title: { $regex: req.query.search, $options: "i" } }, { propertyId: { $regex: req.query.search, $options: "i" } }, { city: { $regex: req.query.search, $options: "i" } }];
  const props = await Property.find({ status: "Available", approvalStatus: "approved", ...q })
    .select("title propertyId price city images")
    .sort({ createdAt: -1 })
    .limit(50);
  ok(res, { properties: props }, "Properties");
});

// POST /api/inquiries/submit (public) — reuses Lead + Booking collections, no duplicate schema
const submit = asyncHandler(async (req, res) => {
  const { fullName, phone, email, iamA, purpose, property, propertyCode, visitType, visitAt, budget, message, whatsappConsent } = req.body;

  // 1. Identify User: check authorization token first (if logged in), otherwise find by email or create
  let customer = null;
  const token = req.cookies?.token || (req.headers.authorization || "").replace("Bearer ", "");
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
      if (decoded?.id) {
        customer = await User.findById(decoded.id);
      }
    } catch {}
  }

  if (!customer && email) {
    customer = await User.findOne({ email: email.toLowerCase().trim() });
  }

  if (!customer) {
    customer = await User.create({
      name: fullName,
      email: email ? email.toLowerCase().trim() : `guest_${Date.now()}@primenest.com`,
      phone: phone || "",
      password: `Guest@${Date.now().toString(36)}`,
      role: "CUSTOMER",
      status: "active",
    });
  }

  // 2. Resolve Property: by ObjectId, propertyCode, or fallback
  let prop = null;
  if (property && mongoose.Types.ObjectId.isValid(property)) {
    prop = await Property.findById(property);
  }
  if (!prop && (propertyCode || property)) {
    const code = propertyCode || property;
    prop = await Property.findOne({ $or: [{ propertyId: code }, { title: code }] });
  }
  if (!prop) {
    prop = (await Property.findOne({ status: "Available" })) || (await Property.findOne());
  }

  const baseNote = `${iamA} · ${purpose}${budget ? ` · Budget: ${budget}` : ""}${message ? ` · ${message}` : ""}${whatsappConsent === false ? " · No WhatsApp updates" : ""}${propertyCode ? ` · Property Code: ${propertyCode}` : ""}`;

  // Every inquiry becomes a Lead
  const lead = await Lead.create({
    name: fullName,
    email: email || customer.email,
    phone: phone || customer.phone,
    property: prop?._id,
    assignedAgent: prop?.assignedAgent,
    source: "Website",
    status: "New",
    priority: "Medium",
    notes: baseNote,
    nextFollowUp: purpose === "Schedule a Site Visit" && visitAt ? new Date(visitAt) : undefined,
  });

  let booking = null;
  if (purpose === "Schedule a Site Visit" && visitAt) {
    booking = await Booking.create({
      user: customer._id,
      property: prop?._id,
      agent: prop?.assignedAgent || null,
      bookingDate: new Date(visitAt),
      amount: 0,
      tourType: visitType === "Live Video Tour" ? "Live Video Tour" : "In-Person",
      paymentStatus: "Pending",
      status: "Pending",
      notes: `pending_admin_approval · ${visitType || "In-Person"} · ${baseNote}`,
      timeline: [
        {
          status: "Pending",
          note: `Site-visit request (${visitType || "In-Person"}) pending admin approval`,
          by: customer._id,
          at: new Date(),
        },
      ],
    });
  }

  // Alert admins/agents (notification center)
  try {
    await Notification.create({
      sender: customer._id,
      recipient: prop?.assignedAgent || null,
      title: purpose === "Schedule a Site Visit" ? "New site-visit request" : "New inquiry",
      message: `${fullName} (${phone}) — ${purpose}${prop ? ` · ${prop.title}` : ""}`,
      type: purpose === "Schedule a Site Visit" ? "new_booking" : "new_lead",
    });
  } catch { /* notifications must never break submission */ }

  res.status(201).json({
    success: true,
    message: "Request received",
    ...(booking ? { bookingId: booking.bookingId } : { leadId: lead._id }),
  });
});

module.exports = { submit, publicProperties };
