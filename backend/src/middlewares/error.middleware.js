const { AppError } = require('../errors/AppError');
const { sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const { env } = require('../config/env');

const notFoundHandler = (req, res) => {
  return sendError(res, {
    message: `Route ${req.method} ${req.originalUrl} not found`,
    statusCode: 404,
  });
};

const errorHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    return sendError(res, {
      message: err.message,
      errors: err.errors,
      statusCode: err.statusCode,
    });
  }

  if (err.name === 'MulterError') {
    return sendError(res, {
      message: err.message,
      statusCode: 400,
    });
  }

  logger.error('Unhandled error', {
    message: err.message,
    stack: env.isDevelopment ? err.stack : undefined,
    path: req.originalUrl,
  });

  return sendError(res, {
    message: env.isProduction ? 'Internal server error' : err.message,
    statusCode: 500,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
