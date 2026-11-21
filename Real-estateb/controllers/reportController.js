const Property = require("../models/Property");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");
const Lead = require("../models/Lead");
const User = require("../models/User");
const Commission = require("../models/Commission");
const asyncHandler = require("../utils/asyncHandler");

function dateRange(req) {
  const { from, to } = req.query;
  const f = {};
  if (from || to) {
    f.createdAt = {};
    if (from) {
      const d = new Date(from);
      if (!isNaN(d.getTime())) {
        d.setHours(0, 0, 0, 0);
        f.createdAt.$gte = d;
      }
    }
    if (to) {
      const d = new Date(to);
      if (!isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999);
        f.createdAt.$lte = d;
      }
    }
  }
  return f;
}

// GET /api/reports/:type?type=properties&from=&to=&format=json|csv
const generate = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { format = "json", agent, property, status, city, propertyType } = req.query;
  const range = dateRange(req);
  let rows = [];

  if (type === "properties") {
    const f = { ...range };
    if (status) f.status = status;
    if (city) f.city = city;
    if (propertyType) f.propertyType = propertyType;
    rows = await Property.find(f).populate("propertyType owner assignedAgent", "name email title").lean();
  } else if (type === "bookings") {
    const f = { ...range };
    if (status) f.status = status;
    if (agent) f.agent = agent;
    if (property) f.property = property;
    rows = await Booking.find(f).populate("user property agent", "name email title").lean();
  } else if (type === "revenue" || type === "transactions") {
    const f = { ...range };
    if (status) f.status = status;
    rows = await Transaction.find(f).populate("user property", "name email title").lean();
  } else if (type === "sales") {
    rows = await Booking.find({ ...range, status: "Completed" }).populate("user property agent", "name email title").lean();
  } else if (type === "leads") {
    const f = { ...range };
    if (status) f.status = status;
    if (agent) f.assignedAgent = agent;
    rows = await Lead.find(f).populate("property assignedAgent", "title name").lean();
  } else if (type === "agents") {
    const agents = await require("../models/Agent").find().populate("user", "name email").lean();
    rows = await Promise.all(agents.map(async (a) => {
      const bookings = await Booking.countDocuments({ agent: a.user._id, ...{} });
      const revenue = await Transaction.aggregate([{ $match: {} }]);
      return { ...a, bookings };
    }));
  } else if (type === "commissions") {
    const f = { ...range };
    if (agent) f.agent = agent;
    if (status) f.status = status;
    rows = await Commission.find(f).populate("agent property transaction", "name title transactionId").lean();
  } else if (type === "users") {
    rows = await User.find({ ...range }).select("-password").lean();
  } else {
    return res.status(400).json({ message: "Unknown report type" });
  }

  const summary = { count: rows.length };
  if (["revenue", "transactions", "sales"].includes(type)) {
    summary.totalAmount = rows.reduce((s, r) => s + (r.amount || r.total || 0), 0);
  }

  if (format === "xlsx") {
    const ExcelJS = require("exceljs");
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(`${type}-report`);
    if (rows.length) {
      const headers = Object.keys(rows[0]).filter((k) => !k.startsWith("__"));
      ws.addRow(headers);
      rows.forEach((r) => ws.addRow(headers.map((h) => (typeof r[h] === "object" ? JSON.stringify(r[h]) : r[h] ?? ""))));
      ws.getRow(1).font = { bold: true };
    }
    res.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.header("Content-Disposition", `attachment; filename=${type}-report.xlsx`);
    await wb.xlsx.write(res);
    return res.end();
  }
  if (format === "pdf") {
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
    res.header("Content-Type", "application/pdf");
    res.header("Content-Disposition", `attachment; filename=${type}-report.pdf`);
    doc.pipe(res);
    doc.fontSize(16).text(`${type.toUpperCase()} REPORT`, { underline: true });
    doc.moveDown().fontSize(10).text(`Records: ${rows.length}${summary.totalAmount ? ` | Total: ${summary.totalAmount}` : ""}`);
    doc.moveDown();
    if (rows.length) {
      const headers = Object.keys(rows[0]).filter((k) => !k.startsWith("__")).slice(0, 7);
      doc.fontSize(9).text(headers.join(" | "));
      doc.moveDown(0.5);
      rows.slice(0, 200).forEach((r) => {
        doc.fontSize(8).text(headers.map((h) => String(typeof r[h] === "object" ? JSON.stringify(r[h]) : r[h] ?? "").slice(0, 30)).join(" | "));
      });
      if (rows.length > 200) doc.text(`… +${rows.length - 200} more rows (see CSV/Excel for full data)`);
    } else doc.text("No records.");
    doc.end();
    return;
  }
  if (format === "csv") {
    if (!rows.length) return res.status(200).header("Content-Type", "text/csv").send("");
    const headers = Object.keys(rows[0]).filter((k) => !k.startsWith("__"));
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(typeof r[h] === "object" ? JSON.stringify(r[h]) : r[h])).join(","))].join("\n");
    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", `attachment; filename=${type}-report.csv`);
    return res.send(csv);
  }
  res.json({ type, summary, data: rows });
});

module.exports = { generate };
