const BaseRepository = require('./base.repository');
const { tableNames } = require('../config/database');

class ReportRepository extends BaseRepository {
  constructor() {
    super(tableNames.reports);
  }

  async findById(reportId) {
    return super.findById('reportId', reportId);
  }

  async create(report) {
    return this.save(report);
  }

  async update(reportId, updates) {
    const existing = await this.findById(reportId);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    return this.save(updated);
  }

  async findByUserId(userId) {
    const all = await this.findAll();
    return all.filter((r) => r.userId === userId).sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }

  async countByCityCode(cityCode) {
    const all = await this.findAll();
    return all.filter((report) => report.cityCode === cityCode).length;
  }

  async findWithFilters(filters = {}) {
    let items = await this.findAll();

    if (filters.userId) items = items.filter((r) => r.userId === filters.userId);
    if (filters.status) items = items.filter((r) => r.status === filters.status);
    if (filters.category) items = items.filter((r) => r.category === filters.category);
    if (filters.priority) items = items.filter((r) => r.priority === filters.priority);

    if (filters.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.title?.toLowerCase().includes(term) ||
          r.description?.toLowerCase().includes(term) ||
          r.location?.toLowerCase().includes(term) ||
          r.cityCode?.toLowerCase().includes(term) ||
          r.reportId?.toLowerCase().includes(term),
      );
    }

    items.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    return items;
  }
}

module.exports = new ReportRepository();
