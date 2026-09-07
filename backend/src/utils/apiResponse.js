const sendSuccess = (res, { message = 'Success', data = null, statusCode = 200 } = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: null,
  });
};

const sendError = (res, { message = 'Error', errors = null, statusCode = 500 } = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
