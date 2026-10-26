const assert = require('assert');
const fs = require('fs');
const path = require('path');
const faqHandler = require('./handlers/faqHandler');

const SEED_FILE = path.resolve(__dirname, '../../data/faqs_seed.json');

async function runFaqsSeedTests() {
  console.log('=======================================================');
  console.log('UrbanShield - Pruebas de Dataset y Recuperacion de FAQs (DATA-04)');
  console.log('=======================================================\n');

  let passed = 0;
  let total = 0;

  function test(description, fn) {
    total++;
    try {
      fn();
      console.log(`[PASS] ${description}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${description}`);
      console.error(`       Error: ${err.message}`);
    }
  }

  async function testAsync(description, fn) {
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

  // 1. Validacion estructural del dataset seed
  console.log('[1. Validacion Estructural del Dataset]');
  test('El archivo faqs_seed.json existe en disco', () => {
    assert(fs.existsSync(SEED_FILE), 'El archivo faqs_seed.json debe existir');
  });

  const faqs = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));

  test('El dataset contiene al menos 10 FAQs obligatorias (Criterio de Aceptacion)', () => {
    assert(Array.isArray(faqs) && faqs.length >= 10, `Se esperaban >= 10 FAQs, se encontraron ${faqs.length}`);
  });

  test('Todas las FAQs contienen los campos requeridos (faqId, question, answer, category, keywords)', () => {
    for (const f of faqs) {
      assert(f.faqId && typeof f.faqId === 'string', `FAQ invalida sin faqId: ${JSON.stringify(f)}`);
      assert(f.question && typeof f.question === 'string', `FAQ ${f.faqId} sin question`);
      assert(f.answer && typeof f.answer === 'string', `FAQ ${f.faqId} sin answer`);
      assert(f.category && typeof f.category === 'string', `FAQ ${f.faqId} sin category`);
      assert(Array.isArray(f.keywords) && f.keywords.length > 0, `FAQ ${f.faqId} sin keywords validas`);
    }
  });

  test('Cubre las categorias minimas requeridas (emergencia, reportes, seguridad, tramites, zonas)', () => {
    const categories = new Set(faqs.map(f => f.category));
    const required = ['emergencia', 'reportes', 'seguridad', 'tramites', 'zonas'];
    for (const req of required) {
      assert(categories.has(req), `Falta la categoria requerida: ${req}`);
    }
  });

  // 2. Pruebas de recuperacion conversacional
  console.log('\n[2. Pruebas de Recuperacion y Coincidencia Semantica]');

  await testAsync('faqHandler responde correctamente a consulta sobre Policia (110)', async () => {
    const res = await faqHandler({ userId: 'test-user', message: 'Cual es el telefono de la policia para denunciar?' });
    assert.strictEqual(res.intent, 'faq');
    assert(res.text.includes('110') || res.text.includes('Policía'), 'Debe retornar referencia a policia o 110');
  });

  await testAsync('faqHandler responde correctamente a consulta sobre Bomberos (119)', async () => {
    const res = await faqHandler({ userId: 'test-user', message: 'Numero de bomberos auxilio por incendio' });
    assert.strictEqual(res.intent, 'faq');
    assert(res.text.includes('119') || res.text.includes('Bomberos'), 'Debe retornar referencia a bomberos o 119');
  });

  await testAsync('faqHandler responde correctamente a consulta sobre Ambulancias (165)', async () => {
    const res = await faqHandler({ userId: 'test-user', message: 'Necesito una ambulancia urgente para un herido' });
    assert.strictEqual(res.intent, 'faq');
    assert(res.text.includes('165') || res.text.includes('Ambulancia'), 'Debe retornar referencia a ambulancias');
  });

  await testAsync('faqHandler responde correctamente a consulta sobre cobertura de Macrodistritos', async () => {
    const res = await faqHandler({ userId: 'test-user', message: 'Que zonas o macrodistritos atienden en La Paz?' });
    assert.strictEqual(res.intent, 'faq');
    assert(res.text.includes('Cotahuma') || res.text.includes('Centro') || res.text.includes('macrodistritos'), 'Debe detallar macrodistritos');
  });

  await testAsync('faqHandler responde correctamente a consulta sobre confidencialidad y privacidad', async () => {
    const res = await faqHandler({ userId: 'test-user', message: 'Mis denuncias son anonimas y confidenciales?' });
    assert.strictEqual(res.intent, 'faq');
    assert(res.text.includes('confidencial') || res.text.includes('protegidos') || res.text.includes('identidad'), 'Debe asegurar privacidad');
  });

  await testAsync('faqHandler maneja fallback amigable cuando no hay coincidencia directa', async () => {
    const res = await faqHandler({ userId: 'test-user', message: 'xyz123palabrainexistentee' });
    assert.strictEqual(res.intent, 'faq');
    assert(Array.isArray(res.suggestedActions) && res.suggestedActions.length > 0, 'Debe sugerir acciones alternativas');
  });

  console.log('\n=======================================================');
  console.log(`Resultado: ${passed}/${total} pruebas aprobadas (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('=======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

if (require.main === module) {
  runFaqsSeedTests().catch(err => {
    console.error('Error durante la ejecucion de pruebas:', err);
    process.exit(1);
  });
}

module.exports = { runFaqsSeedTests };
