const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const asyncHandler = require("../utils/asyncHandler");
const {
  wellnessValidation,
  getWellness,
  upsertWellness
} = require("../controllers/wellnessController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", asyncHandler(getWellness));
router.put(
  "/",
  ...wellnessValidation,
  validateRequest,
  asyncHandler(upsertWellness)
);

module.exports = router;
