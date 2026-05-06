const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../utils/asyncHandler");
const {
  saveMessageValidation,
  analyzeValidation,
  getMessages,
  saveMessage,
  clearMessages,
  analyze
} = require("../controllers/messageController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", asyncHandler(getMessages));
router.delete("/", asyncHandler(clearMessages));
router.post(
  "/",
  ...saveMessageValidation,
  validateRequest,
  asyncHandler(saveMessage)
);
router.post(
  "/analyze",
  ...analyzeValidation,
  validateRequest,
  asyncHandler(analyze)
);

module.exports = router;
