const express = require("express");
const { stats } = require("../controllers/dashboardController");
const { protect, requirePerm } = require("../middleware/auth");
const router = express.Router();
router.use(protect);
router.get("/stats", requirePerm("reports.view"), stats);
module.exports = router;
