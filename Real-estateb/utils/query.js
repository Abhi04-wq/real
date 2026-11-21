// Reusable search / filter / pagination helper
// usage: const { query, page, limit, skip, sort } = buildQuery(req, { searchFields: ['name','email'] })
function buildQuery(req, options = {}) {
  const { searchFields = [], allowedFilters = [] } = options;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const q = {};
  if (req.query.search && searchFields.length) {
    q.$or = searchFields.map((f) => ({ [f]: { $regex: req.query.search, $options: "i" } }));
  }
  allowedFilters.forEach((f) => {
    if (req.query[f] !== undefined && req.query[f] !== "") q[f] = req.query[f];
  });
  if (req.query.from || req.query.to) {
    const dateField = req.query.dateField || "createdAt";
    q[dateField] = {};
    if (req.query.from) q[dateField].$gte = new Date(req.query.from);
    if (req.query.to) q[dateField].$lte = new Date(req.query.to);
  }
  let sort = { createdAt: -1 };
  if (req.query.sort) {
    const [field, dir] = req.query.sort.split(":");
    sort = { [field]: dir === "asc" ? 1 : -1 };
  }
  return { filters: q, page, limit, skip, sort };
}

async function paginate(model, filters, { page, limit, skip, sort, populate }) {
  let query = model.find(filters).sort(sort).skip(skip).limit(limit);
  if (populate) {
    (Array.isArray(populate) ? populate : [populate]).forEach((p) => {
      query = query.populate(p);
    });
  }
  const [data, total] = await Promise.all([query.exec(), model.countDocuments(filters)]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

module.exports = { buildQuery, paginate };
