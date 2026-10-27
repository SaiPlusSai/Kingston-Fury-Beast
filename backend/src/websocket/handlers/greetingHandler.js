/**
 * Greeting intent handler for HALO Chatbot featuring Kuntur & Zeo
 */
async function greetingHandler({ userId, userRole = 'citizen', message }) {
  if (userRole === 'admin') {
    return {
      type: 'message',
      intent: 'greeting',
      role: 'admin',
      text: `🛡️ **Centro de Operaciones HALO — Modo Administrador**\n\nHola, Operador. Estoy conectado a la red de monitoreo urbano de La Paz para asistirte en la gestión operativa:\n\n1️⃣ **Resumen del día** (escribe *"resumen"* para ver reportes y estados)\n2️⃣ **Incidentes críticos** (escribe *"críticos"* para ver alta prioridad)\n3️⃣ **Macrodistritos y focos de calor** (escribe *"macrodistritos"* o *"zonas"*)\n4️⃣ **Asistencia táctica municipal** (escribe tu consulta)`,
      suggestedActions: ['Resumen operativo', 'Reportes críticos', 'Macrodistritos', 'Ayuda'],
    };
  }

  return {
    type: 'message',
    intent: 'greeting',
    role: 'citizen',
    text: `👋 ¡Hola! Soy **Kuntur**, tu guardián digital de HALO La Paz.\n\nEstoy conectado en tiempo real para ayudarte a reportar incidentes, consultar teléfonos de auxilio o dar seguimiento a tus casos en la ciudad. ¿En qué te puedo colaborar hoy?\n\n1️⃣ Reportar un nuevo incidente (escribe "reportar")\n2️⃣ Consultar el estado de un reporte (escribe "estado de reporte [id]")\n3️⃣ Preguntas frecuentes y números de auxilio (escribe "ayuda" o tu consulta)`,
    suggestedActions: ['Reportar incidente', 'Mis reportes', 'Números de emergencia'],
  };
}

module.exports = greetingHandler;
