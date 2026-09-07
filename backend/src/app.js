const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const { env, validateEnv, swaggerSpec } = require('./config');
const routes = require('./routes');
const requestId = require('./middlewares/requestId.middleware');
const sanitizeRequest = require('./middlewares/sanitize.middleware');
const { apiRateLimiter } = require('./middlewares/rateLimit.middleware');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

validateEnv();

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestId);
app.use(sanitizeRequest);

if (env.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: `${env.appName} is running`,
    data: {
      docs: '/api-docs',
      health: `${env.apiPrefix}/health`,
      version: '1.0.0',
    },
    errors: null,
  });
});

app.use(env.apiPrefix, apiRateLimiter, routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
