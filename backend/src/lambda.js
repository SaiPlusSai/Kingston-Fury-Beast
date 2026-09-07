const serverless = require('serverless-http');
const app = require('./app');

/**
 * Handler para AWS Lambda + API Gateway.
 * Desplegar con serverless framework o SAM.
 */
module.exports.handler = serverless(app, {
  basePath: process.env.API_PREFIX || '/api',
});
