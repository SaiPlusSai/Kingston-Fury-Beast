const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  sendSuccess(res, { message: 'Registration successful', data: result, statusCode: 201 });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, { message: 'Login successful', data: result });
});

const refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshToken(req.body.refreshToken);
  sendSuccess(res, { message: 'Token refreshed', data: result });
});

const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.user.userId, req.body.refreshToken);
  sendSuccess(res, { message: 'Logout successful', data: result });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  sendSuccess(res, { message: result.message, data: result });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  sendSuccess(res, { message: result.message, data: result });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.userId);
  sendSuccess(res, { message: 'Profile retrieved', data: user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.userId, req.body);
  sendSuccess(res, { message: 'Profile updated', data: user });
});

const updatePassword = asyncHandler(async (req, res) => {
  const result = await authService.updatePassword(req.user.userId, req.body);
  sendSuccess(res, { message: result.message, data: result });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  updatePassword,
};
