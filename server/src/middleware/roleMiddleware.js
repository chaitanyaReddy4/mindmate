const AppError = require("../utils/appError");

const roleMiddleware = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError("Forbidden", 403));
  }

  return next();
};

module.exports = roleMiddleware;
