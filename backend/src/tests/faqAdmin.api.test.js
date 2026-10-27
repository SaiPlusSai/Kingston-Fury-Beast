process.env.NODE_ENV = 'test';
const assert = require('assert');
const http = require('http');
const app = require('../app');
const { signAccessToken } = require('../utils/jwt');
const { ROLES } = require('../constants/roles');

async function runFaqAdminApiTests() {
  console.log('=======================================================');
  console.log('UrbanShield - Pruebas End-to-End API REST /api/admin/faqs (BUILD-05)');
  console.log('=======================================================\n');

  // Start ephemeral server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/admin/faqs`;

  const adminToken = signAccessToken({
    userId: 'admin-test-01',
    email: 'admin@halo.com',
    role: ROLES.ADMIN,
  });

  const citizenToken = signAccessToken({
    userId: 'citizen-test-01',
    email: 'citizen@halo.com',
    role: ROLES.CITIZEN,
  });

  let passed = 0;
  let total = 0;

  async function test(description, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${description}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${description}`);
      console.error(`       Error: ${err.message}`);
    }
  }

  let createdFaqId = null;

  try {
    // 1. Control de Acceso y RBAC
    console.log('[1. Seguridad y Control de Acceso RBAC]');

    await test('Rechaza peticion sin token de autenticacion con HTTP 401', async () => {
      const res = await fetch(baseUrl);
      assert.strictEqual(res.status, 401, `Status esperado 401, recibido ${res.status}`);
    });

    await test('Rechaza peticion con rol no-admin (citizen) con HTTP 403', async () => {
      const res = await fetch(baseUrl, {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      assert.strictEqual(res.status, 403, `Status esperado 403, recibido ${res.status}`);
    });

    // 2. Operaciones de Consulta (GET)
    console.log('\n[2. Consultas y Filtros (GET)]');

    await test('GET /api/admin/faqs retorna HTTP 200 y listado de FAQs para Admin', async () => {
      const res = await fetch(baseUrl, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert(body.data && Array.isArray(body.data.faqs), 'Debe retornar array de faqs');
      assert(body.data.count >= 1, 'Debe contener al menos 1 FAQ');
    });

    await test('GET /api/admin/faqs?search=policia filtra resultados correctamente', async () => {
      const res = await fetch(`${baseUrl}?search=policia`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert(body.data.faqs.some((f) => f.keywords.includes('policia') || f.question.toLowerCase().includes('policia')));
    });

    // 3. Creacion de FAQ (POST)
    console.log('\n[3. Creacion de Preguntas Frecuentes (POST)]');

    await test('POST /api/admin/faqs valida payload y rechaza si faltan campos obligatorios con HTTP 400', async () => {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          question: 'Pregunta incompleta sin respuesta',
        }),
      });
      assert(res.status === 400 || res.status === 422, `Status esperado 400 o 422, recibido ${res.status}`);
    });

    await test('POST /api/admin/faqs crea exitosamente una nueva FAQ con HTTP 201', async () => {
      const newFaq = {
        question: '¿Dónde puedo solicitar asistencia para baches en Miraflores?',
        answer: 'Puedes solicitarlo a través de la Red 114 o registrando tu reporte en HALO seleccionando la categoría Vías Urbanas.',
        category: 'reportes',
        keywords: ['bache', 'asfalto', 'calle', 'miraflores'],
      };

      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(newFaq),
      });

      assert.strictEqual(res.status, 201, `Status esperado 201, recibido ${res.status}`);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert(body.data.faqId, 'Debe generar o retornar faqId');
      assert.strictEqual(body.data.question, newFaq.question);
      createdFaqId = body.data.faqId;
    });

    // 4. Detalle y Actualizacion (GET by ID & PUT)
    console.log('\n[4. Obtencion por ID y Modificacion (GET /:id & PUT /:id)]');

    await test('GET /api/admin/faqs/:id retorna el detalle de la FAQ creada con HTTP 200', async () => {
      assert(createdFaqId, 'Se requiere createdFaqId de la prueba anterior');
      const res = await fetch(`${baseUrl}/${createdFaqId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.data.faqId, createdFaqId);
    });

    await test('GET /api/admin/faqs/:id retorna HTTP 404 para identificador inexistente', async () => {
      const res = await fetch(`${baseUrl}/faq-no-existe-999`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(res.status, 404);
    });

    await test('PUT /api/admin/faqs/:id actualiza los campos de la FAQ con HTTP 200', async () => {
      assert(createdFaqId, 'Se requiere createdFaqId');
      const updateData = {
        answer: 'Respuesta actualizada con mayor detalle para la zona de Miraflores.',
        keywords: ['bache', 'miraflores', 'actualizado'],
      };

      const res = await fetch(`${baseUrl}/${createdFaqId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(updateData),
      });

      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.data.answer, updateData.answer);
      assert(body.data.keywords.includes('actualizado'));
    });

    // 5. Eliminacion (DELETE)
    console.log('\n[5. Eliminacion de FAQ (DELETE /:id)]');

    await test('DELETE /api/admin/faqs/:id elimina la FAQ con HTTP 200', async () => {
      assert(createdFaqId, 'Se requiere createdFaqId');
      const res = await fetch(`${baseUrl}/${createdFaqId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.data.deleted, true);
    });
  } finally {
    server.close();
  }

  console.log('\n=======================================================');
  console.log(`Resultado: ${passed}/${total} pruebas aprobadas (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('=======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

if (require.main === module) {
  runFaqAdminApiTests().catch((err) => {
    console.error('Error fatal durante la ejecucion de pruebas API:', err);
    process.exit(1);
  });
}

module.exports = { runFaqAdminApiTests };
