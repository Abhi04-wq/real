const express = require("express");
const c = require("../controllers/propertyController");
const { protect, requirePerm } = require("../middleware/auth");
const { validate } = require("../middleware/common");
const { propertySchema } = require("../utils/validators");
const router = express.Router();
// Public property endpoints (catalog, search, filters)
router.get("/public", c.publicList);
router.get("/all", c.publicList);
router.get("/details/:id", c.publicGetOne);
router.post("/:id/reviews", c.addReview);
router.post("/details/:id/reviews", c.addReview);

// Protected admin routes
router.use(protect);
router.get("/", requirePerm("properties.view"), c.list);
router.post("/", requirePerm("properties.create"), validate(propertySchema), c.create);
router.get("/:id", requirePerm("properties.view"), c.getOne);
router.put("/:id", requirePerm("properties.edit"), c.update);
router.post("/:id/approve", requirePerm("properties.approve"), c.approve);
router.post("/:id/reject", requirePerm("properties.approve"), c.reject);
router.delete("/:id", requirePerm("properties.delete"), c.remove);
module.exports = router;
