const BaseRepository = require('./base.repository');
const { tableNames } = require('../config/database');

class NotificationRepository extends BaseRepository {
  constructor() {
    super(tableNames.notifications);
  }

  async findById(notificationId) {
    return super.findById('notificationId', notificationId);
  }

  async findByUserId(userId) {
    const all = await this.findAll();
    return all.filter((n) => n.userId === userId).sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }

  async create(notification) {
    return this.save(notification);
  }

  async markAsRead(notificationId) {
    const existing = await this.findById(notificationId);
    if (!existing) return null;
    return this.save({ ...existing, isRead: true });
  }

  async markAllAsRead(userId) {
    const notifications = await this.findByUserId(userId);
    const updated = [];
    for (const n of notifications) {
      if (!n.isRead) {
        updated.push(await this.save({ ...n, isRead: true }));
      }
    }
    return updated;
  }
}

module.exports = new NotificationRepository();
