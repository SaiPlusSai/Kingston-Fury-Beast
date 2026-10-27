/**
 * gemini.service.js
 * =================
 * Direct integration with Google Gemini Generative AI REST API using native fetch.
 * Provides real-time natural language synthesis with grounded urban safety context for La Paz,
 * with differentiated personas for Citizens and Municipal Administrators.
 */

const { env } = require('../config/env');

const GEMINI_CITIZEN_INSTRUCTION = `Eres HALO (Urban Shield), el asistente virtual oficial de seguridad ciudadana, gestión de emergencias y servicios urbanos del Gobierno Autónomo Municipal de La Paz (GAMLP), Bolivia.

Directrices para Ciudadanos:
1. Brinda orientación verídica, concisa y empática a la ciudadanía de La Paz sobre números de emergencia, trámites ciudadanos, macrodistritos y prevención urbana.
2. Macrodistritos de cobertura oficial en La Paz: Cotahuma, Max Paredes, Periférica, San Antonio, Sur, Mallasa y Centro.
3. Números de auxilio oficiales:
   • Policía Nacional: 110
   • Bomberos Antofagasta: 119
   • Ambulancias / Emergencias Médicas (Red 165): 165
   • Red de Emergencias y Mantenimiento Municipal (GAMLP): 114
   • Defensoría de la Niñez y Familia: 156
4. Flujo de reportes: Si el ciudadano desea denunciar o reportar un hecho (bache, semáforo roto, accidente, robo, incendio, fuga de gas), recuérdale con calidez que puede escribir *"reportar"* o pulsar la opción *"Reportar incidente"* para que el sistema guiado capture la ubicación y fotos.
5. Alcance: Si te consultan sobre temas ajenos a La Paz, seguridad o emergencias, explícales cordialmente que estás enfocado en la ciudad de La Paz.
6. Formato: Respuestas breves y estructuradas (máximo 2 a 3 párrafos cortos) con Markdown legible, viñetas y emojis amigables.`;

const GEMINI_ADMIN_INSTRUCTION = `Eres HALO (Urban Shield), el asistente táctico y de inteligencia operativa para el ADMINISTRADOR del Centro de Control de Seguridad del Gobierno Autónomo Municipal de La Paz (GAMLP).

Directrices para Administradores:
1. Tu interlocutor es un Administrador u Operador Municipal de Emergencias. Tu tono debe ser ejecutivo, técnico, analítico y enfocado en toma de decisiones y despacho operativo.
2. Conocimiento especializado:
   • Protocolos de respuesta rápida del GAMLP, Ley Municipal de Gestión de Riesgos y derivación interinstitucional (Policía 110, Bomberos 119, Salud 165, Cuadrillas 114).
   • Monitoreo de los 7 macrodistritos: Cotahuma, Max Paredes, Periférica, San Antonio, Sur, Mallasa y Centro.
   • Gestión de prioridades: Alta (riesgo vital / incendio / fuga), Media (bache con riesgo vehicular / luminarias principales), Baja (mantenimiento regular).
3. Capacidades de asesoría:
   • Ayuda a redactar órdenes de despacho y protocolos de cuadrillas.
   • Sugiere medidas de mitigación para zonas con alta concentración de incidentes (hotspots).
   • Explica cómo filtrar y categorizar incidentes en el panel de analíticas y mapas de calor.
4. Formato: Respuestas concisas, con estructura clara (viñetas, estados, acciones recomendadas).`;

/**
 * Calls Gemini REST API with candidate models
 * @param {string} userMessage - Message sent by the user
 * @param {Array<{role: string, text: string}>} [history=[]] - Optional recent conversation context
 * @param {string} [userRole='citizen'] - Role of the requesting user ('admin' | 'citizen')
 * @returns {Promise<string|null>} - Generated text or null if disabled/error
 */
async function generateGeminiReply(userMessage, history = [], userRole = 'citizen') {
  const apiKey = process.env.GEMINI_API_KEY || (env.gemini && env.gemini.apiKey);

  if (!apiKey || apiKey === 'PLACEHOLDER_KEY') {
    return null;
  }

  const models = [
    process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
  ];

  const systemInstruction = userRole === 'admin' ? GEMINI_ADMIN_INSTRUCTION : GEMINI_CITIZEN_INSTRUCTION;

  // Prepare conversation turns
  const contents = [];
  if (Array.isArray(history) && history.length > 0) {
    for (const turn of history.slice(-4)) {
      contents.push({
        role: turn.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: turn.text || turn.message || '' }],
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const payload = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: userRole === 'admin' ? 0.2 : 0.35,
      maxOutputTokens: 400,
      topP: 0.85,
    },
  };

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500); // 4.5s max

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const candidate = data?.candidates?.[0];
        const replyText = candidate?.content?.parts?.[0]?.text;
        if (replyText) {
          return replyText.trim();
        }
      } else {
        const errorBody = await response.text();
        console.warn(`[Gemini API] Model ${model} HTTP ${response.status}: ${errorBody}`);
      }
    } catch (err) {
      console.warn(`[Gemini API Warning] Model ${model}: ${err.name === 'AbortError' ? 'Timeout' : err.message}`);
    }
  }

  return null;
}

module.exports = {
  generateGeminiReply,
  GEMINI_CITIZEN_INSTRUCTION,
  GEMINI_ADMIN_INSTRUCTION,
};
