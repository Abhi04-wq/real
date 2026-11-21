const express = require("express");
const c = require("../controllers/settingsController");
const { protect, requirePerm } = require("../middleware/auth");
const router = express.Router();
router.use(protect);
router.get("/", c.get);
router.put("/", requirePerm("settings.manage"), c.update);
module.exports = router;
