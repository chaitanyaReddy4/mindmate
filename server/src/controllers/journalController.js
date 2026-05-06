const { body } = require("express-validator");
const JournalEntry = require("../models/JournalEntry");
const { getDateKey } = require("../utils/date");

const journalValidation = [
  body("date")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date must be in YYYY-MM-DD format."),
  body("content").isString().withMessage("Journal content must be a string."),
  body("moodTag").optional().isString()
];

const listJournalEntries = async (req, res) => {
  const entries = await JournalEntry.find({ userId: req.user._id })
    .sort({ date: -1 })
    .lean();

  res.json({
    entries: entries.map((entry) => ({
      id: entry._id.toString(),
      date: entry.date,
      content: entry.content,
      moodTag: entry.moodTag || ""
    }))
  });
};

const deleteJournalEntry = async (req, res) => {
  await JournalEntry.findOneAndDelete({
    userId: req.user._id,
    date: req.params.date
  });

  res.json({ message: "Journal entry deleted." });
};

const upsertJournalEntry = async (req, res) => {
  const date = req.body.date || getDateKey();
  const entry = await JournalEntry.findOneAndUpdate(
    { userId: req.user._id, date },
    {
      $set: {
        content: req.body.content.trim(),
        moodTag: String(req.body.moodTag || "").trim()
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({
    entry: {
      id: entry._id.toString(),
      date: entry.date,
      content: entry.content,
      moodTag: entry.moodTag || ""
    }
  });
};

module.exports = {
  journalValidation,
  listJournalEntries,
  deleteJournalEntry,
  upsertJournalEntry
};
