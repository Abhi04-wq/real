const Commission = require("../models/Commission");
const asyncHandler = require("../utils/asyncHandler");
const { buildQuery, paginate } = require("../utils/query");
const { recordActivity } = require("../middleware/activity");

const list = asyncHandler(async (req, res) => {
  const { filters, page, limit, skip, sort } = buildQuery(req, {
    searchFields: [],
    allowedFilters: ["status", "agent", "property"],
  });
  const result = await paginate(Commission, filters, {
    page, limit, skip, sort,
    populate: [
      { path: "agent", select: "name email phone" },
      { path: "property", select: "title propertyId price" },
      { path: "transaction", select: "transactionId amount status" },
    ],
  });
  res.json(result);
});
const update = asyncHandler(async (req, res) => {
  const c = await Commission.findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Not found" });
  if (req.body.status) c.status = req.body.status;
  if (req.body.percentage !== undefined) { c.percentage = req.body.percentage; }
  if (req.body.status === "Paid") c.paidDate = new Date();
  await c.save();
  await recordActivity({ user: req.user, module: "commissions", action: "Commission updated", description: `Commission ${c._id} -> ${c.status}`, req });
  res.json({ commission: c });
});
module.exports = { list, update };
