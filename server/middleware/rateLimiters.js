const rateLimit = require("express-rate-limit");

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const limit = Number(process.env.RATE_LIMIT_MAX) || 20;

const createAnalysisRateLimiter = () => rateLimit({
  windowMs,
  limit,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many analysis requests. Please try again later.",
    data: null,
  },
});

module.exports = { createAnalysisRateLimiter };
