const Joi = require('joi');

const presignedUrlSchema = Joi.object({
  fileName: Joi.string().min(1).max(255).required(),
  contentType: Joi.string().valid('image/jpeg', 'image/png', 'image/webp').required(),
  fileSize: Joi.number().integer().min(1).optional(),
  purpose: Joi.string().valid('report', 'profile').default('report'),
});

module.exports = {
  presignedUrlSchema,
};
