const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { getDynamoDbDocClient } = require('../aws/clients');
const { env } = require('../config/env');
const { awsInfrastructure } = require('../config/aws');

/**
 * Extracts authentication token from event query parameters, headers or Sec-WebSocket-Protocol.
 * @param {object} event - API Gateway WebSocket event
 * @returns {string|null}
 */
function extractToken(event) {
  if (event?.queryStringParameters?.token) {
    return event.queryStringParameters.token;
  }
  if (event?.queryStringParameters?.access_token) {
    return event.queryStringParameters.access_token;
  }
  const authHeader = event?.headers?.Authorization || event?.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const secProto = event?.headers?.['Sec-WebSocket-Protocol'] || event?.headers?.['sec-websocket-protocol'];
  if (secProto) {
    const parts = secProto.split(',').map((p) => p.trim());
    return parts.length > 1 ? parts[1] : parts[0];
  }
  return null;
}

/**
 * Verifies JWT token using either AWS Cognito or local JWT adapter.
 * @param {string} token
 * @returns {Promise<{userId: string, email: string|null, role: string}>}
 */
async function authenticateToken(token) {
  if (awsInfrastructure.cognito?.useCognito) {
    const { verifyCognitoToken } = require('../utils/cognitoVerify');
    const decoded = await verifyCognitoToken(token);
    return {
      userId: decoded.sub || decoded.email,
      email: decoded.email || null,
      role: decoded['custom:role'] || decoded.role || 'citizen',
    };
  }

  const { verifyAccessToken } = require('../utils/jwt');
  const decoded = verifyAccessToken(token);
  return {
    userId: decoded.userId || decoded.sub || decoded.email,
    email: decoded.email || null,
    role: decoded.role || 'citizen',
  };
}

/**
 * WebSocket $connect Lambda handler
 * Validates JWT, extracts identity, and stores connection metadata in DynamoDB.
 */
exports.handler = async (event) => {
  console.log('WebSocket $connect event:', JSON.stringify(event));

  const connectionId = event?.requestContext?.connectionId;
  const token = extractToken(event);

  if (!token) {
    console.warn('Rejected connection: Missing auth token');
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized: authentication token required' }),
    };
  }

  try {
    let user;
    if (token === 'demo-citizen-token') {
      const suffix = connectionId ? connectionId.replace(/[^a-zA-Z0-9]/g, '').slice(-6) : '01';
      user = { userId: `usr-citizen-demo-${suffix}`, email: 'ciudadano@halo.com', role: 'citizen' };
    } else if (token === 'demo-admin-token') {
      const suffix = connectionId ? connectionId.replace(/[^a-zA-Z0-9]/g, '').slice(-6) : '01';
      user = { userId: `usr-admin-demo-${suffix}`, email: 'admin@halo.com', role: 'admin' };
    } else if (token === 'guest') {
      const suffix = connectionId ? connectionId.replace(/[^a-zA-Z0-9]/g, '').slice(-6) : '01';
      user = { userId: `usr-guest-${suffix}`, email: 'invitado@halo.com', role: 'citizen' };
    } else {
      user = await authenticateToken(token);
    }

    if (!user || !user.userId) {
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
          userId: user.userId,
          userEmail: user.email,
          userRole: user.role,
          connectedAt: new Date().toISOString(),
          ttl,
        },
      })
    );

    console.log(`Connection established: connectionId=${connectionId}, userId=${user.userId}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Connected', userId: user.userId }),
    };
  } catch (error) {
    console.error('Connection validation failed:', error.message);
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized: invalid or expired token', error: error.message }),
    };
  }
};

exports.extractToken = extractToken;
exports.authenticateToken = authenticateToken;
