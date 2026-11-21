const express = require("express");
const { generate } = require("../../controllers/reportController");
const { ops, requirePerm } = require("../../middleware/opsAuth");
const router = express.Router();
router.use(...ops, requirePerm("reports.view"));
router.get("/:type", generate);
module.exports = router;
