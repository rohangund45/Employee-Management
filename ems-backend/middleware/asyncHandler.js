/**
 * Async handler wrapper — eliminates try/catch in every controller.
 * Catches errors and forwards them to Express error handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
