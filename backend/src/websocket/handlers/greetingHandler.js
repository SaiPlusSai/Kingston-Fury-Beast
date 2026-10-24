/**
 * Greeting intent handler for UrbanShield Chatbot
 */
async function greetingHandler({ userId, message }) {
  return {
    type: 'message',
    intent: 'greeting',
    text: `👋 ¡Hola! Bienvenido al asistente de UrbanShield HALO.\n\nEstoy aquí para ayudarte a mantener segura tu ciudad. ¿Qué deseas hacer hoy?\n\n1️⃣ Reportar un nuevo incidente (escribe "reportar")\n2️⃣ Consultar el estado de un reporte (escribe "estado de reporte [id]")\n3️⃣ Preguntas frecuentes y números de auxilio (escribe "ayuda" o tu consulta)`,
    suggestedActions: ['Reportar incidente', 'Mis reportes', 'Números de emergencia'],
  };
}

module.exports = greetingHandler;

