// Mock DynamoDB client BEFORE requiring connect and disconnect
const clients = require('../aws/clients');
const originalDocClient = clients.getDynamoDbDocClient;

clients.getDynamoDbDocClient = () => ({
  send: async (command) => {
    return { $metadata: { httpStatusCode: 200 } };
  },
});

const { extractToken, handler: connectHandler } = require('./connect');
const { handler: disconnectHandler } = require('./disconnect');
const { signAccessToken } = require('../utils/jwt');

async function runTests() {
  console.log('--- Iniciando Pruebas Unitarias de Handlers WebSocket ($connect / $disconnect) ---');
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

  // 1. Tests de extractToken
  console.log('\n[1. Extraccion de Tokens]');
  const token1 = extractToken({ queryStringParameters: { token: 'tok_query_1' } });
  assert(token1 === 'tok_query_1', 'Extrae token desde query params ?token=');

  const token2 = extractToken({ queryStringParameters: { access_token: 'tok_access_2' } });
  assert(token2 === 'tok_access_2', 'Extrae token desde query params ?access_token=');

  const token3 = extractToken({ headers: { Authorization: 'Bearer tok_bearer_3' } });
  assert(token3 === 'tok_bearer_3', 'Extrae token desde header Authorization: Bearer');

  const token4 = extractToken({ headers: { 'Sec-WebSocket-Protocol': 'sec_token_4' } });
  assert(token4 === 'sec_token_4', 'Extrae token desde Sec-WebSocket-Protocol');

  const token5 = extractToken({});
  assert(token5 === null, 'Retorna null cuando no hay token');

  // 2. Tests de $connect
  console.log('\n[2. Handlers de $connect]');
  const resMissing = await connectHandler({ requestContext: { connectionId: 'conn-1' } });
  assert(resMissing.statusCode === 401, 'Rechaza conexion sin token con HTTP 401');

  const resInvalid = await connectHandler({
    requestContext: { connectionId: 'conn-1' },
    queryStringParameters: { token: 'invalid.jwt.token' },
  });
  assert(resInvalid.statusCode === 401, 'Rechaza conexion con token invalido con HTTP 401');

  const validToken = signAccessToken({ userId: 'user-alan-1', email: 'alan@halo.com', role: 'admin' });
  const resValid = await connectHandler({
    requestContext: { connectionId: 'conn-1' },
    queryStringParameters: { token: validToken },
  });
  assert(resValid.statusCode === 200, 'Acepta conexion con JWT valido y devuelve HTTP 200');

  // 3. Tests de $disconnect
  console.log('\n[3. Handlers de $disconnect]');
  const resDiscMissing = await disconnectHandler({});
  assert(resDiscMissing.statusCode === 400, 'Rechaza desconexion sin connectionId con HTTP 400');

  const resDiscValid = await disconnectHandler({ requestContext: { connectionId: 'conn-1' } });
  assert(resDiscValid.statusCode === 200, 'Procesa desconexion exitosa con HTTP 200');

  // Resumen
  console.log(`\n========================================`);
  console.log(`Resultados: ${passed}/${total} pruebas aprobadas (${((passed / total) * 100).toFixed(1)}%)`);
  console.log(`========================================`);

  // Restore client
  clients.getDynamoDbDocClient = originalDocClient;

  if (passed === total) {
    console.log('SUCCESS: Criterio de aceptacion cumplido (100% de tests aprobados).');
    process.exit(0);
  } else {
    console.error('FAILED: Algunas pruebas no pasaron.');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
