/**
 * Almacén en memoria para desarrollo local sin AWS.
 * No usar en producción.
 */
const stores = {
  users: new Map(),
  reports: new Map(),
  notifications: new Map(),
  activityLogs: new Map(),
  refreshTokens: new Map(),
  passwordResetTokens: new Map(),
};

const seedDevelopmentData = () => {
  const bcrypt = require('bcryptjs');
  const { ROLES } = require('../constants/roles');
  const { REPORT_STATUS } = require('../constants/reportStatus');
  const { REPORT_CATEGORIES, REPORT_PRIORITY } = require('../constants/reportCategories');

  if (stores.users.size > 0) return;

  const adminId = 'USR-admin-dev';
  const citizenId = 'USR-citizen-dev';

  const defaultPasswordHash = bcrypt.hashSync('Urban123!', 12);

  stores.users.set(adminId, {
    userId: adminId,
    email: 'admin@urbanshield.com',
    password: defaultPasswordHash,
    name: 'Admin Principal',
    role: ROLES.ADMIN,
    phone: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  stores.users.set(citizenId, {
    userId: citizenId,
    email: 'citizen@urbanshield.com',
    password: defaultPasswordHash,
    name: 'Juan Pérez',
    role: ROLES.CITIZEN,
    phone: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const sampleReports = [
    {
      reportId: 'INC-0001',
      userId: citizenId,
      title: 'Incendio en mercado central',
      category: REPORT_CATEGORIES.FIRE,
      description: 'Incendio de gran magnitud en el pabellón sur.',
      latitude: -17.78,
      longitude: -63.18,
      location: 'Mercado Central, Zona 1',
      imageUrl: null,
      imageKeys: [],
      status: REPORT_STATUS.IN_PROGRESS,
      priority: REPORT_PRIORITY.CRITICAL,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
    },
    {
      reportId: 'INC-0002',
      userId: citizenId,
      title: 'Inundación en barrio sur',
      category: REPORT_CATEGORIES.FLOOD,
      description: 'Desborde de alcantarilla afecta 3 cuadras.',
      latitude: -17.8,
      longitude: -63.2,
      location: 'Barrio Sur, Calle 4',
      imageUrl: null,
      imageKeys: [],
      status: REPORT_STATUS.DISPATCHED,
      priority: REPORT_PRIORITY.HIGH,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
    },
  ];

  sampleReports.forEach((r) => stores.reports.set(r.reportId, r));
};

module.exports = {
  stores,
  seedDevelopmentData,
};
