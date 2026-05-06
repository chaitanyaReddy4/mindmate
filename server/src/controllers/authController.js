const crypto = require("crypto");
const { body } = require("express-validator");
const User = require("../models/User");
const AppError = require("../utils/appError");
const { REFRESH_COOKIE_NAME } = require("../config/constants");
const {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} = require("../utils/tokenService");

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/api/auth"
};

const getRefreshExpiryDate = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return expiresAt;
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);
};

const setRefreshCookie = (res, token, rememberMe = true) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...cookieOptions,
    ...(rememberMe ? { expires: getRefreshExpiryDate() } : {})
  });
};

const issueTokens = async (
  user,
  req,
  res,
  sessionId = crypto.randomUUID(),
  rememberMe = true
) => {
  const accessToken = signAccessToken(user, process.env.JWT_ACCESS_SECRET);
  const refreshToken = signRefreshToken(
    user,
    process.env.JWT_REFRESH_SECRET,
    sessionId
  );

  user.refreshTokens = (user.refreshTokens || []).filter(
    (session) =>
      session.expiresAt > new Date() && session._id.toString() !== sessionId
  );

  user.refreshTokens.push({
    _id: sessionId,
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshExpiryDate(),
    userAgent: req.get("user-agent") || "",
    ip: req.ip
  });

  await user.save();
  setRefreshCookie(res, refreshToken, rememberMe);

  return {
    accessToken,
    user: user.toSafeObject()
  };
};

const signupValidation = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters."),
  body("email")
    .isEmail()
    .withMessage("Enter a valid email address.")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must include an uppercase letter.")
    .matches(/[a-z]/)
    .withMessage("Password must include a lowercase letter.")
    .matches(/\d/)
    .withMessage("Password must include a number.")
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Enter a valid email address.")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
  body("rememberMe").optional().isBoolean()
];

const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .withMessage("Enter a valid email address.")
    .normalizeEmail()
];

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("An account already exists for this email.", 409);
  }

  const user = await User.create({ name, email, password });
  const payload = await issueTokens(user, req, res, crypto.randomUUID(), true);

  return res.status(201).json(payload);
};

const login = async (req, res) => {
  const { email, password, rememberMe = true } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.password) {
    throw new AppError(
      "This account uses Google sign-in. Continue with Google.",
      400
    );
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password.", 401);
  }

  const payload = await issueTokens(
    user,
    req,
    res,
    crypto.randomUUID(),
    rememberMe
  );
  return res.json(payload);
};

const forgotPassword = async (req, res) => {
  await User.findOne({ email: req.body.email });

  res.json({
    message:
      "If an account exists for this email, password reset instructions will be shared soon."
  });
};

const logout = async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];

  if (token) {
    try {
      const payload = verifyRefreshToken(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(payload.sub, {
        $pull: { refreshTokens: { _id: payload.sessionId } }
      });
    } catch (_error) {
      // Keep logout idempotent even if the refresh token is already invalid.
    }
  }

  clearRefreshCookie(res);
  res.json({ message: "Logged out successfully." });
};

const refreshToken = async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];

  if (!token) {
    throw new AppError("Refresh token missing.", 401);
  }

  try {
    const payload = verifyRefreshToken(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      clearRefreshCookie(res);
      throw new AppError("User not found.", 401);
    }

    const session = user.refreshTokens.find(
      (item) => item._id.toString() === payload.sessionId
    );

    if (!session || session.tokenHash !== hashToken(token)) {
      user.refreshTokens = [];
      await user.save();
      clearRefreshCookie(res);
      throw new AppError("Refresh token is invalid.", 401);
    }

    const nextPayload = await issueTokens(
      user,
      req,
      res,
      payload.sessionId,
      true
    );
    return res.json(nextPayload);
  } catch (_error) {
    clearRefreshCookie(res);
    throw new AppError("Refresh token expired or invalid.", 401);
  }
};
const me = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

const googleSuccess = async (req, res) => {
  const payload = await issueTokens(req.user, req, res);
  const redirectUrl = new URL(
    `${process.env.CLIENT_ORIGIN || "http://localhost:3000"}/oauth/success`
  );

  redirectUrl.searchParams.set("token", payload.accessToken);
  res.redirect(redirectUrl.toString());
};

const googleFailure = (_req, res) => {
  const redirectUrl = new URL(
    `${process.env.CLIENT_ORIGIN || "http://localhost:3000"}/login`
  );

  redirectUrl.searchParams.set("error", "google_auth_failed");
  res.redirect(redirectUrl.toString());
};

module.exports = {
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
};
