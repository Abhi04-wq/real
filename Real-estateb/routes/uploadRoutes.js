const express = require("express");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { cloudinary, isConfigured } = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();
router.use(protect);

const uploadBufferToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: "image" }, (err, result) =>
      err ? reject(err) : resolve(result.secure_url)
    );
    stream.end(buffer);
  });

// POST /api/uploads  (form-data: images[], optional folder)
router.post(
  "/",
  upload.array("images", 10),
  asyncHandler(async (req, res) => {
    if (!req.files?.length) return res.status(400).json({ message: "No images provided" });
    const folder = req.body.folder || "primenest";
    const urls = [];

    if (isConfigured()) {
      for (const f of req.files) urls.push(await uploadBufferToCloudinary(f.buffer, folder));
    } else {
      // Local fallback when Cloudinary keys are not configured
      const dir = path.join(__dirname, "..", "uploads", folder);
      fs.mkdirSync(dir, { recursive: true });
      for (const f of req.files) {
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(f.originalname) || ".jpg"}`;
        fs.writeFileSync(path.join(dir, name), f.buffer);
        urls.push(`/uploads/${folder}/${name}`);
      }
    }
    res.status(201).json({ urls });
  })
);

module.exports = router;
