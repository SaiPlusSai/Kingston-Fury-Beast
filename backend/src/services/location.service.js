const reportRepository = require('../repositories/report.repository');
const awsLocationService = require('../aws/location.service');
const { filterByRadius, isValidCoordinate } = require('../utils/geo');
const { BadRequestError } = require('../errors/AppError');
const { REPORT_STATUS } = require('../constants/reportStatus');

class LocationService {
  async searchPlaces(text) {
    return awsLocationService.searchPlaces(text);
  }

  async getMapTile(z, x, y) {
    return awsLocationService.getMapTile(z, x, y);
  }

  async getMapMarkers(filters = {}) {
    let reports = await reportRepository.findWithFilters({
      status: filters.status,
      category: filters.category,
    });

    reports = reports.filter(
      (r) =>
        isValidCoordinate(r.latitude, r.longitude) &&
        r.status !== REPORT_STATUS.CANCELLED &&
        r.status !== 'deleted',
    );

    return reports.map((r) => ({
      id: r.reportId,
      latitude: r.latitude,
      longitude: r.longitude,
      category: r.category,
      status: r.status,
      priority: r.priority,
      title: r.title,
      description: r.description || '',
      createdAt: r.createdAt,
      upvotesCount: Array.isArray(r.upvotes) ? r.upvotes.length : 0,
      downvotesCount: Array.isArray(r.downvotes) ? r.downvotes.length : 0,
    }));
  }

  async radiusSearch({ latitude, longitude, radiusKm = 5, filters = {} }) {
    if (!isValidCoordinate(latitude, longitude)) {
      throw new BadRequestError('Invalid coordinates');
    }

    const reports = await reportRepository.findWithFilters(filters);
    return filterByRadius(reports, latitude, longitude, radiusKm);
  }

  async getHeatmapData() {
    const reports = await reportRepository.findAll();
    return reports
      .filter((r) => isValidCoordinate(r.latitude, r.longitude))
      .map((r) => ({
        lat: r.latitude,
        lng: r.longitude,
        weight: r.priority === 'critical' ? 3 : r.priority === 'high' ? 2 : 1,
      }));
  }
}

module.exports = new LocationService();
