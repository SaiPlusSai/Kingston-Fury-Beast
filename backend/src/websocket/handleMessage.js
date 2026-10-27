const { GetCommand } = require('@aws-sdk/lib-dynamodb');
const {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} = require('@aws-sdk/client-apigatewaymanagementapi');
const { getDynamoDbDocClient } = require('../aws/clients');
const { env } = require('../config/env');
const { detectIntent } = require('./intentDetector');
const { getSession, deleteSession } = require('./stateMachine');

// Handlers
const greetingHandler = require('./handlers/greetingHandler');
const helpHandler = require('./handlers/helpHandler');
const faqHandler = require('./handlers/faqHandler');
const statusHandler = require('./handlers/statusHandler');
const createHandler = require('./handlers/createHandler');
const { generateGeminiReply } = require('../services/gemini.service');

/**
 * Sends a message back to the connected WebSocket client
 */
async function postToClient(event, payload) {
  const connectionId = event?.requestContext?.connectionId;
  const domainName = event?.requestContext?.domainName;
  const stage = event?.requestContext?.stage;

  if (!connectionId) return;

  const endpoint = env.websocket.endpoint || `https://${domainName}/${stage}`;
  const apigwClient = new ApiGatewayManagementApiClient({
    endpoint,
    region: env.aws.region,
  });

  try {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
    await apigwClient.send(
      new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: Buffer.from(data),
      })
    );
  } catch (error) {
    if (error.name === 'GoneException' || error.statusCode === 410) {
      console.warn(`Stale connection ${connectionId}, client disconnected.`);
    } else {
      console.error(`Failed to post message to client ${connectionId}:`, error.message);
    }
  }
}

/**
 * WebSocket sendMessage / $default Lambda Handler
 */
exports.handler = async (event) => {
  console.log('WebSocket handleMessage event:', JSON.stringify(event));

  const connectionId = event?.requestContext?.connectionId;

  let body = {};
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
  } catch (err) {
    body = { message: event.body };
  }

  const userMessage = body.message || body.text || '';

  // 0. Keepalive / Heartbeat Interceptor (RISK-03: Mitigacion de Timeout de WebSocket)
  const isPing =
    body.action === 'ping' ||
    body.type === 'ping' ||
    (typeof userMessage === 'string' && userMessage.trim().toLowerCase() === 'ping');

  if (isPing) {
    const pongPayload = {
      type: 'pong',
      timestamp: Date.now(),
      connectionId,
    };
    await postToClient(event, pongPayload);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Pong sent', type: 'pong' }),
    };
  }

  // 1. Recover userId and userRole from DynamoDB WebSocketConnectionsTable
  let userId = 'anonymous';
  let userRole = 'citizen';
  try {
    const docClient = getDynamoDbDocClient();
    const connRecord = await docClient.send(
      new GetCommand({
        TableName: env.dynamodb.websocketConnectionsTable,
        Key: { connectionId },
      })
    );
    if (connRecord.Item) {
      if (connRecord.Item.userId) userId = connRecord.Item.userId;
      if (connRecord.Item.userRole) userRole = connRecord.Item.userRole;
    }
  } catch (err) {
    console.warn(`Could not resolve userId for connection ${connectionId}:`, err.message);
  }

  // 2. Classify message intent with intentDetector
  const { intent } = detectIntent(userMessage);

  // 3. Check if user is currently inside an active multi-step session (stateMachine)
  const activeSession = await getSession(userId);
  let responsePayload = null;

  const isGreeting = intent === 'greeting' || /^(hola+|holi|holis|hey|saludos|buenas?)/i.test((userMessage || '').trim());
  const isCancel = /^(cancelar|salir|abortar|stop|reinicio|reiniciar)/i.test((userMessage || '').trim());

  if (activeSession && activeSession.state && activeSession.state !== 'IDLE') {
    if (isCancel) {
      await deleteSession(userId);
      responsePayload = {
        type: 'message',
        intent: 'cancel',
        role: userRole,
        text: '❌ El proceso de reporte ha sido cancelado. ¿En qué más te puedo colaborar?',
        suggestedActions: userRole === 'admin'
          ? ['Resumen operativo', 'Reportes críticos', 'Macrodistritos']
          : ['Reportar incidente', 'Mis reportes', 'Números de emergencia'],
      };
    } else if (isGreeting && (activeSession.state === 'ASK_CATEGORY' || !activeSession.draft?.category)) {
      // User sent a greeting instead of choosing a category: cancel stale draft and answer greeting
      await deleteSession(userId);
      responsePayload = await greetingHandler({ userId, userRole, message: userMessage });
    } else {
      // User is continuing active report
      responsePayload = await createHandler({ userId, message: userMessage });
    }
  } else {
    if (intent === 'greeting') {
      responsePayload = await greetingHandler({ userId, userRole, message: userMessage });
    } else if (intent === 'create') {
      responsePayload = await createHandler({ userId, message: userMessage });
    } else if (intent === 'status') {
      responsePayload = await statusHandler({ userId, userRole, message: userMessage });
    } else if (intent === 'help') {
      responsePayload = await helpHandler({ userId, message: userMessage });
    } else {
      // Intent is 'faq' or 'unknown': Try Gemini Generative AI first with role persona
      const geminiReply = await generateGeminiReply(userMessage, [], userRole);
      if (geminiReply) {
        responsePayload = {
          type: 'message',
          intent: intent === 'faq' ? 'faq' : 'conversational_ai',
          engine: 'GEMINI_FLASH_LLM',
          role: userRole,
          text: geminiReply,
          suggestedActions: userRole === 'admin'
            ? ['Resumen operativo', 'Reportes críticos', 'Macrodistritos']
            : ['Reportar incidente', 'Números de emergencia', 'Ayuda'],
        };
      } else if (intent === 'faq') {
        responsePayload = await faqHandler({ userId, message: userMessage });
      } else {
        responsePayload = {
          type: 'message',
          intent: 'unknown',
          role: userRole,
          text: userRole === 'admin'
            ? `🛡️ Comando no reconocido. Como Administrador puedes escribir:\n- *"resumen"* para el estado de la ciudad\n- *"críticos"* para incidentes de alta prioridad\n- *"estado de reporte [id]"* para inspeccionar cualquier caso.`
            : `🤔 No logré entender del todo tu mensaje. Puedes escribir:\n- *"reportar"* para iniciar un reporte\n- *"ayuda"* para ver opciones\n- *"estado"* para consultar un reporte previo.`,
          suggestedActions: userRole === 'admin'
            ? ['Resumen operativo', 'Reportes críticos', 'Macrodistritos']
            : ['Reportar incidente', 'Ayuda', 'Preguntas frecuentes'],
        };
      }
    }
  }

  // 4. Send response back to the client via API Gateway Management API
  await postToClient(event, responsePayload);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Processed successfully', intent: responsePayload?.intent }),
  };
};

exports.postToClient = postToClient;
