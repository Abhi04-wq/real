const mongoose = require("mongoose");
const Property = require("../models/Property");
const PropertyType = require("../models/PropertyType");
const asyncHandler = require("../utils/asyncHandler");
const { buildQuery, paginate } = require("../utils/query");
const { recordActivity } = require("../middleware/activity");

const list = asyncHandler(async (req, res) => {
  const { filters, page, limit, skip, sort } = buildQuery(req, {
    searchFields: ["title", "city", "address", "propertyId"],
    allowedFilters: ["status", "approvalStatus", "listingType", "city", "propertyType", "isFeatured", "assignedAgent", "owner"],
  });
  if (req.query.minPrice || req.query.maxPrice) {
    filters.price = {};
    if (req.query.minPrice) filters.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filters.price.$lte = Number(req.query.maxPrice);
  }
  const result = await paginate(Property, filters, {
    page, limit, skip, sort,
    populate: [
      { path: "propertyType", select: "name slug" },
      { path: "owner", select: "name email phone" },
      { path: "assignedAgent", select: "name email phone" },
    ],
  });
  res.json(result);
});

const getOne = asyncHandler(async (req, res) => {
  const p = await Property.findById(req.params.id)
    .select("+documents") // private verification docs: super-admin eyes only
    .populate("propertyType", "name slug")
    .populate("owner", "name email phone")
    .populate("assignedAgent", "name email phone");
  if (!p) return res.status(404).json({ message: "Property not found" });
  res.json({ property: p });
});

const create = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.body.latitude && req.body.longitude)
    data.location = { type: "Point", coordinates: [Number(req.body.longitude), Number(req.body.latitude)] };
  const p = await Property.create(data);
  await recordActivity({ user: req.user, module: "properties", action: "Property created", description: `Created property ${p.title}`, req });
  res.status(201).json({ property: p });
});

const update = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.body.latitude && req.body.longitude)
    data.location = { type: "Point", coordinates: [Number(req.body.longitude), Number(req.body.latitude)] };
  const p = await Property.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!p) return res.status(404).json({ message: "Property not found" });
  await recordActivity({ user: req.user, module: "properties", action: "Property updated", description: `Updated property ${p.title}`, req });
  res.json({ property: p });
});

const approve = asyncHandler(async (req, res) => {
  const p = await Property.findByIdAndUpdate(req.params.id, { approvalStatus: "approved", status: "Available", isPublished: true }, { new: true });
  if (!p) return res.status(404).json({ message: "Property not found" });
  await recordActivity({ user: req.user, module: "properties", action: "Property approved", description: `Approved property ${p.title}`, req });
  res.json({ property: p });
});

const reject = asyncHandler(async (req, res) => {
  const p = await Property.findByIdAndUpdate(req.params.id, { approvalStatus: "rejected", isPublished: false }, { new: true });
  if (!p) return res.status(404).json({ message: "Property not found" });
  await recordActivity({ user: req.user, module: "properties", action: "Property rejected", description: `Rejected property ${p.title}`, req });
  res.json({ property: p });
});

const remove = asyncHandler(async (req, res) => {
  const p = await Property.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ message: "Property not found" });
  await recordActivity({ user: req.user, module: "properties", action: "Property deleted", description: `Deleted property ${p.title}`, req });
  res.json({ message: "Property deleted" });
});

const publicList = asyncHandler(async (req, res) => {
  // Public catalog: only admin-approved listings are visible.
  const q = { approvalStatus: "approved" };

  // Search keyword (title, city, address, description, propertyId)
  const query = req.query.query || req.query.search || req.query.q;
  if (query && String(query).trim()) {
    const rx = { $regex: String(query).trim(), $options: "i" };
    q.$or = [{ title: rx }, { city: rx }, { address: rx }, { description: rx }, { propertyId: rx }];
  }

  // Listing Type: Sale, Rent, Lease
  if (req.query.listingType && req.query.listingType !== "all" && req.query.listingType !== "All") {
    q.listingType = { $regex: new RegExp(`^${req.query.listingType}$`, "i") };
  }

  // City / Location
  const city = req.query.city || req.query.location;
  if (city && city !== "All" && city !== "all") {
    q.city = { $regex: new RegExp(city, "i") };
  }

  // Property Type (by ID or name)
  const propType = req.query.type || req.query.propertyType;
  if (propType && propType !== "all" && propType !== "All") {
    if (mongoose.Types.ObjectId.isValid(propType)) {
      q.propertyType = propType;
    } else {
      const typeDoc = await PropertyType.findOne({
        $or: [{ name: { $regex: new RegExp(propType, "i") } }, { slug: propType.toLowerCase() }],
      });
      if (typeDoc) q.propertyType = typeDoc._id;
    }
  }

  // Bedrooms / BHK
  const bhk = req.query.bhk || req.query.bedrooms;
  if (bhk && bhk !== "all" && bhk !== "All") {
    const n = parseInt(bhk, 10);
    if (!isNaN(n)) {
      if (n >= 4) q.bedrooms = { $gte: 4 };
      else q.bedrooms = n;
    }
  }

  // Price range
  const minPrice = Number(req.query.minPrice);
  const maxPrice = Number(req.query.maxPrice);
  if (!isNaN(minPrice) || !isNaN(maxPrice)) {
    q.price = {};
    if (!isNaN(minPrice) && minPrice > 0) q.price.$gte = minPrice;
    if (!isNaN(maxPrice) && maxPrice > 0) q.price.$lte = maxPrice;
  }

  // Sorting
  let sortOption = { isFeatured: -1, createdAt: -1 };
  if (req.query.sort === "price_asc" || req.query.sort === "price_low") sortOption = { price: 1 };
  else if (req.query.sort === "price_desc" || req.query.sort === "price_high") sortOption = { price: -1 };
  else if (req.query.sort === "newest") sortOption = { createdAt: -1 };
  else if (req.query.sort === "oldest") sortOption = { createdAt: 1 };

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const skip = (page - 1) * limit;

  const [properties, total] = await Promise.all([
    Property.find(q)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("propertyType", "name slug")
      .populate("assignedAgent", "name email phone photo"),
    Property.countDocuments(q),
  ]);

  res.json({
    success: true,
    data: properties,
    properties,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  });
});

const publicGetOne = asyncHandler(async (req, res) => {
  let p = null;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    p = await Property.findById(req.params.id)
      .populate("propertyType", "name slug")
      .populate("assignedAgent", "name email phone photo");
  }
  if (!p) {
    p = await Property.findOne({ propertyId: req.params.id })
      .populate("propertyType", "name slug")
      .populate("assignedAgent", "name email phone photo");
  }
  if (!p) return res.status(404).json({ message: "Property not found" });
  res.json({ success: true, property: p, data: p });
});

const addReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, rating, comment, role } = req.body;

  if (!comment || !comment.trim()) {
    return res.status(400).json({ success: false, message: "Review comment is required" });
  }

  let property = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    property = await Property.findById(id);
  }
  if (!property) {
    property = await Property.findOne({ propertyId: id });
  }
  if (!property) {
    return res.status(404).json({ success: false, message: "Property not found" });
  }

  const reviewerName = (name || req.user?.name || "Verified Resident").trim();
  const numRating = Number(rating) || 5;

  const newReview = {
    user: req.user?._id || req.body.userId || null,
    name: reviewerName,
    rating: Math.min(5, Math.max(1, numRating)),
    comment: comment.trim(),
    role: role || (req.user ? "Verified Buyer" : "Verified Client"),
    createdAt: new Date(),
  };

  if (!property.reviews) property.reviews = [];
  property.reviews.unshift(newReview);

  const ratings = property.reviews.map((r) => r.rating).filter(Boolean);
  property.totalReviews = property.reviews.length;
  property.avgRating = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : 5;

  await property.save();

  res.status(201).json({
    success: true,
    message: "Thank you! Your review has been submitted and saved.",
    review: newReview,
    reviews: property.reviews,
    avgRating: property.avgRating,
    totalReviews: property.totalReviews,
  });
});

module.exports = {
  list,
  getOne,
  create,
  update,
  approve,
  reject,
  remove,
  publicList,
  publicGetOne,
  addReview,
};
