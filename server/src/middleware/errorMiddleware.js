const AppError = require("../utils/appError");

const notFoundHandler = (_req, _res, next) => {
  next(new AppError("Route not found", 404));
};

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 ? "Something went wrong on the server." : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    message,
    ...(statusCode === 500 && process.env.NODE_ENV !== "production"
      ? { details: error.message }
      : {})
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
