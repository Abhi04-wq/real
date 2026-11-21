const express = require("express");
const c = require("../controllers/activityController");
const { protect, requireRole } = require("../middleware/auth");
const router = express.Router();
router.use(protect, requireRole("SUPER_ADMIN", "ADMIN", "MANAGER"));
router.get("/", c.list);
module.exports = router;
