const { env, validateEnv } = require('./env');
const awsConfig = require('./aws');
const databaseConfig = require('./database');
const { swaggerSpec } = require('./swagger');

module.exports = {
  env,
  validateEnv,
  awsConfig,
  databaseConfig,
  swaggerSpec,
};
