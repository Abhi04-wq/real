const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { errorHandler, notFound } = require("./middleware/common");

const app = express();
if (process.env.NODE_ENV !== "production") require("dotenv").config();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan("dev"));
app.use(cors({ origin: (process.env.CLIENT_URL || "http://localhost:5173").split(","), credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/auth/login", authLimiter);
// Stricter cap on reset-link emails to prevent email bombing.
const forgotLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use("/api/auth/forgot-password", forgotLimiter);


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/agents", require("./routes/agentRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api/property-types", require("./routes/propertyTypeRoutes"));
app.use("/api/leads", require("./routes/leadRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/commissions", require("./routes/commissionRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/roles", require("./routes/roleRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/activity-logs", require("./routes/activityRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));

// Admin/Manager operations panel (reuses same models & controllers, role-gated)
app.use("/api/admin/dashboard", require("./routes/admin/dashboard"));
app.use("/api/admin/properties", require("./routes/admin/properties"));
app.use("/api/admin/agents", require("./routes/admin/agents"));
app.use("/api/admin/customers", require("./routes/admin/customers"));
app.use("/api/admin/leads", require("./routes/admin/leads"));
app.use("/api/admin/bookings", require("./routes/admin/bookings"));
app.use("/api/admin/transactions", require("./routes/admin/transactions"));
app.use("/api/admin/commissions", require("./routes/admin/commissions"));
app.use("/api/admin/reports", require("./routes/admin/reports"));
app.use("/api/admin/notifications", require("./routes/admin/notifications"));
app.use("/api/admin/activity-logs", require("./routes/admin/activity"));
app.use("/api/admin/profile", require("./routes/admin/profile"));

// Agent & Broker portal (strict agent_id isolation, {success,message,data} envelope)
app.use("/api/agent", require("./routes/agent/portal"));

// Public "Contact Us & Schedule a Visit" (reuses Lead + Booking collections)
app.use("/api/inquiries", require("./routes/inquiryRoutes"));

// Unified Buyer & Seller client portal (CUSTOMER / OWNER roles)
app.use("/api/client", require("./routes/client/portal"));

// Public property review & testimonial endpoints
app.post("/api/site-visits/mock-property-review/:id", require("./controllers/propertyController").addReview);
app.get("/api/site-visits/testimonials", async (req, res) => {
  try {
    const props = await require("./models/Property").find({ "reviews.0": { $exists: true } }).select("reviews title city");
    const all = [];
    for (const p of props) {
      for (const r of p.reviews || []) {
        all.push({
          name: r.name,
          role: r.role || "Verified Buyer",
          time: new Date(r.createdAt).toLocaleDateString("en-IN"),
          text: r.comment,
          rating: r.rating || 5,
          property: p.title,
        });
      }
    }
    res.json({ success: true, data: all });
  } catch {
    res.json({ success: true, data: [] });
  }
});

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);
app.get("/", (req, res) => res.json({ message: "Real Estate Super Admin API is active.", version: "2.0.0" }));
app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use(notFound);
app.use(errorHandler);

module.exports = app;
