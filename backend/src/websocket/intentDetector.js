/**
 * Regex and keyword based intent detector for UrbanShield / HALO Chatbot (ADR-002)
 */

const INTENT_PATTERNS = {
  greeting: [
    /^(hola|buenos?\s+d[ií]as?|buenas?\s+(tardes?|noches?)|hey|saludos|que\s+tal|buenas)/i,
    /\b(hola|buen\s+dia|buenas\s+tardes|buenas\s+noches)\b/i,
  ],
  help: [
    /^(ayuda|help|opciones|men[uú]|qu[eé]\s+puedes?\s+hacer|comandos|gu[ií]a)/i,
    /\b(ayuda|qu[eé]\s+haces|c[oó]mo\s+funciona|opciones)\b/i,
  ],
  faq: [
    /(?:cu[aá]l|qu[eé]|c[oó]mo|d[oó]nde|cu[aá]ndo)\s+(?:es|son|est[aá]|puedo)/i,
    /(?:n[uú]mero|tel[eé]fono|horario|contacto|informaci[oó]n|oficina|emergencias?)/i,
    /\b(faq|preguntas?\s+frecuentes?|pregunta|duda|informes)\b/i,
  ],
  status: [
    /(?:estado|c[oó]mo\s+va|qu[eé]\s+pas[oó]|seguimiento)\s+(?:de\s+)?(?:mi\s+)?(?:reporte|caso|denuncia)/i,
    /reporte\s*#?\s*([a-zA-Z0-9_-]+)/i,
    /\b(consultar|revisar|ver)\s+(?:mi\s+)?reporte\b/i,
  ],
  create: [
    /(?:quiero|necesito|deseo)\s+(?:reportar|denunciar|crear|hacer)/i,
    /(?:reportar|denunciar|registrar)\s+(?:un|una|el|la)?/i,
    /(?:hay|hubo|veo)\s+(?:un|una)\s+(?:robo|accidente|incendio|emergencia|bache|fuga|asalto|peligro)/i,
    /\b(nuevo\s+reporte|nueva\s+denuncia|crear\s+reporte)\b/i,
  ],
  unknown: [/.*/],
};

/**
 * Detect the intent of an incoming user message.
 * @param {string} message - Raw user input text
 * @returns {{ intent: string, confidence: number }}
 */
function detectIntent(message) {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return { intent: 'unknown', confidence: 0 };
  }

  const cleanMessage = message.trim();

  // Iterate over intents in priority order (greeting -> help -> create -> status -> faq -> unknown)
  const priorityOrder = ['greeting', 'help', 'create', 'status', 'faq'];

  for (const intent of priorityOrder) {
    const patterns = INTENT_PATTERNS[intent];
    for (const pattern of patterns) {
      if (pattern.test(cleanMessage)) {
        return { intent, confidence: 0.9 };
      }
    }
  }

  return { intent: 'unknown', confidence: 0.1 };
}

module.exports = {
  detectIntent,
  INTENT_PATTERNS,
};
