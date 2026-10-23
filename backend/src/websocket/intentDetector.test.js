const { detectIntent } = require('./intentDetector');

const TEST_CASES = [
  // Greeting
  { text: 'Hola buenas tardes', expected: 'greeting' },
  { text: 'Hola', expected: 'greeting' },
  { text: 'Buenos dias equipo', expected: 'greeting' },
  { text: 'Hey saludos', expected: 'greeting' },

  // Help
  { text: 'Necesito ayuda por favor', expected: 'help' },
  { text: 'Menu de opciones', expected: 'help' },
  { text: 'Que puedes hacer?', expected: 'help' },
  { text: 'help', expected: 'help' },

  // Create report
  { text: 'Quiero reportar un bache en la calle', expected: 'create' },
  { text: 'Deseo denunciar un asalto', expected: 'create' },
  { text: 'Hay un incendio en la avenida', expected: 'create' },
  { text: 'Nuevo reporte de emergencia', expected: 'create' },
  { text: 'Veo un accidente vehicular grave', expected: 'create' },

  // Status
  { text: 'Cual es el estado de mi reporte #1234', expected: 'status' },
  { text: 'Como va mi caso?', expected: 'status' },
  { text: 'Seguimiento de denuncia rep-999', expected: 'status' },
  { text: 'Consultar mi reporte', expected: 'status' },

  // FAQ
  { text: 'Cual es el numero de bomberos?', expected: 'faq' },
  { text: 'Cual es el telefono de la policia?', expected: 'faq' },
  { text: 'Donde estan los informes y dudas?', expected: 'faq' },
  { text: 'Preguntas frecuentes de seguridad', expected: 'faq' },
];

console.log('Running Intent Detector Unit Tests...');
let passed = 0;

TEST_CASES.forEach((tc, idx) => {
  const result = detectIntent(tc.text);
  const ok = result.intent === tc.expected;
  if (ok) passed++;
  console.log(`[${ok ? 'PASS' : 'FAIL'}] "${tc.text}" -> Got: ${result.intent} (Expected: ${tc.expected}, Conf: ${result.confidence})`);
});

const accuracy = (passed / TEST_CASES.length) * 100;
console.log(`\nResults: ${passed}/${TEST_CASES.length} passed (${accuracy.toFixed(1)}% accuracy)`);

if (accuracy >= 85) {
  console.log('SUCCESS: Acceptance criteria met (>= 85%).');
  process.exit(0);
} else {
  console.error('FAILED: Accuracy below threshold.');
  process.exit(1);
}
