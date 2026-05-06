const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res)).catch(next);

module.exports = asyncHandler;
