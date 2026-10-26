const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');
const { getDynamoDbDocClient, getApiGatewayManagementApiClient } = require('../aws/clients');
const { env } = require('../config/env');

/**
 * Broadcast proactive WebSocket notification to user when report status changes.
 */
async function notifyUserReportStatus(userId, report) {
  if (!userId || !report) return;

  try {
    const docClient = getDynamoDbDocClient();
    const result = await docClient.send(
      new QueryCommand({
        TableName: env.dynamodb.webSocketConnectionsTable,
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': userId },
      })
    );

    const connections = result.Items || [];
    if (connections.length === 0) return;

    const payload = JSON.stringify({
      type: 'notification',
      event: 'REPORT_STATUS_UPDATED',
      data: {
        reportId: report.reportId || report.id,
        category: report.category,
        title: report.title,
        status: report.status,
        updatedAt: report.updatedAt || new Date().toISOString(),
        message: `🔔 Tu reporte de "${report.category || 'incidente'}" ha cambiado a estado: ${report.status}.`,
      },
    });

    const apigw = getApiGatewayManagementApiClient();
    await Promise.allSettled(
      connections.map(conn =>
        apigw.send(
          new PostToConnectionCommand({
            ConnectionId: conn.connectionId,
            Data: Buffer.from(payload),
          })
        )
      )
    );
  } catch (error) {
    console.warn(`[pushNotificationService] Could not send push notification to user ${userId}:`, error.message);
  }
}

module.exports = {
  notifyUserReportStatus,
};
