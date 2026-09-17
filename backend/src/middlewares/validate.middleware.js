const { ValidationError } = require('../errors/AppError');

const validate = (schema, source = 'body') => (req, res, next) => {
  const data = source === 'params' ? req.params : source === 'query' ? req.query : req.body;
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.reduce((acc, detail) => {
      acc[detail.path.join('.')] = detail.message;
      return acc;
    }, {});
    return next(new ValidationError('Validation failed', errors));
  }

  if (source === 'body') req.body = value;
  else if (source === 'query') req.query = value;
  else req.params = value;

  next();
};

module.exports = validate;
