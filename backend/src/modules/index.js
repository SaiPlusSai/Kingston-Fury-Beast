/**
 * Punto de entrada modular para futura división en microservicios.
 * Cada módulo agrupa rutas, servicios y repositorios por dominio.
 */
module.exports = {
  auth: require('../routes/auth.routes'),
  reports: require('../routes/report.routes'),
  uploads: require('../routes/upload.routes'),
  notifications: require('../routes/notification.routes'),
  location: require('../routes/location.routes'),
  admin: require('../routes/admin.routes'),
};
