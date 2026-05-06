const mongoose = require("mongoose");

const wellnessEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    date: {
      type: String,
      required: true,
      trim: true
    },
    waterMl: {
      type: Number,
      default: 0,
      min: 0
    },
    checklist: {
      type: Map,
      of: Boolean,
      default: {}
    }
  },
  { timestamps: true }
);

wellnessEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("WellnessEntry", wellnessEntrySchema);
