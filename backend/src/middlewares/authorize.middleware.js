const { ForbiddenError } = require('../errors/AppError');

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new ForbiddenError('Authentication required'));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new ForbiddenError('Insufficient permissions'));
  }

  next();
};

module.exports = authorize;
