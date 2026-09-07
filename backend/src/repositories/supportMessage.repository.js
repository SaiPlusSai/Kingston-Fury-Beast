const BaseRepository = require('./base.repository');
const { tableNames } = require('../config/database');

class SupportMessageRepository extends BaseRepository {
  constructor() {
    super(tableNames.supportMessages);
  }

  async findById(supportMessageId) {
    return super.findById('supportMessageId', supportMessageId);
  }

  async create(message) {
    return this.save(message);
  }

  async update(supportMessageId, updates) {
    const existing = await this.findById(supportMessageId);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    return this.save(updated);
  }

  async findByUserId(userId) {
    const all = await this.findAll();
    return all.filter((item) => item.userId === userId).sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }

  async findInbox() {
    const all = await this.findAll();
    return all.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }
}

module.exports = new SupportMessageRepository();
