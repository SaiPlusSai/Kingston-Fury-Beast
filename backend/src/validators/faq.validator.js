const Joi = require('joi');

const createFaqSchema = Joi.object({
  faqId: Joi.string().max(80).optional(),
  question: Joi.string().min(5).max(300).required(),
  answer: Joi.string().min(10).max(2000).required(),
  category: Joi.string().min(2).max(50).required(),
  keywords: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  isActive: Joi.boolean().optional(),
});

const updateFaqSchema = Joi.object({
  question: Joi.string().min(5).max(300).optional(),
  answer: Joi.string().min(10).max(2000).optional(),
  category: Joi.string().min(2).max(50).optional(),
  keywords: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

const queryFaqSchema = Joi.object({
  category: Joi.string().optional(),
  search: Joi.string().optional(),
  isActive: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
  limit: Joi.number().integer().min(1).max(200).optional(),
});

module.exports = {
  createFaqSchema,
  updateFaqSchema,
  queryFaqSchema,
};
