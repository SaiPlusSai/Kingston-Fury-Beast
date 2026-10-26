const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { getDynamoDbDocClient } = require('../../aws/clients');
const { env } = require('../../config/env');
const { spawnSync } = require('child_process');
const path = require('path');

/**
 * Fallback static FAQs in case table is empty during cold start
 */
const DEFAULT_FAQS = [
  {
    faqId: 'emergency-numbers',
    keywords: ['numero', 'telefono', 'contacto', 'emergencia', 'policia', 'bomberos', 'ambulancia'],
    question: '¿Cuáles son los números de emergencia?',
    answer: '📞 Números de emergencia en La Paz:\n- Policía Nacional: 110\n- Bomberos: 119\n- Ambulancias (Red 165): 165\n- Red de Emergencias Municipal: 114',
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
 * Query Python RAG service using FAISS vector search
 */
function queryRagService(queryText) {
  try {
    const pythonScript = `
import sys, json
sys.path.insert(0, '${path.resolve(__dirname, '../../../../prediction-service').replace(/\\/g, '/')}')
try:
    from src.rag.rag_service import query_rag
    res = query_rag(sys.argv[1])
    print(json.dumps(res))
except Exception as e:
    print(json.dumps({'matched': False, 'error': str(e)}))
`;
    const result = spawnSync('python', ['-c', pythonScript, queryText], {
      encoding: 'utf-8',
      timeout: 3000,
    });

    if (result.stdout) {
      const lines = result.stdout.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      const parsed = JSON.parse(lastLine);
      if (parsed && parsed.matched) {
        return parsed;
      }
    }
  } catch (err) {
    // Graceful fallback to DynamoDB / static FAQs
  }
  return null;
}

/**
 * FAQ handler: RAG (FAISS) + DynamoDB ChatFaqsTable fallback
 */
async function faqHandler({ userId, message }) {
  const query = (message || '').trim();

  // 1. Semantic RAG Query (FAISS)
  const ragResult = queryRagService(query);
  if (ragResult && ragResult.matched) {
    const sourceTag = ragResult.sources && ragResult.sources.length > 0 ? `\n\n📚 *Fuente: ${ragResult.sources[0]}*` : '';
    return {
      type: 'message',
      intent: 'faq',
      engine: 'RAG_FAISS',
      text: `💡 **${ragResult.title || 'Información Ciudadana'}**\n\n${ragResult.answer}${sourceTag}`,
      suggestedActions: ['Más preguntas', 'Reportar incidente', 'Menu'],
    };
  }

  // 2. Keyword & DynamoDB Fallback
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
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
      engine: 'KEYWORD_FSM',
      text: `💡 **${bestFaq.question || 'Información encontrada'}**\n\n${bestFaq.answer}`,
      suggestedActions: ['Más preguntas', 'Reportar incidente', 'Menu'],
    };
  }

  return {
    type: 'message',
    intent: 'faq',
    engine: 'FALLBACK',
    text: `🤔 No encontré una respuesta exacta para tu consulta. ¿Deseas consultar los números de emergencia o crear un reporte directamente?`,
    suggestedActions: ['Números de emergencia', 'Reportar un incidente', 'Ayuda'],
  };
}

module.exports = faqHandler;
