const { DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { getDynamoDbDocClient } = require('../aws/clients');
const { env } = require('../config/env');

/**
 * Removes connection item from DynamoDB idempotently.
 * @param {string} connectionId
 * @returns {Promise<boolean>}
 */
async function removeConnection(connectionId) {
  if (!connectionId) return false;
  const docClient = getDynamoDbDocClient();
  await docClient.send(
    new DeleteCommand({
      TableName: env.dynamodb.websocketConnectionsTable,
      Key: { connectionId },
    })
  );
  return true;
}

/**
 * WebSocket $disconnect Lambda handler
 * Cleans up connection item from WebSocketConnectionsTable in DynamoDB.
 */
exports.handler = async (event) => {
  console.log('WebSocket $disconnect event:', JSON.stringify(event));

  const connectionId = event?.requestContext?.connectionId;

  if (!connectionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing connectionId in requestContext' }),
    };
  }

  try {
    await removeConnection(connectionId);
    console.log(`Connection removed successfully: connectionId=${connectionId}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Disconnected', connectionId }),
    };
  } catch (error) {
    console.error(`Error deleting connection ${connectionId}:`, error.message);
    // Even on warning, return 200 so API Gateway disconnect sequence completes
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Disconnect handled with warnings', error: error.message }),
    };
  }
};

exports.removeConnection = removeConnection;
