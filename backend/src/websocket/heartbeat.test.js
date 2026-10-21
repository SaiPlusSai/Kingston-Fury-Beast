// Mock dependencies before requiring handleMessage
const clients = require('../aws/clients');
let dynamoQueriesCount = 0;

clients.getDynamoDbDocClient = () => ({
  send: async () => {
    dynamoQueriesCount++;
    return { Item: { userId: 'usr-heartbeat-test' } };
  },
});

// Capture messages posted back to client
let lastPostedMessage = null;
const apigw = require('@aws-sdk/client-apigatewaymanagementapi');
apigw.ApiGatewayManagementApiClient.prototype.send = async function (command) {
  if (command?.input?.Data) {
    lastPostedMessage = JSON.parse(Buffer.from(command.input.Data).toString('utf-8'));
  }
  return {};
};

const { handler: handleMessage } = require('./handleMessage');

async function runHeartbeatTests() {
  console.log('--- Iniciando Pruebas Unitarias de Keepalive / Heartbeat (RISK-03) ---');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] ${message}`);
    } else {
      console.error(`[FAIL] ${message}`);
    }
  }

  // 1. Test ping por action
  dynamoQueriesCount = 0;
  lastPostedMessage = null;
  const res1 = await handleMessage({
    requestContext: { connectionId: 'conn-hb-1', domainName: 'localhost', stage: 'dev' },
    body: JSON.stringify({ action: 'ping' }),
  });

  assert(res1.statusCode === 200, 'Ping action retorna HTTP 200');
  assert(lastPostedMessage?.type === 'pong', 'Cliente recibe payload type=pong');
  assert(typeof lastPostedMessage?.timestamp === 'number', 'Payload de pong contiene timestamp epoch');
  assert(lastPostedMessage?.connectionId === 'conn-hb-1', 'Pong incluye connectionId correcto');
  assert(dynamoQueriesCount === 0, 'Ping no realiza consultas a DynamoDB (latencia minima)');

  // 2. Test ping por type
  lastPostedMessage = null;
  const res2 = await handleMessage({
    requestContext: { connectionId: 'conn-hb-2', domainName: 'localhost', stage: 'dev' },
    body: JSON.stringify({ type: 'ping' }),
  });
  assert(res2.statusCode === 200 && lastPostedMessage?.type === 'pong', 'Ping type retorna HTTP 200 y emite pong');

  // 3. Test ping en texto simple
  lastPostedMessage = null;
  const res3 = await handleMessage({
    requestContext: { connectionId: 'conn-hb-3', domainName: 'localhost', stage: 'dev' },
    body: JSON.stringify({ message: 'ping' }),
  });
  assert(res3.statusCode === 200 && lastPostedMessage?.type === 'pong', 'Mensaje simple "ping" emite pong');

  // 4. Test mensaje normal ("Hola") no debe responder pong
  lastPostedMessage = null;
  const resNormal = await handleMessage({
    requestContext: { connectionId: 'conn-hb-4', domainName: 'localhost', stage: 'dev' },
    body: JSON.stringify({ message: 'Hola buenas tardes' }),
  });
  assert(resNormal.statusCode === 200, 'Mensaje conversacional procesado exitosamente');
  assert(lastPostedMessage?.type !== 'pong', 'Mensaje conversacional no es interceptado como pong');

  // Resumen
  console.log(`\n========================================`);
  console.log(`Resultados: ${passed}/${total} pruebas aprobadas (${((passed / total) * 100).toFixed(1)}%)`);
  console.log(`========================================`);

  if (passed === total) {
    console.log('SUCCESS: Criterio de aceptacion de keepalive cumplido (100% aprobado).');
    process.exit(0);
  } else {
    console.error('FAILED: Algunas pruebas de heartbeat fallaron.');
    process.exit(1);
  }
}

runHeartbeatTests().catch((err) => {
  console.error('Heartbeat test error:', err);
  process.exit(1);
});
