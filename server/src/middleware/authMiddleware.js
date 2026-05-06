const User = require("../models/User");
const AppError = require("../utils/appError");
const { verifyAccessToken } = require("../utils/tokenService");

const authMiddleware = async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new AppError("Authentication required", 401));
  }

  try {
    const payload = verifyAccessToken(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      return next(new AppError("User not found", 401));
    }

    req.user = user;
    return next();
  } catch (_error) {
    return next(new AppError("Invalid or expired access token", 401));
  }
};

module.exports = authMiddleware;
