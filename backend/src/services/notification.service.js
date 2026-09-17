const notificationRepository = require('../repositories/notification.repository');
const { createNotificationEntity } = require('../models/notification.model');
const { generateNotificationId } = require('../helpers/idHelper');
const { nowISO } = require('../helpers/dateHelper');
const { NotFoundError, ForbiddenError } = require('../errors/AppError');
const snsService = require('../aws/sns.service');

class NotificationService {
  async createNotification({ userId, type, title, message, metadata = {} }) {
    const notification = createNotificationEntity({
      notificationId: generateNotificationId(),
      userId,
      type,
      title,
      message,
      metadata,
      isRead: false,
      createdAt: nowISO(),
    });

    await notificationRepository.create(notification);
    await snsService.publishActivityNotification(notification);
    return notification;
  }

  async notifyReportCreated(report) {
    return this.createNotification({
      userId: report.userId,
      type: 'info',
      title: 'Reporte registrado',
      message: `Tu reporte ${report.reportId} ha sido registrado exitosamente.`,
      metadata: { reportId: report.reportId },
    });
  }

  async notifyStatusChange(report, previousStatus) {
    return this.createNotification({
      userId: report.userId,
      type: 'update',
      title: `Actualización de reporte ${report.reportId}`,
      message: `El estado cambió de ${previousStatus} a ${report.status}.`,
      metadata: { reportId: report.reportId, status: report.status },
    });
  }

  async sendEmergencyAlert({ userIds, title, message, metadata = {} }) {
    const notifications = [];
    for (const userId of userIds) {
      notifications.push(
        await this.createNotification({
          userId,
          type: 'alert',
          title,
          message,
          metadata,
        }),
      );
    }
    return notifications;
  }

  async listByUser(userId, query = {}) {
    let items = await notificationRepository.findByUserId(userId);
    if (query.unreadOnly === 'true') {
      items = items.filter((n) => !n.isRead);
    }
    return items;
  }

  async markAsRead(notificationId, userId) {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) throw new NotFoundError('Notification not found');
    if (notification.userId !== userId) throw new ForbiddenError('Access denied');
    return notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId) {
    return notificationRepository.markAllAsRead(userId);
  }
}

module.exports = new NotificationService();
