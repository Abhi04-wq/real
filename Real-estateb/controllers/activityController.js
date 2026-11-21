const ActivityLog = require("../models/ActivityLog");
const asyncHandler = require("../utils/asyncHandler");
const { buildQuery, paginate } = require("../utils/query");

const list = asyncHandler(async (req, res) => {
  const { filters, page, limit, skip, sort } = buildQuery(req, {
    searchFields: ["action", "description"],
    allowedFilters: ["module", "action", "user"],
  });
  const result = await paginate(ActivityLog, filters, {
    page, limit, skip, sort,
    populate: [{ path: "user", select: "name email role" }],
  });
  res.json(result);
});
module.exports = { list };
