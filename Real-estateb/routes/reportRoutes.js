const express = require("express");
const { generate } = require("../controllers/reportController");
const { protect, requirePerm } = require("../middleware/auth");
const router = express.Router();
router.use(protect, requirePerm("reports.view"));
router.get("/:type", generate);
module.exports = router;
