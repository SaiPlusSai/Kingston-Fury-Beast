const { env } = require('./env');

const tableNames = {
  users: env.dynamodb.usersTable,
  reports: env.dynamodb.reportsTable,
  notifications: env.dynamodb.notificationsTable,
  activityLogs: env.dynamodb.activityLogsTable,
  supportMessages: env.dynamodb.supportMessagesTable,
};

const tableSchemas = {
  users: {
    TableName: tableNames.users,
    KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI_Email',
        KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
  reports: {
    TableName: tableNames.reports,
    KeySchema: [{ AttributeName: 'reportId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'reportId', AttributeType: 'S' },
      { AttributeName: 'status', AttributeType: 'S' },
      { AttributeName: 'category', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI_StatusCreatedAt',
        KeySchema: [
          { AttributeName: 'status', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'GSI_CategoryCreatedAt',
        KeySchema: [
          { AttributeName: 'category', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'GSI_UserIdCreatedAt',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
  notifications: {
    TableName: tableNames.notifications,
    KeySchema: [{ AttributeName: 'notificationId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'notificationId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI_UserIdCreatedAt',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
  activityLogs: {
    TableName: tableNames.activityLogs,
    KeySchema: [{ AttributeName: 'activityId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'activityId', AttributeType: 'S' },
      { AttributeName: 'entityType', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI_EntityTypeCreatedAt',
        KeySchema: [
          { AttributeName: 'entityType', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
  supportMessages: {
    TableName: tableNames.supportMessages,
    KeySchema: [{ AttributeName: 'supportMessageId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'supportMessageId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'status', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI_StatusCreatedAt',
        KeySchema: [
          { AttributeName: 'status', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'GSI_UserIdCreatedAt',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
};

const globalSecondaryIndexes = {
  reports: tableSchemas.reports.GlobalSecondaryIndexes.map(({ IndexName, KeySchema }) => {
    const partitionKey = KeySchema.find((key) => key.KeyType === 'HASH');
    const sortKey = KeySchema.find((key) => key.KeyType === 'RANGE');
    return {
      IndexName,
      PartitionKey: partitionKey?.AttributeName,
      SortKey: sortKey?.AttributeName,
    };
  }),
  notifications: tableSchemas.notifications.GlobalSecondaryIndexes.map(({ IndexName, KeySchema }) => {
    const partitionKey = KeySchema.find((key) => key.KeyType === 'HASH');
    const sortKey = KeySchema.find((key) => key.KeyType === 'RANGE');
    return {
      IndexName,
      PartitionKey: partitionKey?.AttributeName,
      SortKey: sortKey?.AttributeName,
    };
  }),
  activityLogs: tableSchemas.activityLogs.GlobalSecondaryIndexes.map(({ IndexName, KeySchema }) => {
    const partitionKey = KeySchema.find((key) => key.KeyType === 'HASH');
    const sortKey = KeySchema.find((key) => key.KeyType === 'RANGE');
    return {
      IndexName,
      PartitionKey: partitionKey?.AttributeName,
      SortKey: sortKey?.AttributeName,
    };
  }),
};

const awsInfrastructure = {
  region: env.aws.region,
  dynamodb: {
    endpoint: env.aws.dynamodbEndpoint,
    tables: tableNames,
    schemas: tableSchemas,
    indexes: globalSecondaryIndexes,
  },
  s3: {
    bucketName: env.s3.bucketName,
    profileBucketName: env.s3.profileBucketName,
    presignedUrlExpiresIn: env.s3.presignedUrlExpiresIn,
    maxSizeMb: env.s3.maxSizeMb,
    profileMaxSizeMb: env.s3.profileMaxSizeMb,
  },
  cognito: {
    userPoolId: env.cognito.userPoolId,
    clientId: env.cognito.clientId,
    clientSecret: env.cognito.clientSecret,
    useCognito: env.cognito.useCognito,
  },
  sns: {
    emergencyAlertsTopic: env.sns.emergencyAlertsTopic,
    activityNotificationsTopic: env.sns.activityNotificationsTopic,
  },
  location: {
    mapName: env.location.mapName,
    placeIndex: env.location.placeIndex,
  },
};

/**
 * Configuracion base para clientes AWS SDK v3.
 * Compatible con Lambda, EC2 y desarrollo local.
 */
const getAwsClientConfig = () => {
  const config = {
    region: awsInfrastructure.region,
  };

  if (env.aws.accessKeyId && env.aws.secretAccessKey) {
    config.credentials = {
      accessKeyId: env.aws.accessKeyId,
      secretAccessKey: env.aws.secretAccessKey,
    };
  }

  return config;
};

const getDynamoDbClientConfig = () => {
  const config = getAwsClientConfig();
  if (awsInfrastructure.dynamodb.endpoint) {
    config.endpoint = awsInfrastructure.dynamodb.endpoint;
  }
  return config;
};

const hasAwsCredentials = () =>
  Boolean(env.aws.accessKeyId && env.aws.secretAccessKey) || !env.isDevelopment;

module.exports = {
  awsInfrastructure,
  tableNames,
  tableSchemas,
  globalSecondaryIndexes,
  getAwsClientConfig,
  getDynamoDbClientConfig,
  hasAwsCredentials,
};
