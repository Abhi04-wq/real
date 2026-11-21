const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "News title is required"],
      trim: true,
    },
    desc: {
      type: String,
      required: [true, "News description is required"],
    },
    author: {
      type: String,
      default: "Staff Writer",
    },
    role: {
      type: String,
      default: "Reporter",
    },
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    },
    img: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
    type: {
      type: String,
      enum: ["feature-left", "feature-mid", "feature-right-top", "feature-right-mid", "feature-right-bottom"],
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("News", newsSchema);
