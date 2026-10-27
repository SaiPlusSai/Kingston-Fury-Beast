/**
 * Greeting intent handler for HALO Chatbot featuring Kuntur (Mascot & Guardian)
 */
async function greetingHandler({ userId, message }) {
  return {
    type: 'message',
    intent: 'greeting',
    text: `👋 ¡Hola! Soy **Kuntur**, tu guardián digital de HALO La Paz.\n\nEstoy conectado en tiempo real para ayudarte a reportar incidentes, consultar teléfonos de auxilio o dar seguimiento a tus casos en la ciudad. ¿En qué te puedo colaborar hoy?\n\n1️⃣ Reportar un nuevo incidente (escribe "reportar")\n2️⃣ Consultar el estado de un reporte (escribe "estado de reporte [id]")\n3️⃣ Preguntas frecuentes y números de auxilio (escribe "ayuda" o tu consulta)`,
    suggestedActions: ['Reportar incidente', 'Mis reportes', 'Números de emergencia'],
  };
}

module.exports = greetingHandler;
