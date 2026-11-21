const express = require("express");
const c = require("../../controllers/activityController");
const { ops } = require("../../middleware/opsAuth");
const router = express.Router();
router.use(...ops);
router.get("/", c.list); // read-only: no create/update/delete routes by design
module.exports = router;
