require('dotenv').config();

const requiredInProduction = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || '/api',
  appName: process.env.APP_NAME || 'UrbanShield API',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    dynamodbEndpoint: process.env.DYNAMODB_ENDPOINT,
  },
  dynamodb: {
    usersTable: process.env.DYNAMODB_TABLE_USERS || 'UrbanShield-Users',
    reportsTable: process.env.DYNAMODB_TABLE_REPORTS || 'UrbanShield-Reports',
    notificationsTable: process.env.DYNAMODB_TABLE_NOTIFICATIONS || 'UrbanShield-Notifications',
    activityLogsTable: process.env.DYNAMODB_TABLE_ACTIVITY_LOGS || 'UrbanShield-ActivityLogs',
    supportMessagesTable: process.env.DYNAMODB_TABLE_SUPPORT_MESSAGES || 'UrbanShield-SupportMessages',
  },
  s3: {
    bucketName: process.env.S3_BUCKET_NAME || 'urbanshield-uploads',
    profileBucketName: process.env.S3_PROFILE_BUCKET_NAME || 'urbanshield-profile-photos',
    presignedUrlExpiresIn: parseInt(process.env.S3_PRESIGNED_URL_EXPIRES_IN, 10) || 3600,
    maxSizeMb: parseInt(process.env.S3_UPLOAD_MAX_SIZE_MB, 10) || 5,
    profileMaxSizeMb: parseInt(process.env.S3_PROFILE_UPLOAD_MAX_SIZE_MB, 10) || 2,
  },
  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID,
    clientSecret: process.env.COGNITO_CLIENT_SECRET,
    useCognito: process.env.USE_COGNITO === 'true',
  },
  sns: {
    emergencyAlertsTopic: process.env.SNS_TOPIC_EMERGENCY_ALERTS,
    activityNotificationsTopic: process.env.SNS_TOPIC_ACTIVITY_NOTIFICATIONS,
  },
  location: {
    mapName: process.env.LOCATION_MAP_NAME || 'UrbanShieldMap',
    placeIndex: process.env.LOCATION_PLACE_INDEX || 'UrbanShieldPlaceIndex',
  },
  passwordReset: {
    tokenExpiresIn: process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN || '1h',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  email: {
    user: process.env.EMAIL_USER || 'gestiontallerdegradoucb@gmail.com',
    pass: process.env.EMAIL_PASS || 'prhb cfzz ejst dzvr',
  },
};

function validateEnv() {
  if (!env.isProduction) return;

  const missing = requiredInProduction.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = { env, validateEnv };
