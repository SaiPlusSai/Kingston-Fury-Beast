const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { env } = require('./env');

const openApiPath = path.resolve(__dirname, '../docs/openapi.yaml');
const openApiDoc = yaml.load(fs.readFileSync(openApiPath, 'utf8'));

const swaggerSpec = {
  ...openApiDoc,
  info: {
    title: env.appName,
    version: '1.0.0',
    description:
      'REST API for UrbanShield smart-city emergency reporting platform. Prepared for AWS deployment.',
    contact: {
      name: 'UrbanShield Engineering',
      email: 'api@urbanshield.io',
    },
  },
  servers: [
    { url: `http://localhost:${env.port}${env.apiPrefix}`, description: 'Development' },
    { url: 'https://api.urbanshield.io/api', description: 'Production' },
  ],
  components: {
    ...(openApiDoc.components || {}),
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object', nullable: true },
          errors: { type: 'object', nullable: true },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

module.exports = { swaggerSpec };
