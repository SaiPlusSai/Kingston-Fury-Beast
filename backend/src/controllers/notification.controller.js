const notificationService = require('../services/notification.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.listByUser(req.user.userId, req.query);
  sendSuccess(res, { message: 'Notifications retrieved', data: notifications });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.userId);
  sendSuccess(res, { message: 'Notification marked as read', data: notification });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.userId);
  sendSuccess(res, { message: 'All notifications marked as read', data: result });
});

module.exports = {
  listNotifications,
  markAsRead,
  markAllAsRead,
};
