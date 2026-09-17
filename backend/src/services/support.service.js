const supportRepository = require('../repositories/supportMessage.repository');
const userRepository = require('../repositories/user.repository');
const { createSupportMessageEntity } = require('../models/supportMessage.model');
const notificationService = require('./notification.service');
const { nowISO } = require('../helpers/dateHelper');
const { generateId } = require('../helpers/idHelper');
const { NotFoundError, ForbiddenError } = require('../errors/AppError');

class SupportService {
  async createMessage(userId, payload) {
    const timestamp = nowISO();
    const message = createSupportMessageEntity({
      supportMessageId: generateId('SUP'),
      userId,
      subject: payload.subject,
      message: payload.message,
      status: 'open',
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await supportRepository.create(message);
    return this._enrichMessage(message);
  }

  async listByUser(userId) {
    const items = await supportRepository.findByUserId(userId);
    return this._enrichMessages(items);
  }

  async listInbox() {
    const items = await supportRepository.findInbox();
    return this._enrichMessages(items);
  }

  async replyToMessage(supportMessageId, adminUserId, response) {
    const existing = await supportRepository.findById(supportMessageId);
    if (!existing) throw new NotFoundError('Support message not found');

    const updated = await supportRepository.update(supportMessageId, {
      status: 'answered',
      response,
      repliedBy: adminUserId,
      repliedAt: nowISO(),
    });

    await notificationService.createNotification({
      userId: existing.userId,
      type: 'info',
      title: 'Respuesta de Soporte',
      message: `Un administrador ha respondido a tu consulta: "${existing.subject}"`,
      metadata: { supportMessageId, response },
    });

    return this._enrichMessage(updated);
  }

  async markClosed(supportMessageId, adminUserId) {
    const existing = await supportRepository.findById(supportMessageId);
    if (!existing) throw new NotFoundError('Support message not found');
    if (existing.repliedBy && existing.repliedBy !== adminUserId) {
      throw new ForbiddenError('Only the replying admin can close the thread');
    }
    const updated = await supportRepository.update(supportMessageId, { status: 'closed' });
    return this._enrichMessage(updated);
  }

  async _enrichMessage(message) {
    if (!message) return null;
    const user = await userRepository.findById(message.userId).catch(() => null);
    return {
      ...message,
      reporterName: user?.name || 'Ciudadano',
      reporterEmail: user?.email || null,
    };
  }

  async _enrichMessages(messages) {
    return Promise.all((messages || []).map((message) => this._enrichMessage(message)));
  }
}

module.exports = new SupportService();
