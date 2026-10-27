const serverless = require('serverless-http');
const app = require('./app');

/**
 * Handler para AWS Lambda + API Gateway HTTP API.
 */
module.exports.handler = serverless(app);
