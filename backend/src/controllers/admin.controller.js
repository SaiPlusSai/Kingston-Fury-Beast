const adminService = require('../services/admin.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await adminService.getDashboard();
  sendSuccess(res, { message: 'Dashboard data retrieved', data: dashboard });
});

const getMonitoring = asyncHandler(async (req, res) => {
  const summary = await adminService.getMonitoringSummary();
  sendSuccess(res, { message: 'Monitoring summary retrieved', data: summary });
});

const getActivityFeed = asyncHandler(async (req, res) => {
  const feed = await adminService.getActivityFeed(parseInt(req.query.limit, 10) || 20);
  sendSuccess(res, { message: 'Activity feed retrieved', data: feed });
});

const getEmergencySummary = asyncHandler(async (req, res) => {
  const summary = await adminService.getEmergencySummary();
  sendSuccess(res, { message: 'Emergency summary retrieved', data: summary });
});

module.exports = {
  getDashboard,
  getMonitoring,
  getActivityFeed,
  getEmergencySummary,
};
