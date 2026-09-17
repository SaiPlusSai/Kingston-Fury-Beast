const { PublishCommand } = require('@aws-sdk/client-sns');
const { getSnsClient } = require('./clients');
const { awsInfrastructure } = require('../config/aws');
const logger = require('../utils/logger');

class SnsService {
  constructor() {
    this.client = getSnsClient();
  }

  async publishToTopic(topicArn, message, subject = 'Halo Notification') {
    if (!topicArn) {
      logger.debug('SNS topic not configured, skipping publish', { subject });
      return { messageId: null, skipped: true };
    }

    try {
      const result = await this.client.send(
        new PublishCommand({
          TopicArn: topicArn,
          Message: typeof message === 'string' ? message : JSON.stringify(message),
          Subject: subject,
        }),
      );
      return { messageId: result.MessageId, skipped: false };
    } catch (error) {
      logger.error('SNS publish failed', { error: error.message, topicArn });
      throw error;
    }
  }

  async subscribeEmail(topicArn, email) {
    if (!topicArn) return null;
    try {
      const { SubscribeCommand } = require('@aws-sdk/client-sns');
      const result = await this.client.send(
        new SubscribeCommand({
          TopicArn: topicArn,
          Protocol: 'email',
          Endpoint: email,
        })
      );
      return result.SubscriptionArn;
    } catch (error) {
      logger.error('SNS subscribe failed', { error: error.message, topicArn, email });
      // fail silently so it doesn't break auth flow
      return null;
    }
  }

  async publishEmergencyAlert(payload) {
    const priorityLabel = payload.priority === 'critical' ? 'CRITICA / URGENTE' : payload.priority === 'high' ? 'ALTA' : 'MEDIA';
    const categoryLabel = (payload.category || 'General').toUpperCase();

    const formattedMessage = `
===================================================
ALERTA HALO: REPORTE DE INCIDENTE
===================================================

Estimado/a ciudadano/a,

El sistema Halo ha registrado una nueva incidencia que requiere su atención. 
A continuación, se detallan los datos recabados por la plataforma:

[ UBICACIÓN DEL INCIDENTE ]
Lugar: ${payload.location || 'No especificada'}
${payload.exactZone ? `Zona de Referencia: ${payload.exactZone}` : ''}
Coordenadas: ${payload.latitude}, ${payload.longitude}

[ DETALLES DEL REPORTE ]
Nivel de Prioridad : [ ${priorityLabel} ]
Tipo de Incidente  : ${categoryLabel}
Asunto             : ${payload.title || 'Sin título'}
Descripción        : ${payload.description || 'Sin descripción adicional.'}

[ REGISTRO TEMPORAL ]
Fecha y Hora: ${new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' })}

Para visualizar la evidencia fotográfica y dar seguimiento a la situación, le instamos a ingresar de inmediato al panel oficial de Halo.

===================================================
Sistema Automatizado de Alertas - Halo
Protegiendo nuestra ciudad.
`;

    return this.publishToTopic(
      awsInfrastructure.sns.emergencyAlertsTopic,
      formattedMessage,
      `Halo Alerta: Incidente de prioridad ${priorityLabel} en tu zona`,
    );
  }

  async publishActivityNotification(payload) {
    return this.publishToTopic(
      awsInfrastructure.sns.activityNotificationsTopic,
      payload,
      'Halo Activity',
    );
  }
}

module.exports = new SnsService();
