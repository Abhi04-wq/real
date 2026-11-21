const express = require("express");
const c = require("../controllers/propertyTypeController");
const { protect, requirePerm } = require("../middleware/auth");
const router = express.Router();
// Public: allow anyone (clients, users, visitors) to read property types for dropdowns and search
router.get("/", c.list);

// Admin / staff management
router.use(protect);
router.post("/", requirePerm("properties.create"), c.create);
router.put("/:id", requirePerm("properties.edit"), c.update);
router.delete("/:id", requirePerm("properties.delete"), c.remove);
module.exports = router;
