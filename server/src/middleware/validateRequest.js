const { validationResult } = require("express-validator");
const AppError = require("../utils/appError");

const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new AppError(
        errors
          .array()
          .map((error) => error.msg)
          .join(", "),
        400
      )
    );
  }

  return next();
};

module.exports = validateRequest;
