const Joi = require('joi');
const { ROLE_LIST } = require('../constants/roles');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().max(20).optional().allow(null, ''),
  role: Joi.string().valid(...ROLE_LIST).default('citizen'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().optional(), // Needed for Cognito flow
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

const logoutSchema = Joi.object({
  refreshToken: Joi.string().optional(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().max(20).optional().allow(null, ''),
  avatarKey: Joi.string().max(500).optional().allow(null, ''),
  avatarUrl: Joi.string().uri().max(1000).optional().allow(null, ''),
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  logoutSchema,
  updateProfileSchema,
  updatePasswordSchema,
};
