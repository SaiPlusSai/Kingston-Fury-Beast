const Joi = require('joi');
const { REPORT_CATEGORY_LIST, REPORT_PRIORITY } = require('../constants/reportCategories');
const { REPORT_STATUS_LIST } = require('../constants/reportStatus');

const createReportSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  category: Joi.string().valid(...REPORT_CATEGORY_LIST).required(),
  description: Joi.string().min(10).max(2000).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  location: Joi.string().max(300).optional().allow(null, ''),
  imageUrl: Joi.string().uri().optional().allow(null, ''),
  imageKeys: Joi.array().items(Joi.string()).max(5).optional(),
  priority: Joi.string()
    .valid(...Object.values(REPORT_PRIORITY))
    .optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...REPORT_STATUS_LIST).required(),
  notes: Joi.string().max(500).optional().allow(null, ''),
});

const listReportsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(1000).optional(),
  status: Joi.string().valid(...REPORT_STATUS_LIST).optional(),
  category: Joi.string().valid(...REPORT_CATEGORY_LIST).optional(),
  priority: Joi.string().valid(...Object.values(REPORT_PRIORITY)).optional(),
  search: Joi.string().max(100).optional(),
  userId: Joi.string().optional(),
});

const nearbyQuerySchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  radiusKm: Joi.number().min(0.1).max(50).default(5),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.string().valid(...REPORT_STATUS_LIST).optional(),
  category: Joi.string().valid(...REPORT_CATEGORY_LIST).optional(),
});

const reportIdParamSchema = Joi.object({
  id: Joi.string().required(),
});

module.exports = {
  createReportSchema,
  updateStatusSchema,
  listReportsQuerySchema,
  nearbyQuerySchema,
  reportIdParamSchema,
};
