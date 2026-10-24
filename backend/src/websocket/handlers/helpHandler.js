/**
 * Help intent handler for UrbanShield Chatbot
 */
async function helpHandler({ userId, message }) {
  return {
    type: 'message',
    intent: 'help',
    text: `ℹ️ **Guía de Capacidades de UrbanShield Bot**\n\nPuedes interactuar conmigo usando lenguaje natural o comandos rápidos:\n\n🚨 **Reportes de Incidentes:**\n- "Quiero reportar un bache/robo/accidente"\n- Te guiaré paso a paso solicitando categoría, descripción, ubicación y fotos opcionales.\n\n🔍 **Seguimiento:**\n- "Estado de reporte [ID]"\n- Te mostraré el estado actual y las últimas actualizaciones registradas.\n\n❓ **Información y Contacto:**\n- Pregunta por teléfonos de emergencia, bomberos, policía o ambulancias.\n- Escribe "cancelar" en cualquier momento si estás creando un reporte para reiniciar.`,
    suggestedActions: ['Quiero reportar', 'Ver emergencias', 'Ayuda'],
  };
}

module.exports = helpHandler;

