const express = require("express");
const rateLimit = require("express-rate-limit");
const { submit, publicProperties } = require("../controllers/inquiryController");
const { validate } = require("../middleware/common");
const { inquirySchema } = require("../utils/validators");

const router = express.Router();
const submitLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { success: false, message: "Too many requests. Please try again later." } });

router.get("/properties", publicProperties);
router.post("/submit", submitLimiter, validate(inquirySchema), submit);

module.exports = router;
