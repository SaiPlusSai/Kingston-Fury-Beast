const app = require('./app');
const { env } = require('./config/env');
const logger = require('./utils/logger');

const MAX_PORT_RETRIES = 10;

const startServer = (port, attemptsLeft = MAX_PORT_RETRIES) => {
  const server = app.listen(port, () => {
    logger.info(`${env.appName} started`, {
      port,
      environment: env.nodeEnv,
      apiPrefix: env.apiPrefix,
      docs: `http://localhost:${port}/api-docs`,
    });
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && attemptsLeft > 0) {
      logger.warn(`Port ${port} is in use, trying ${port + 1}`);
      startServer(port + 1, attemptsLeft - 1);
      return;
    }

    logger.error('Failed to start HTTP server', {
      code: error.code,
      port,
      message: error.message,
    });
    process.exit(1);
  });

  return server;
};

const server = startServer(env.port);

// Run diagnostics asynchronously (do not block server startup)
const { runDiagnostics } = require('./startup/diagnostics');
runDiagnostics().then((summary) => {
  const issues = summary.filter((s) => !s.ok);
  if (issues.length > 0) {
    logger.warn('Some AWS services reported issues or are misconfigured:', { issues });
  } else {
    logger.info('All AWS diagnostics passed');
  }
}).catch((err) => {
  logger.error('Failed running diagnostics', { message: err.message });
});

const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;
