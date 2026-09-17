const Joi = require('joi');
const { REPORT_CATEGORY_LIST } = require('../constants/reportCategories');
const { REPORT_STATUS_LIST } = require('../constants/reportStatus');

const searchPlacesSchema = Joi.object({
  q: Joi.string().min(2).max(200).required(),
});

const radiusSearchSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  radiusKm: Joi.number().min(0.1).max(50).default(5),
  status: Joi.string().valid(...REPORT_STATUS_LIST).optional(),
  category: Joi.string().valid(...REPORT_CATEGORY_LIST).optional(),
});

const mapMarkersQuerySchema = Joi.object({
  status: Joi.string().valid(...REPORT_STATUS_LIST).optional(),
  category: Joi.string().valid(...REPORT_CATEGORY_LIST).optional(),
});

module.exports = {
  searchPlacesSchema,
  radiusSearchSchema,
  mapMarkersQuerySchema,
};
