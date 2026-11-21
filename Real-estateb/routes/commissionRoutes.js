const express = require("express");
const c = require("../controllers/commissionController");
const { protect, requirePerm } = require("../middleware/auth");
const router = express.Router();
router.use(protect);
router.get("/", requirePerm("transactions.view"), c.list);
router.put("/:id", requirePerm("transactions.manage"), c.update);
module.exports = router;
