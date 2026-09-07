const BaseRepository = require('./base.repository');
const { tableNames } = require('../config/database');

class ActivityLogRepository extends BaseRepository {
  constructor() {
    super(tableNames.activityLogs);
  }

  async create(log) {
    return this.save(log);
  }

  async findRecent(limit = 20) {
    const all = await this.findAll();
    return all.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)).slice(0, limit);
  }

  async findByEntityType(entityType, limit = 20) {
    const all = await this.findAll();
    return all
      .filter((l) => l.entityType === entityType)
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
      .slice(0, limit);
  }
}

module.exports = new ActivityLogRepository();
