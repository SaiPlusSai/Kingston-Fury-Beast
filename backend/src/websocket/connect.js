const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { getDynamoDbDocClient } = require('../aws/clients');
const { env } = require('../config/env');
const { awsInfrastructure } = require('../config/aws');

/**
 * WebSocket $connect Lambda handler
 * Validates JWT from query parameter `?token=`, extracts user, and stores connection in DynamoDB.
 */
exports.handler = async (event) => {
  console.log('WebSocket $connect event:', JSON.stringify(event));

  const connectionId = event?.requestContext?.connectionId;
  const token = event?.queryStringParameters?.token;

  if (!token) {
    console.warn('Rejected connection: Missing token in query params');
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized: token is required in query parameters' }),
    };
  }

  let userId = null;

  try {
    if (awsInfrastructure.cognito.useCognito) {
      const { verifyCognitoToken } = require('../utils/cognitoVerify');
      const decoded = await verifyCognitoToken(token);
      userId = decoded.sub || decoded.email;
    } else {
      const { verifyAccessToken } = require('../utils/jwt');
      const decoded = verifyAccessToken(token);
      userId = decoded.userId || decoded.sub || decoded.email;
    }

    if (!userId) {
      throw new Error('User identity could not be extracted from token');
    }

    const docClient = getDynamoDbDocClient();
    const now = Math.floor(Date.now() / 1000);
    const ttl = now + (2 * 60 * 60); // 2 hours TTL

    await docClient.send(
      new PutCommand({
        TableName: env.dynamodb.websocketConnectionsTable,
        Item: {
          connectionId,
          userId,
          connectedAt: new Date().toISOString(),
          ttl,
        },
      })
    );

    console.log(`Connection established: connectionId=${connectionId}, userId=${userId}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Connected' }),
    };
  } catch (error) {
    console.error('Connection validation failed:', error.message);
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized: invalid token', error: error.message }),
    };
  }
};

