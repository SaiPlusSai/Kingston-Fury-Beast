const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');

// In development we avoid strict rate limiting to prevent blocking local testing.
if (env.isDevelopment) {
  const passthrough = (req, res, next) => next();
  module.exports = {
    apiRateLimiter: passthrough,
    authRateLimiter: passthrough,
  };
} else {
  const apiRateLimiter = rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later',
      data: null,
      errors: null,
    },
  });

  const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
      success: false,
      message: 'Too many authentication attempts',
      data: null,
      errors: null,
    },
  });

  module.exports = {
    apiRateLimiter,
    authRateLimiter,
  };
}
