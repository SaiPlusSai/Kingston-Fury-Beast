const roles = require('./roles');
const reportStatus = require('./reportStatus');
const reportCategories = require('./reportCategories');
const httpStatus = require('./httpStatus');

module.exports = {
  ...roles,
  ...reportStatus,
  ...reportCategories,
  ...httpStatus,
};
