const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { getDynamoDbDocClient } = require('../../aws/clients');
const { env } = require('../../config/env');

/**
 * Fallback static FAQs in case table is empty during cold start
 */
const DEFAULT_FAQS = [
  {
    faqId: 'emergency-numbers',
    keywords: ['numero', 'telefono', 'contacto', 'emergencia', 'policia', 'bomberos', 'ambulancia'],
    question: '¿Cuáles son los números de emergencia?',
    answer: '📞 Números de emergencia en La Paz:\n- Policía Nacional: 110\n- Bomberos: 119\n- Ambulancias (SEDES): 165\n- Red de Emergencias Municipal: 114',
  },
  {
    faqId: 'report-timeline',
    keywords: ['tiempo', 'demora', 'tardan', 'atencion', 'plazo'],
    question: '¿Cuánto tiempo tarda la atención de un reporte?',
    answer: '⏱️ El tiempo promedio de evaluación inicial es de 2 a 4 horas para reportes de alta prioridad, y hasta 24 horas para mantenimiento urbano general.',
  },
  {
    faqId: 'anonymous-reports',
    keywords: ['anonimo', 'privacidad', 'datos', 'seguridad', 'identidad'],
    question: '¿Mis reportes son confidenciales?',
    answer: '🔒 Sí. Todos tus datos personales están protegidos y sólo el equipo de operaciones asignado tiene acceso a la información técnica del incidente.',
  },
];

/**
 * FAQ handler: search ChatFaqsTable by keyword matching
 */
async function faqHandler({ userId, message }) {
  const query = (message || '').toLowerCase();
  const words = query.split(/\s+/).filter(w => w.length > 2);

  let bestFaq = null;
  let maxMatches = 0;

  try {
    const docClient = getDynamoDbDocClient();
    const result = await docClient.send(
      new ScanCommand({
        TableName: env.dynamodb.chatFaqsTable,
        Limit: 50,
      })
    );

    const items = (result.Items && result.Items.length > 0) ? result.Items : DEFAULT_FAQS;

    for (const item of items) {
      const keywords = Array.isArray(item.keywords) ? item.keywords : (item.keywords || '').split(',');
      let matches = 0;
      for (const word of words) {
        if (keywords.some(k => k.toLowerCase().includes(word) || word.includes(k.toLowerCase()))) {
          matches++;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestFaq = item;
      }
    }
  } catch (error) {
    console.warn('Could not query DynamoDB ChatFaqsTable, using default FAQs:', error.message);
    for (const item of DEFAULT_FAQS) {
      let matches = 0;
      for (const word of words) {
        if (item.keywords.some(k => k.toLowerCase().includes(word) || word.includes(k.toLowerCase()))) {
          matches++;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestFaq = item;
      }
    }
  }

  if (bestFaq && maxMatches > 0) {
    return {
      type: 'message',
      intent: 'faq',
      text: `💡 **${bestFaq.question || 'Información encontrada'}**\n\n${bestFaq.answer}`,
      suggestedActions: ['Más preguntas', 'Reportar incidente', 'Menu'],
    };
  }

  return {
    type: 'message',
    intent: 'faq',
    text: `🤔 No encontré una respuesta exacta para tu consulta. ¿Deseas consultar los números de emergencia o crear un reporte directamente?`,
    suggestedActions: ['Números de emergencia', 'Reportar un incidente', 'Ayuda'],
  };
}

module.exports = faqHandler;

