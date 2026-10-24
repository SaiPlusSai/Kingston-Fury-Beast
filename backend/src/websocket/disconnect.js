const { DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { getDynamoDbDocClient } = require('../aws/clients');
const { env } = require('../config/env');

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
    const docClient = getDynamoDbDocClient();
    await docClient.send(
      new DeleteCommand({
        TableName: env.dynamodb.websocketConnectionsTable,
        Key: {
          connectionId,
        },
      })
    );

    console.log(`Connection removed: connectionId=${connectionId}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Disconnected' }),
    };
  } catch (error) {
    console.error(`Error deleting connection ${connectionId}:`, error.message);
    // Even on error, return 200 so API Gateway disconnect flow does not stall
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Disconnect handled with warnings', error: error.message }),
    };
  }
};

