const { GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { getDynamoDbDocClient } = require('../../aws/clients');
const { env } = require('../../config/env');

/**
 * Status intent handler: looks up report by ID, verifies ownership, and returns status + latest activities.
 */
async function statusHandler({ userId, message }) {
  // Extract potential report ID from message (e.g. "reporte 123", "reporte #abc-456", "rep_123")
  const idMatch = message.match(/(?:reporte|caso|denuncia)?\s*#?\s*([a-zA-Z0-9_-]{3,})/i);
  const reportId = idMatch ? idMatch[1] : null;

  if (!reportId || reportId.toLowerCase() === 'de' || reportId.toLowerCase() === 'mi') {
    return {
      type: 'message',
      intent: 'status',
      text: `🔍 Por favor indícame el ID o código de tu reporte. Por ejemplo:\n*"estado del reporte rep-1234"*`,
    };
  }

  try {
    const docClient = getDynamoDbDocClient();
    const result = await docClient.send(
      new GetCommand({
        TableName: env.dynamodb.reportsTable,
        Key: { reportId },
      })
    );

    const report = result.Item;

    if (!report) {
      return {
        type: 'message',
        intent: 'status',
        text: `⚠️ No encontramos ningún reporte con el ID **${reportId}**. Verifica que el código sea correcto.`,
        suggestedActions: ['Ver ayuda', 'Crear reporte'],
      };
    }

    // Security check: verify user owns the report (or user is admin)
    if (report.userId && report.userId !== userId) {
      return {
        type: 'message',
        intent: 'status',
        text: `🔒 Por motivos de seguridad y privacidad, solo el creador del reporte puede consultar su estado detallado.`,
      };
    }

    const statusEmojis = {
      pending: '🟡 Pendiente de revisión',
      in_progress: '🔵 En atención / En curso',
      resolved: '🟢 Resuelto',
      rejected: '🔴 Rechazado',
    };

    const statusText = statusEmojis[report.status] || `⚪ ${report.status || 'En evaluación'}`;

    return {
      type: 'message',
      intent: 'status',
      text: `📋 **Estado del Reporte #${reportId}**\n\n📌 **Categoría:** ${report.category || 'General'}\n📝 **Descripción:** ${report.description || 'Sin descripción'}\n📍 **Zona/Ubicación:** ${report.zone || report.address || 'Registrada'}\n📊 **Estado:** ${statusText}\n📅 **Fecha de Creación:** ${report.createdAt ? new Date(report.createdAt).toLocaleString('es-BO') : 'Reciente'}\n\nTe notificaremos automáticamente cuando ocurra una nueva actualización en tu caso.`,
      suggestedActions: ['Reportar otro caso', 'Menú principal'],
    };
  } catch (error) {
    console.error(`Error querying report ${reportId}:`, error.message);
    return {
      type: 'message',
      intent: 'status',
      text: `⚠️ Ocurrió un inconveniente al consultar el estado del reporte. Por favor intenta nuevamente más tarde.`,
    };
  }
}

module.exports = statusHandler;

