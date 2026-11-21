const express = require("express");
const c = require("../../controllers/profileController");
const { protect, requireOpsRole } = require("../../middleware/opsAuth");
const router = express.Router();
router.use(protect, requireOpsRole);
router.get("/", c.getProfile);
router.put("/", c.updateProfile);
router.post("/change-password", c.changePassword);
module.exports = router;
