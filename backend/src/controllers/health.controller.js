const { sendSuccess } = require('../utils/apiResponse');
const { env } = require('../config/env');

const healthCheck = (req, res) => {
  sendSuccess(res, {
    message: 'UrbanShield API is healthy',
    data: {
      status: 'ok',
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
      storage: 'dynamodb',
    },
  });
};

module.exports = { healthCheck };
