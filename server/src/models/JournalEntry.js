const mongoose = require("mongoose");

const journalEntrySchema = new mongoose.Schema(
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
    content: {
      type: String,
      default: "",
      trim: true
    },
    moodTag: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
);

journalEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("JournalEntry", journalEntrySchema);
