const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");
const Settings = require("../models/Settings");
const asyncHandler = require("../utils/asyncHandler");
const PDFDocument = require("pdfkit");

// Helper to convert number to Indian currency words
function numberToWords(num) {
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return "Zero Rupees Only";
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(val) {
    if (val < 20) return a[val];
    const digit = val % 10;
    return `${b[Math.floor(val / 10)]}${digit ? ` ${a[digit]}` : " "}`;
  }

  let str = "";
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const remaining = n % 100;

  if (crore) str += `${inWords(crore)}Crore `;
  if (lakh) str += `${inWords(lakh)}Lakh `;
  if (thousand) str += `${inWords(thousand)}Thousand `;
  if (hundred) str += `${inWords(hundred)}Hundred `;
  if (remaining) str += `${inWords(remaining)}`;

  return `${str.trim()} Rupees Only`;
}

// Generate PDF Stream with PDFKit
function generateInvoicePDF(res, inv) {
  const doc = new PDFDocument({ margin: 36, size: "A4" });
  res.header("Content-Type", "application/pdf");
  res.header("Content-Disposition", `attachment; filename=${inv.invoiceNumber}.pdf`);
  doc.pipe(res);

  // Brand Header
  doc.fillColor("#176B5B").fontSize(20).font("Helvetica-Bold").text(inv.company.name || "PRIMENEST REALTY", 36, 36);
  doc.fontSize(8).font("Helvetica").fillColor("#6B746F").text(inv.company.tagline || "Luxury Estates & Curated Residences", 36, 60);
  doc.text(`RERA Reg: ${inv.company.reraNumber || "RERA/PRM/2026/0891"} | GSTIN: ${inv.company.taxNumber || "27AABCU9603R1ZX"}`, 36, 72);
  doc.text(`${inv.company.email || "billing@primenest.com"} | ${inv.company.phone || "+91 (022) 8800-NEST"}`, 36, 84);

  // Document Title Badge
  doc.rect(380, 36, 180, 56).fillAndStroke("#F7F7F2", "#176B5B");
  doc.fillColor("#176B5B").fontSize(10).font("Helvetica-Bold").text("OFFICIAL TAX INVOICE", 390, 44, { width: 160, align: "center" });
  doc.fontSize(8).fillColor("#1C2421").font("Helvetica").text(`Inv #: ${inv.invoiceNumber}`, 390, 60, { width: 160, align: "center" });
  doc.text(`Date: ${new Date(inv.invoiceDate).toLocaleDateString("en-IN")}`, 390, 72, { width: 160, align: "center" });

  doc.moveDown(3);
  const startY = 120;

  // Divider
  doc.strokeColor("#CCD2CF").lineWidth(1).moveTo(36, startY).lineTo(560, startY).stroke();

  // Billed To & Payment Details
  doc.fillColor("#176B5B").fontSize(9).font("Helvetica-Bold").text("BILLED TO (CUSTOMER)", 36, startY + 10);
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#1C2421").text(inv.customer.name, 36, startY + 24);
  doc.font("Helvetica").fontSize(8).fillColor("#525E57")
    .text(`Phone: ${inv.customer.phone || "—"}`, 36, startY + 38)
    .text(`Email: ${inv.customer.email || "—"}`, 36, startY + 50)
    .text(`Address: ${inv.customer.address || "Client Verified Profile"}`, 36, startY + 62);

  doc.fillColor("#176B5B").fontSize(9).font("Helvetica-Bold").text("PAYMENT & VERIFICATION", 320, startY + 10);
  doc.font("Helvetica").fontSize(8).fillColor("#525E57")
    .text(`Payment Method: ${inv.payment.method}`, 320, startY + 24)
    .text(`Transaction / UTR Ref: ${inv.payment.transactionId}`, 320, startY + 36)
    .text(`Payment Status: ${inv.status} (Verified)`, 320, startY + 48)
    .text(`Approval: Super Admin Confirmed`, 320, startY + 60);

  // Table Header
  const tableY = startY + 86;
  doc.rect(36, tableY, 524, 22).fill("#176B5B");
  doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold")
    .text("ITEM / SERVICE DESCRIPTION", 44, tableY + 6)
    .text("PROPERTY ID", 280, tableY + 6)
    .text("QTY", 370, tableY + 6)
    .text("AMOUNT (INR)", 450, tableY + 6, { width: 100, align: "right" });

  // Table Row
  const rowY = tableY + 26;
  doc.rect(36, rowY, 524, 40).fillAndStroke("#FAFBFB", "#E4E7E5");
  doc.fillColor("#1C2421").fontSize(9).font("Helvetica-Bold")
    .text(inv.serviceDescription, 44, rowY + 8, { width: 230 });
  doc.fontSize(8).font("Helvetica").fillColor("#6B746F")
    .text(inv.property.title, 44, rowY + 22, { width: 230 });

  doc.fillColor("#1C2421").font("Helvetica")
    .text(inv.property.propertyId || "PRM-EST", 280, rowY + 12)
    .text("1", 370, rowY + 12);

  doc.font("Helvetica-Bold")
    .text(`₹${inv.payment.amount.toLocaleString("en-IN")}`, 450, rowY + 12, { width: 100, align: "right" });

  // Financial Breakdown
  const sumY = rowY + 52;
  doc.rect(320, sumY, 240, 75).fillAndStroke("#F7F7F2", "#CCD2CF");
  doc.fontSize(8).fillColor("#525E57").font("Helvetica")
    .text("Taxable Base Value:", 330, sumY + 8)
    .text(`₹${inv.payment.baseAmount.toLocaleString("en-IN")}`, 450, sumY + 8, { width: 100, align: "right" })
    .text("CGST (9%):", 330, sumY + 22)
    .text(`₹${(inv.payment.gstAmount / 2).toLocaleString("en-IN")}`, 450, sumY + 22, { width: 100, align: "right" })
    .text("SGST (9%):", 330, sumY + 36)
    .text(`₹${(inv.payment.gstAmount / 2).toLocaleString("en-IN")}`, 450, sumY + 36, { width: 100, align: "right" });

  doc.strokeColor("#176B5B").lineWidth(1).moveTo(330, sumY + 50).lineTo(550, sumY + 50).stroke();
  doc.fillColor("#176B5B").fontSize(10).font("Helvetica-Bold")
    .text("TOTAL PAID:", 330, sumY + 56)
    .text(`₹${inv.payment.amount.toLocaleString("en-IN")}`, 450, sumY + 56, { width: 100, align: "right" });

  // Amount in words
  doc.fillColor("#1C2421").fontSize(8).font("Helvetica-Bold").text("Amount in Words:", 36, sumY + 10);
  doc.font("Helvetica-Oblique").fillColor("#525E57").text(inv.amountInWords, 36, sumY + 24, { width: 260 });

  // Verification Seal & Signatory
  const sealY = sumY + 95;
  doc.rect(36, sealY, 260, 60).fillAndStroke("#F0FDF4", "#86EFAC");
  doc.fillColor("#166534").fontSize(9).font("Helvetica-Bold")
    .text("✓ PAYMENT OFFICIALLY CONFIRMED", 46, sealY + 10);
  doc.fontSize(7.5).font("Helvetica").fillColor("#15803D")
    .text("Approved & verified in system by Super Admin", 46, sealY + 24)
    .text("This receipt constitutes official acknowledgment of funds.", 46, sealY + 36);

  doc.rect(380, sealY, 180, 60).fillAndStroke("#FAFBFB", "#E4E7E5");
  doc.fillColor("#176B5B").fontSize(8).font("Helvetica-Bold")
    .text("FOR PRIMENEST LUXURY REALTY", 390, sealY + 10, { width: 160, align: "center" });
  doc.fontSize(7).font("Helvetica").fillColor("#6B746F")
    .text("Authorized Signatory & Comptroller", 390, sealY + 44, { width: 160, align: "center" });

  // Footer Note
  doc.fontSize(7).fillColor("#94A3B8").font("Helvetica")
    .text("Computer generated invoice. Registered under Real Estate Regulatory Authority (RERA).", 36, 760, { width: 524, align: "center" });

  doc.end();
}

// Build comprehensive invoice object
async function buildBookingInvoiceData(booking) {
  const settings = (await Settings.findOne()) || {};
  const amount = Number(booking.amount || 0);
  const baseAmount = Math.round((amount / 1.18) * 100) / 100;
  const gstAmount = Math.round((amount - baseAmount) * 100) / 100;

  return {
    invoiceNumber: `INV-${(booking.bookingId || "BKG").toUpperCase()}`,
    invoiceDate: booking.updatedAt || booking.createdAt,
    paymentDate: booking.updatedAt || booking.createdAt,
    status: "PAID",
    approvalStatus: booking.approvalStatus || "Approved",
    isSuperAdminApproved: true,
    serviceDescription: booking.tourType === "Online Consultation"
      ? "Virtual Property Advisory & Booking Reservation"
      : "Site Visit, Priority Property Inspection & Reservation Deposit",
    amountInWords: numberToWords(amount),
    customer: {
      name: booking.payerName || booking.user?.name || "Client",
      email: booking.user?.email || "—",
      phone: booking.user?.phone || "—",
      address: booking.user?.address || "Registered Client",
    },
    property: {
      title: booking.property?.title || "Prime Luxury Residence",
      propertyId: booking.property?.propertyId || "PRM-PROP",
      city: booking.property?.city || "Mumbai",
      address: booking.property?.address || "Premium Location",
      price: booking.property?.price || amount,
    },
    booking: {
      bookingId: booking.bookingId,
      tourType: booking.tourType || "In-Person",
      date: booking.bookingDate,
    },
    payment: {
      amount,
      baseAmount,
      gstAmount,
      taxBreakdown: "18% GST (9% CGST + 9% SGST)",
      method: booking.paymentMethod || "UPI / Online",
      transactionId: booking.transactionId || "APPROVED-UTR",
      currency: "INR",
    },
    company: {
      name: settings.companyName || "PrimeNest Realty",
      tagline: settings.tagline || "Luxury Estates & Curated Residences",
      email: settings.email || "admin@primenest.com",
      phone: settings.phone || "+91 (022) 8800-NEST",
      address: settings.address || "PrimeNest Tower, BKC Financial District, Mumbai",
      reraNumber: settings.reraNumber || "RERA/PRM/2026/0891",
      taxNumber: settings.taxNumber || "27AABCU9603R1ZX",
      website: settings.website || "https://primenest.com",
    },
    verifiedBy: "Super Admin (Finance & Operations)",
  };
}

// Build transaction invoice object
async function buildTransactionInvoiceData(transaction) {
  const settings = (await Settings.findOne()) || {};
  const amount = Number(transaction.amount || 0);
  const baseAmount = Math.round((amount / 1.18) * 100) / 100;
  const gstAmount = Math.round((amount - baseAmount) * 100) / 100;

  return {
    invoiceNumber: `INV-${(transaction.transactionId || "TXN").toUpperCase()}`,
    invoiceDate: transaction.transactionDate || transaction.createdAt,
    paymentDate: transaction.transactionDate || transaction.createdAt,
    status: "PAID",
    approvalStatus: "Approved",
    isSuperAdminApproved: true,
    serviceDescription: "Property Booking Token & Escrow Payment",
    amountInWords: numberToWords(amount),
    customer: {
      name: transaction.user?.name || "Client",
      email: transaction.user?.email || "—",
      phone: transaction.user?.phone || "—",
      address: transaction.user?.address || "Registered Client",
    },
    property: {
      title: transaction.property?.title || "Prime Luxury Residence",
      propertyId: transaction.property?.propertyId || "PRM-PROP",
      city: transaction.property?.city || "Mumbai",
      address: transaction.property?.address || "Premium Location",
      price: transaction.property?.price || amount,
    },
    booking: {
      bookingId: transaction.booking?.bookingId || transaction.booking?._id || "TXN-DIRECT",
      tourType: "Property Token Deposit",
      date: transaction.transactionDate,
    },
    payment: {
      amount,
      baseAmount,
      gstAmount,
      taxBreakdown: "18% GST (9% CGST + 9% SGST)",
      method: transaction.paymentMethod || "Online Transfer",
      transactionId: transaction.gatewayTransactionId || transaction.transactionId,
      currency: "INR",
    },
    company: {
      name: settings.companyName || "PrimeNest Realty",
      tagline: settings.tagline || "Luxury Estates & Curated Residences",
      email: settings.email || "admin@primenest.com",
      phone: settings.phone || "+91 (022) 8800-NEST",
      address: settings.address || "PrimeNest Tower, BKC Financial District, Mumbai",
      reraNumber: settings.reraNumber || "RERA/PRM/2026/0891",
      taxNumber: settings.taxNumber || "27AABCU9603R1ZX",
      website: settings.website || "https://primenest.com",
    },
    verifiedBy: "Super Admin (Finance & Operations)",
  };
}

// Controller: Get Booking Invoice
const getBookingInvoice = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("user", "name email phone address")
    .populate("property", "title propertyId price city address")
    .populate("agent", "name email phone");

  if (!booking) return res.status(404).json({ message: "Booking not found" });

  // Ownership or Admin Check
  const isOwner = String(booking.user?._id || booking.user) === String(req.user._id);
  const isPrivileged = ["SUPER_ADMIN", "ADMIN", "MANAGER", "AGENT"].includes(req.user.role?.toUpperCase());
  if (!isOwner && !isPrivileged) {
    return res.status(403).json({ message: "Access denied to this invoice" });
  }

  // Verification check: Must be confirmed / paid
  const isConfirmed = booking.paymentStatus === "Paid" || booking.approvalStatus === "Approved" || booking.status === "Confirmed";
  if (!isConfirmed) {
    return res.status(400).json({ message: "Invoice is available only after payment is confirmed by Super Admin." });
  }

  const invoiceData = await buildBookingInvoiceData(booking);

  if (req.query.format === "pdf") {
    return generateInvoicePDF(res, invoiceData);
  }

  res.json({ success: true, data: { invoice: invoiceData }, invoice: invoiceData });
});

// Controller: Get Transaction Invoice
const getTransactionInvoice = asyncHandler(async (req, res) => {
  const txn = await Transaction.findById(req.params.id)
    .populate("user", "name email phone address")
    .populate("property", "title propertyId price city address")
    .populate("booking", "bookingId tourType bookingDate");

  if (!txn) return res.status(404).json({ message: "Transaction not found" });

  const isOwner = String(txn.user?._id || txn.user) === String(req.user._id);
  const isPrivileged = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(req.user.role?.toUpperCase());
  if (!isOwner && !isPrivileged) {
    return res.status(403).json({ message: "Access denied to this invoice" });
  }

  if (txn.status !== "Paid") {
    return res.status(400).json({ message: "Invoice is available only for completed/confirmed payments." });
  }

  const invoiceData = await buildTransactionInvoiceData(txn);

  if (req.query.format === "pdf") {
    return generateInvoicePDF(res, invoiceData);
  }

  res.json({ success: true, data: { invoice: invoiceData }, invoice: invoiceData });
});

module.exports = {
  getBookingInvoice,
  getTransactionInvoice,
  buildBookingInvoiceData,
  buildTransactionInvoiceData,
};
