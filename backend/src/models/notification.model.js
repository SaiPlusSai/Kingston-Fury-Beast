const createNotificationEntity = ({
  notificationId,
  userId,
  type,
  title,
  message,
  metadata = {},
  isRead = false,
  createdAt,
}) => ({
  notificationId,
  userId,
  type,
  title,
  message,
  metadata,
  isRead,
  createdAt,
});

module.exports = {
  createNotificationEntity,
};
