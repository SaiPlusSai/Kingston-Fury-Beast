/**
 * gemini.service.js
 * =================
 * Direct integration with Google Gemini Generative AI REST API using native fetch.
 * Provides real-time natural language synthesis with grounded urban safety context for La Paz.
 */

const { env } = require('../config/env');

const GEMINI_SYSTEM_INSTRUCTION = `Eres HALO (Urban Shield), el asistente virtual oficial de seguridad ciudadana, gestión de emergencias y servicios urbanos del Gobierno Autónomo Municipal de La Paz (GAMLP), Bolivia.

Directrices principales:
1. Brinda orientación verídica, concisa y empática a la ciudadanía de La Paz sobre números de emergencia, trámites ciudadanos, macrodistritos y prevención urbana.
2. Macrodistritos de cobertura oficial en La Paz: Cotahuma, Max Paredes, Periférica, San Antonio, Sur, Mallasa y Centro.
3. Números de auxilio oficiales:
   • Policía Nacional: 110
   • Bomberos Antofagasta: 119
   • Ambulancias / Emergencias Médicas (Red 165): 165
   • Red de Emergencias y Mantenimiento Municipal (GAMLP): 114
   • Defensoría de la Niñez y Familia: 156
4. Flujo de reportes: Si el ciudadano desea denunciar o reportar un hecho (bache, semáforo roto, accidente, robo, incendio, fuga de gas), recuérdale con calidez que puede escribir *"reportar"* o pulsar la opción *"Reportar incidente"* para que el sistema guiado capture la ubicación y fotos.
5. Alcance: Si te consultan sobre temas completamente ajenos a La Paz, seguridad o emergencias, explícales cordialmente que estás diseñado para asistir en incidentes y servicios de la ciudad de La Paz.
6. Formato: Respuestas breves y estructuradas (máximo 2 a 3 párrafos cortos) utilizando Markdown claro, viñetas y emojis amigables.`;

/**
 * Calls Gemini REST API
 * @param {string} userMessage - Message sent by the user
 * @param {Array<{role: string, text: string}>} [history=[]] - Optional recent conversation context
 * @returns {Promise<string|null>} - Generated text or null if disabled/error
 */
async function generateGeminiReply(userMessage, history = []) {
  const apiKey = process.env.GEMINI_API_KEY || (env.gemini && env.gemini.apiKey);

  if (!apiKey || apiKey === 'PLACEHOLDER_KEY') {
    return null;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
      parts: [{ text: GEMINI_SYSTEM_INSTRUCTION }],
    },
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 400,
      topP: 0.85,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500); // 4.5s max to avoid API GW 29s timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn(`[Gemini API] HTTP ${response.status}: ${errorBody}`);
      return null;
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const replyText = candidate?.content?.parts?.[0]?.text;

    return replyText ? replyText.trim() : null;
  } catch (err) {
    console.warn(`[Gemini API Warning] ${err.name === 'AbortError' ? 'Request timed out' : err.message}`);
    return null;
  }
}

module.exports = {
  generateGeminiReply,
  GEMINI_SYSTEM_INSTRUCTION,
};
