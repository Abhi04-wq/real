const mongoose = require("mongoose");

const constructionUpdateSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    milestoneName: {
      type: String,
      required: [true, "Milestone name is required"]
    },
    percentComplete: {
      type: Number,
      required: [true, "Percentage complete is required"],
      min: 0,
      max: 100
    },
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ConstructionUpdate", constructionUpdateSchema);
