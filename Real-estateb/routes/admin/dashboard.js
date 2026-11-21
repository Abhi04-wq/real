const express = require("express");
const { stats } = require("../../controllers/adminDashboardController");
const { ops } = require("../../middleware/opsAuth");
const router = express.Router();
router.use(...ops);
router.get("/stats", stats);
module.exports = router;
