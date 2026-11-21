const PropertyType = require("../models/PropertyType");
const Property = require("../models/Property");
const asyncHandler = require("../utils/asyncHandler");
const { recordActivity } = require("../middleware/activity");

const list = asyncHandler(async (req, res) => {
  const types = await PropertyType.find().sort({ name: 1 });
  const withCounts = await Promise.all(
    types.map(async (t) => ({ ...t.toObject(), propertyCount: await Property.countDocuments({ propertyType: t._id }) }))
  );
  res.json({ data: withCounts });
});
const create = asyncHandler(async (req, res) => {
  const t = await PropertyType.create({ ...req.body, slug: req.body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") });
  await recordActivity({ user: req.user, module: "property-types", action: "Type created", description: `Created type ${t.name}`, req });
  res.status(201).json({ type: t });
});
const update = asyncHandler(async (req, res) => {
  const t = await PropertyType.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!t) return res.status(404).json({ message: "Not found" });
  res.json({ type: t });
});
const remove = asyncHandler(async (req, res) => {
  await PropertyType.findByIdAndDelete(req.params.id);
  await recordActivity({ user: req.user, module: "property-types", action: "Type deleted", description: `Deleted type ${req.params.id}`, req });
  res.json({ message: "Deleted" });
});
module.exports = { list, create, update, remove };
