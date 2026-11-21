const Settings = require("../models/Settings");
const asyncHandler = require("../utils/asyncHandler");
const { recordActivity } = require("../middleware/activity");

const get = asyncHandler(async (req, res) => {
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({});
  res.json({ settings: s });
});
const update = asyncHandler(async (req, res) => {
  let s = await Settings.findOne();
  if (!s) s = await Settings.create(req.body);
  else { Object.assign(s, req.body); await s.save(); }
  await recordActivity({ user: req.user, module: "settings", action: "Settings updated", description: "System settings updated", req });
  res.json({ settings: s });
});
module.exports = { get, update };
