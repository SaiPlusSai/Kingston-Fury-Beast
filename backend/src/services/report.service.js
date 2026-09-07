const reportRepository = require('../repositories/report.repository');
const notificationRepository = require('../repositories/notification.repository');
const activityLogRepository = require('../repositories/activityLog.repository');
const userRepository = require('../repositories/user.repository');
const { createReportEntity } = require('../models/report.model');
const { createNotificationEntity } = require('../models/notification.model');
const { createActivityLogEntity } = require('../models/activityLog.model');
const { generateReportId, generateNotificationId, generateActivityId, normalizeCityCode } = require('../helpers/idHelper');
const { nowISO } = require('../helpers/dateHelper');
const { NotFoundError, ForbiddenError } = require('../errors/AppError');
const { REPORT_STATUS } = require('../constants/reportStatus');
const { CATEGORY_DEFAULT_PRIORITY, REPORT_PRIORITY } = require('../constants/reportCategories');
const { ROLES } = require('../constants/roles');
const { parsePagination, paginateArray } = require('../utils/pagination');
const { filterByRadius } = require('../utils/geo');
const snsService = require('../aws/sns.service');
const notificationService = require('./notification.service');
const locationService = require('../aws/location.service');

const CITY_CODE_MAP = [
  { match: ['SANTA CRUZ', 'SANTACRUZ'], code: 'SCZ' },
  { match: ['LA PAZ', 'LAPAZ'], code: 'LP' },
  { match: ['COCHABAMBA'], code: 'CBBA' },
  { match: ['SUCRE'], code: 'SCR' },
  { match: ['TARIJA'], code: 'TJA' },
  { match: ['ORURO'], code: 'ORU' },
  { match: ['POTOSI', 'POTOSI'], code: 'PTS' },
  { match: ['TRINIDAD'], code: 'TRN' },
  { match: ['BENI'], code: 'BEN' },
  { match: ['PANDO'], code: 'PND' },
];

const resolveLocationDetails = async (latitude, longitude) => {
  const place = await locationService.reverseGeocode(latitude, longitude);
  const cityText = [place?.city, place?.municipality, place?.region, place?.label]
    .filter(Boolean)
    .join(' ')
    .toUpperCase();

  let code = normalizeCityCode(place?.city || place?.municipality || place?.region || 'UNK');
  for (const candidate of CITY_CODE_MAP) {
    if (candidate.match.some((needle) => cityText.includes(needle))) {
      code = candidate.code;
      break;
    }
  }

  // derive exactZone from the first part of the label or municipality
  let exactZone = 'Zona Desconocida';
  if (place?.label) {
    exactZone = place.label.split(',')[0].trim();
  } else if (place?.municipality) {
    exactZone = place.municipality;
  }

  return { cityCode: code, exactZone };
};

class ReportService {
  async createReport(userId, data) {
    const timestamp = nowISO();
    const priority = data.priority || CATEGORY_DEFAULT_PRIORITY[data.category] || REPORT_PRIORITY.MEDIUM;
    const { cityCode, exactZone } = await resolveLocationDetails(data.latitude, data.longitude);
    const sequence = (await reportRepository.countByCityCode(cityCode)) + 1;
    const reportId = generateReportId(data.category, cityCode, sequence);

    // Verificar TrustScore del usuario para decidir si publicar
    const user = await userRepository.findById(userId);
    const score = user?.trustScore ?? 50;
    
    // Si su score es muy bajo, lo mandamos a quarantine (usando cancelled como sustituto o dejando pendiente sin notificar)
    const status = score < 20 ? REPORT_STATUS.CANCELLED : REPORT_STATUS.PENDING;

    const report = createReportEntity({
      reportId,
      sequence,
      cityCode,
      userId,
      title: data.title,
      category: data.category,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      location: data.location || exactZone,
      exactZone,
      imageUrl: data.imageUrl || null,
      imageKeys: data.imageKeys || [],
      status: REPORT_STATUS.PENDING,
      priority,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await reportRepository.create(report);
    await this._logActivity('report', reportId, 'REPORT_CREATED', userId, { category: report.category });

    if (status !== REPORT_STATUS.CANCELLED) {
      await notificationService.notifyReportCreated(report);
      await snsService.publishEmergencyAlert({
        reportId,
        category: report.category,
        priority: report.priority,
        title: report.title,
        description: report.description,
        location: report.location,
        exactZone: report.exactZone,
        latitude: report.latitude,
        longitude: report.longitude,
      });
    }

    return report;
  }

  async listReports(query, currentUser) {
    const filters = {
      status: query.status,
      category: query.category,
      priority: query.priority,
      search: query.search,
    };

    if (currentUser.role === ROLES.CITIZEN) {
      filters.userId = currentUser.userId;
    } else if (query.userId) {
      filters.userId = query.userId;
    }

    const pagination = parsePagination(query);
    const items = await reportRepository.findWithFilters(filters);
    const enriched = await this._attachReporterInfo(items, currentUser);
    return paginateArray(enriched, pagination);
  }

  async getReportById(reportId, currentUser) {
    const report = await reportRepository.findById(reportId);
    if (!report) throw new NotFoundError('Report not found');

    if (currentUser.role === ROLES.CITIZEN && report.userId !== currentUser.userId) {
      throw new ForbiddenError('You do not have access to this report');
    }

    return this._attachReporterInfo([report], currentUser).then(([item]) => item);
  }

  async getPublicReportById(reportId) {
    const report = await reportRepository.findById(reportId);
    if (!report) throw new NotFoundError('Report not found');
    
    let reporterName = 'Ciudadano';
    let reporterTrustScore = 50;
    let reporterAvatarUrl = null;
    try {
      const user = await userRepository.findById(report.userId);
      if (user) {
        reporterName = user.name;
        reporterTrustScore = user.trustScore ?? 50;
        reporterAvatarUrl = user.avatarUrl || null;
      }
    } catch (err) {}

    return {
      ...report,
      imageUrls: (report.imageKeys && report.imageKeys.length > 0) 
        ? report.imageKeys.map(k => `https://${require('../config/aws').awsInfrastructure.s3.bucketName}.s3.${require('../config/aws').awsInfrastructure.region}.amazonaws.com/${k}`) 
        : (report.imageUrl ? [report.imageUrl] : []),
      reporterName,
      reporterTrustScore,
      reporterAvatarUrl,
    };
  }

  async _attachReporterInfo(reports, currentUser) {
    const shouldEnrich = currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.CITIZEN;
    if (!shouldEnrich || !Array.isArray(reports) || reports.length === 0) return reports;

    const cache = new Map();
    return Promise.all(
      reports.map(async (report) => {
        if (!report?.userId) return report;
        if (!cache.has(report.userId)) {
          cache.set(
            report.userId,
            userRepository.findById(report.userId).catch(() => null),
          );
        }
        const user = await cache.get(report.userId);
        return {
          ...report,
          imageUrls: (report.imageKeys && report.imageKeys.length > 0) 
            ? report.imageKeys.map(k => `https://${require('../config/aws').awsInfrastructure.s3.bucketName}.s3.${require('../config/aws').awsInfrastructure.region}.amazonaws.com/${k}`) 
            : (report.imageUrl ? [report.imageUrl] : []),
          reporterName: user?.name || 'Ciudadano',
          reporterTrustScore: user?.trustScore ?? 50,
          reporterEmail: user?.email || null,
          reporterAvatarUrl: user?.avatarUrl || null,
        };
      }),
    );
  }

  async updateStatus(reportId, status, currentUser, notes) {
    const report = await this.getReportById(reportId, currentUser);
    const updates = {
      status,
      updatedAt: nowISO(),
    };

    if (status === REPORT_STATUS.RESOLVED) {
      updates.resolvedAt = nowISO();
    }

    if (notes) updates.adminNotes = notes;

    const updated = await reportRepository.update(reportId, updates);
    await this._logActivity('report', reportId, 'STATUS_UPDATED', currentUser.userId, { status });

    await notificationService.notifyStatusChange(updated, report.status);
    return updated;
  }

  async resolveReport(reportId, currentUser) {
    const res = await this.updateStatus(reportId, REPORT_STATUS.RESOLVED, currentUser);
    
    // Premiar al usuario que lo reportó
    const user = await userRepository.findById(res.userId);
    if (user) {
      await userRepository.update(user.userId, { trustScore: (user.trustScore || 50) + 10 });
    }
    
    return res;
  }

  async deleteReport(reportId, currentUser) {
    const report = await this.getReportById(reportId, currentUser);
    // En lugar de borrarlo físicamente, lo marcamos como eliminado para el historial
    await reportRepository.update(reportId, { status: 'deleted', updatedAt: nowISO() });
    await this._logActivity('report', reportId, 'REPORT_DELETED', currentUser.userId, {});
    return { success: true };
  }

  async voteReport(reportId, voteType, currentUser) {
    const report = await reportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundError('Report not found');
    }
    
    if (report.userId === currentUser.userId) {
      throw new ForbiddenError('No puedes votar tu propio reporte');
    }

    const upvotes = Array.isArray(report.upvotes) ? report.upvotes : [];
    const downvotes = Array.isArray(report.downvotes) ? report.downvotes : [];

    if (upvotes.includes(currentUser.userId) || downvotes.includes(currentUser.userId)) {
      throw new ForbiddenError('Ya has votado en este reporte');
    }

    const updates = { updatedAt: nowISO() };
    const author = await userRepository.findById(report.userId);
    let newScore = author?.trustScore || 50;

    if (voteType === 'upvote') {
      updates.upvotes = [...upvotes, currentUser.userId];
      if (updates.upvotes.length >= 3 && report.status === REPORT_STATUS.PENDING) {
        updates.status = 'verified'; // Lo usamos lógicamente
        newScore += 5;
      }
    } else if (voteType === 'downvote') {
      updates.downvotes = [...downvotes, currentUser.userId];
      if (updates.downvotes.length >= 3) {
        updates.status = REPORT_STATUS.CANCELLED; // Lo oculta
        newScore -= 15;
      }
    }

    if (author && newScore !== author.trustScore) {
      await userRepository.update(author.userId, { trustScore: Math.max(0, newScore) });
    }

    const updated = await reportRepository.update(reportId, updates);
    await this._logActivity('report', reportId, 'REPORT_VOTED', currentUser.userId, { voteType });

    return updated;
  }

  async getNearbyReports({ latitude, longitude, radiusKm = 5, query = {} }) {
    const filters = { status: query.status, category: query.category };
    let items = await reportRepository.findWithFilters(filters);
    items = filterByRadius(items, latitude, longitude, radiusKm);
    const pagination = parsePagination(query);
    return paginateArray(items, pagination);
  }

  async getAnalytics() {
    const all = await reportRepository.findAll();
    const byStatus = {};
    const byCategory = {};
    const byPriority = {};

    all.forEach((r) => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      byCategory[r.category] = (byCategory[r.category] || 0) + 1;
      byPriority[r.priority] = (byPriority[r.priority] || 0) + 1;
    });

    const today = new Date().toISOString().split('T')[0];
    const resolvedToday = all.filter(
      (r) => r.resolvedAt && r.resolvedAt.startsWith(today),
    ).length;

    return {
      total: all.length,
      active: all.filter((r) => r.status !== REPORT_STATUS.RESOLVED && r.status !== REPORT_STATUS.CANCELLED).length,
      resolvedToday,
      byStatus,
      byCategory,
      byPriority,
      criticalCount: all.filter((r) => r.priority === REPORT_PRIORITY.CRITICAL && r.status !== REPORT_STATUS.RESOLVED).length,
    };
  }

  async _logActivity(entityType, entityId, action, performedBy, metadata = {}) {
    await activityLogRepository.create(
      createActivityLogEntity({
        activityId: generateActivityId(),
        entityType,
        entityId,
        action,
        performedBy,
        metadata,
        createdAt: nowISO(),
      }),
    );
  }
}

module.exports = new ReportService();
