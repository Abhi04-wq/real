const express = require("express");
const c = require("../../controllers/commissionController");
const { ops, requirePerm } = require("../../middleware/opsAuth");
const router = express.Router();
router.use(...ops);
router.get("/", requirePerm("transactions.view"), c.list);
router.put("/:id", requirePerm("transactions.manage"), c.update);
module.exports = router;
