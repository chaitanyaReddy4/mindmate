const { body } = require("express-validator");
const WellnessEntry = require("../models/WellnessEntry");
const { getDateKey } = require("../utils/date");

const wellnessValidation = [
  body("date")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date must be in YYYY-MM-DD format."),
  body("waterMl")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Water value must be a positive integer."),
  body("checklist").optional().isObject().withMessage("Checklist must be an object.")
];

const normalizeChecklist = (checklist = {}) => {
  if (!checklist) {
    return {};
  }

  if (checklist instanceof Map) {
    return Object.fromEntries(checklist.entries());
  }

  if (Array.isArray(checklist)) {
    return Object.fromEntries(checklist);
  }

  if (typeof checklist.toObject === "function") {
    return checklist.toObject();
  }

  return { ...checklist };
};

const serializeWellness = (entry) => ({
  id: entry._id.toString(),
  date: entry.date,
  waterMl: entry.waterMl,
  checklist: normalizeChecklist(entry.checklist)
});

const getWellness = async (req, res) => {
  if (req.query.range === "week") {
    const endDate = req.query.endDate || getDateKey();
    const startDate = req.query.startDate || (() => {
      const date = new Date(endDate);
      date.setDate(date.getDate() - 6);
      return getDateKey(date);
    })();

    const entries = await WellnessEntry.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: 1 })
      .lean();

    return res.json({
      entries: entries.map((entry) => serializeWellness(entry))
    });
  }

  const date = req.query.date || getDateKey();
  let entry = await WellnessEntry.findOne({ userId: req.user._id, date });

  if (!entry) {
    entry = await WellnessEntry.create({
      userId: req.user._id,
      date,
      waterMl: 0,
      checklist: {}
    });
  }

  res.json({ entry: serializeWellness(entry) });
};

const upsertWellness = async (req, res) => {
  const date = req.body.date || getDateKey();
  const updates = {};

  if (typeof req.body.waterMl === "number") {
    updates.waterMl = req.body.waterMl;
  }

  if (req.body.checklist) {
    updates.checklist = req.body.checklist;
  }

  const entry = await WellnessEntry.findOneAndUpdate(
    { userId: req.user._id, date },
    { $set: updates },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({ entry: serializeWellness(entry) });
};

module.exports = {
  wellnessValidation,
  getWellness,
  upsertWellness
};
