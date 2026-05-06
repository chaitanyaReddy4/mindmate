const express = require("express");
const passport = require("passport");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  signup,
  login,
  forgotPassword,
  logout,
  refreshToken,
  me,
  googleSuccess,
  googleFailure
} = require("../controllers/authController");

const router = express.Router();

router.post(
  "/signup",
  ...signupValidation,
  validateRequest,
  asyncHandler(signup)
);
router.post(
  "/login",
  ...loginValidation,
  validateRequest,
  asyncHandler(login)
);
router.post(
  "/forgot-password",
  ...forgotPasswordValidation,
  validateRequest,
  asyncHandler(forgotPassword)
);
router.post("/logout", asyncHandler(logout));
router.post("/refresh-token", asyncHandler(refreshToken));
router.get("/me", authMiddleware, asyncHandler(me));
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/failure",
    session: false
  }),
  asyncHandler(googleSuccess)
);
router.get("/google/failure", googleFailure);

module.exports = router;
