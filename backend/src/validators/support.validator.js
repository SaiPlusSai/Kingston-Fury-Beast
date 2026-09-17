const Joi = require('joi');

const createSupportMessageSchema = Joi.object({
  subject: Joi.string().min(3).max(120).required(),
  message: Joi.string().min(10).max(2000).required(),
});

const replySupportMessageSchema = Joi.object({
  response: Joi.string().min(3).max(4000).required(),
});

module.exports = {
  createSupportMessageSchema,
  replySupportMessageSchema,
};
