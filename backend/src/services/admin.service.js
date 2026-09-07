const reportService = require('./report.service');
const activityLogRepository = require('../repositories/activityLog.repository');
const userRepository = require('../repositories/user.repository');
const reportRepository = require('../repositories/report.repository');
const { REPORT_STATUS } = require('../constants/reportStatus');
const { REPORT_PRIORITY } = require('../constants/reportCategories');

class AdminService {
  async getDashboard() {
    const analytics = await reportService.getAnalytics();
    const recentActivity = await activityLogRepository.findRecent(10);
    const allReports = await reportRepository.findAll();
    const criticalReports = allReports
      .filter((r) => r.priority === REPORT_PRIORITY.CRITICAL && r.status !== REPORT_STATUS.RESOLVED)
      .slice(0, 5);

    const users = await userRepository.findAll();

    const resolvedReports = allReports.filter(r => r.resolvedAt && r.createdAt);
    let avgResponseTime = '—';
    if (resolvedReports.length > 0) {
      const totalMins = resolvedReports.reduce((acc, r) => {
        const diff = new Date(r.resolvedAt) - new Date(r.createdAt);
        return acc + Math.max(0, diff / 60000);
      }, 0);
      const avg = Math.round(totalMins / resolvedReports.length);
      
      // format as hours/mins if > 60
      if (avg >= 60) {
        const h = Math.floor(avg / 60);
        const m = avg % 60;
        avgResponseTime = `${h}h ${m}m`;
      } else {
        avgResponseTime = `${avg}m`;
      }
    }

    const criticalZonesSet = new Set(
      allReports
        .filter(r => r.priority === REPORT_PRIORITY.CRITICAL && r.status !== REPORT_STATUS.RESOLVED && r.cityCode)
        .map(r => r.cityCode)
    );

    return {
      stats: {
        activeIncidents: analytics.active,
        resolvedToday: analytics.resolvedToday,
        totalReports: analytics.total,
        criticalOpen: analytics.criticalCount,
        totalUsers: users.length,
        avgResponseTime,
        criticalZones: criticalZonesSet.size,
      },
      analytics,
      criticalReports,
      recentActivity,
    };
  }

  async getMonitoringSummary() {
    const all = await reportRepository.findAll();
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    return {
      reportsLast24h: all.filter((r) => r.createdAt >= last24h).length,
      pendingCount: all.filter((r) => r.status === REPORT_STATUS.PENDING).length,
      inProgressCount: all.filter((r) => r.status === REPORT_STATUS.IN_PROGRESS).length,
      dispatchedCount: all.filter((r) => r.status === REPORT_STATUS.DISPATCHED).length,
    };
  }

  async getActivityFeed(limit = 20) {
    return activityLogRepository.findRecent(limit);
  }

  async getEmergencySummary() {
    const analytics = await reportService.getAnalytics();
    return {
      summary: analytics,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new AdminService();
