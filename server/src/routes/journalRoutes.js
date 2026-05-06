const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../utils/asyncHandler");
const {
  journalValidation,
  listJournalEntries,
  deleteJournalEntry,
  upsertJournalEntry
} = require("../controllers/journalController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", asyncHandler(listJournalEntries));
router.delete("/:date", asyncHandler(deleteJournalEntry));
router.put(
  "/",
  ...journalValidation,
  validateRequest,
  asyncHandler(upsertJournalEntry)
);

module.exports = router;
