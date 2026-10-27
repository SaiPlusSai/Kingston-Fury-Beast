const { GetCommand, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { getDynamoDbDocClient } = require('../aws/clients');
const { env } = require('../config/env');
const { v4: uuidv4 } = require('uuid');

/**
 * Chat creation state machine states:
 * IDLE -> ASK_CATEGORY -> ASK_DESCRIPTION -> ASK_LOCATION -> ASK_PHOTO -> CONFIRM -> DONE | CANCELLED
 */
const STATES = {
  IDLE: 'IDLE',
  ASK_CATEGORY: 'ASK_CATEGORY',
  ASK_DESCRIPTION: 'ASK_DESCRIPTION',
  ASK_LOCATION: 'ASK_LOCATION',
  ASK_PHOTO: 'ASK_PHOTO',
  CONFIRM: 'CONFIRM',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
};

const CATEGORIES = {
  '1': 'Seguridad / Robo',
  '2': 'Accidente de Tránsito',
  '3': 'Infraestructura / Bache / Luminaria',
  '4': 'Incendio / Fuga de gas',
  '5': 'Emergencia Médica',
  '6': 'Otro',
};

// In-memory fallback for local dev/testing without active AWS credentials
const localMemorySessions = new Map();

async function getSession(userId) {
  try {
    const docClient = getDynamoDbDocClient();
    const res = await docClient.send(
      new GetCommand({
        TableName: env.dynamodb.chatSessionsTable,
        Key: { sessionId: `session_${userId}` },
      })
    );
    return res.Item || localMemorySessions.get(`session_${userId}`) || null;
  } catch (err) {
    return localMemorySessions.get(`session_${userId}`) || null;
  }
}

async function saveSession(userId, sessionData) {
  const item = {
    sessionId: `session_${userId}`,
    userId,
    ...sessionData,
    ttl: Math.floor(Date.now() / 1000) + (30 * 60),
    updatedAt: new Date().toISOString(),
  };

  localMemorySessions.set(`session_${userId}`, item);

  try {
    const docClient = getDynamoDbDocClient();
    await docClient.send(
      new PutCommand({
        TableName: env.dynamodb.chatSessionsTable,
        Item: item,
      })
    );
  } catch (err) {
    // In local dev without credentials, in-memory store keeps it alive
  }
}

async function deleteSession(userId) {
  localMemorySessions.delete(`session_${userId}`);
  try {
    const docClient = getDynamoDbDocClient();
    await docClient.send(
      new DeleteCommand({
        TableName: env.dynamodb.chatSessionsTable,
        Key: { sessionId: `session_${userId}` },
      })
    );
  } catch (err) {
    // Silently continue
  }
}

/**
 * Advance the state machine with user input
 */
async function processReportStep(userId, message) {
  const text = (message || '').trim();

  // Allow user to cancel at any moment
  if (/^(cancelar|salir|abortar|stop)/i.test(text)) {
    await deleteSession(userId);
    return {
      state: STATES.CANCELLED,
      text: '❌ El proceso de reporte ha sido cancelado. ¿En qué más te puedo colaborar?',
      suggestedActions: ['Reportar incidente', 'Menú principal'],
    };
  }

  let session = await getSession(userId);

  if (!session || session.state === STATES.IDLE) {
    // Start flow -> Ask Category
    session = {
      state: STATES.ASK_CATEGORY,
      draft: {},
    };
    await saveSession(userId, session);

    return {
      state: STATES.ASK_CATEGORY,
      text: `📝 **Nuevo Reporte de Incidente** (Paso 1 de 5)\n\nPor favor selecciona el número de la categoría que mejor describa el hecho:\n\n1️⃣ Seguridad / Robo\n2️⃣ Accidente de Tránsito\n3️⃣ Infraestructura / Bache / Luminaria\n4️⃣ Incendio / Fuga de gas\n5️⃣ Emergencia Médica\n6️⃣ Otro\n\n*(Escribe "cancelar" en cualquier momento si deseas salir)*`,
      suggestedActions: ['1. Seguridad', '2. Accidente', '3. Infraestructura', '4. Incendio', '5. Médica'],
    };
  }

  // Handle current state
  switch (session.state) {
    case STATES.ASK_CATEGORY: {
      const catKey = text.replace(/[^0-9]/g, '');
      const selectedCategory = CATEGORIES[catKey] || (text.length > 3 ? text : null);

      if (!selectedCategory) {
        return {
          state: STATES.ASK_CATEGORY,
          text: `⚠️ Por favor ingresa una opción válida (1 al 6) o el nombre de la categoría:\n\n1️⃣ Seguridad\n2️⃣ Accidente\n3️⃣ Infraestructura\n4️⃣ Incendio\n5️⃣ Emergencia Médica\n6️⃣ Otro`,
        };
      }

      session.draft.category = selectedCategory;
      session.state = STATES.ASK_DESCRIPTION;
      await saveSession(userId, session);

      return {
        state: STATES.ASK_DESCRIPTION,
        text: `✅ Categoría: **${selectedCategory}**\n\n📝 (Paso 2 de 5) **Describe brevemente lo que sucedió:**\n*(Ejemplo: Choque entre dos minibuses con derrame de combustible cerca del semáforo)*`,
      };
    }

    case STATES.ASK_DESCRIPTION: {
      if (text.length < 5) {
        return {
          state: STATES.ASK_DESCRIPTION,
          text: `⚠️ La descripción es muy breve. Por favor ingresa al menos unas palabras detallando lo sucedido:`,
        };
      }

      session.draft.description = text;
      session.state = STATES.ASK_LOCATION;
      await saveSession(userId, session);

      return {
        state: STATES.ASK_LOCATION,
        text: `📍 (Paso 3 de 5) **¿Dónde está ocurriendo el incidente?**\n\nPuedes escribir la zona, calle o referencia (ej: *"Av. 16 de Julio esq. Bueno, Centro"* o *"Macrodistrito Cotahuma, cerca al mercado"*):`,
      };
    }

    case STATES.ASK_LOCATION: {
      if (text.length < 3) {
        return {
          state: STATES.ASK_LOCATION,
          text: `⚠️ Por favor ingresa una dirección o referencia clara:`,
        };
      }

      session.draft.location = text;
      session.state = STATES.ASK_PHOTO;
      await saveSession(userId, session);

      return {
        state: STATES.ASK_PHOTO,
        text: `📷 (Paso 4 de 5) **Evidencia fotográfica (Opcional):**\n\n¿Deseas adjuntar una imagen?\n1️⃣ No tengo foto por el momento\n2️⃣ Enlace o URL de la foto\n\n*(Escribe "1" para continuar sin foto)*`,
        suggestedActions: ['1. Continuar sin foto'],
      };
    }

    case STATES.ASK_PHOTO: {
      if (text === '1' || /no|ninguna|sin foto|continuar|omitir/i.test(text)) {
        session.draft.photoUrl = null;
      } else {
        session.draft.photoUrl = text;
      }

      session.state = STATES.CONFIRM;
      await saveSession(userId, session);

      const d = session.draft;
      return {
        state: STATES.CONFIRM,
        text: `📋 (Paso 5 de 5) **Confirma los datos de tu reporte:**\n\n• **Categoría:** ${d.category}\n• **Descripción:** ${d.description}\n• **Ubicación:** ${d.location}\n• **Foto:** ${d.photoUrl ? 'Adjuntada' : 'Sin foto'}\n\n¿Todo es correcto? Responde **"SÍ"** para enviar el reporte o **"CANCELAR"** para anular.`,
        suggestedActions: ['SÍ, confirmar y enviar', 'Cancelar'],
      };
    }

    case STATES.CONFIRM: {
      if (/^(si|sí|confirmar|correcto|ok|enviar|yes)/i.test(text)) {
        const reportId = `REP-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*1000)}`;
        const now = new Date().toISOString();

        const reportItem = {
          reportId,
          userId,
          title: `${session.draft.category} en ${session.draft.location}`,
          category: session.draft.category,
          description: session.draft.description,
          location: session.draft.location,
          exactZone: session.draft.location,
          latitude: -16.498,
          longitude: -68.135,
          imageUrl: session.draft.photoUrl || null,
          imageKeys: [],
          status: 'pending',
          priority: 'medium',
          upvotes: [],
          downvotes: [],
          createdAt: now,
          updatedAt: now,
        };

        try {
          const docClient = getDynamoDbDocClient();
          await docClient.send(
            new PutCommand({
              TableName: env.dynamodb.reportsTable,
              Item: reportItem,
            })
          );
          console.log(`[DynamoDB] Report created successfully: ${reportId}`);
        } catch (saveErr) {
          console.error(`[DynamoDB ERROR] Failed to save report ${reportId}:`, saveErr.message);
        }

        await deleteSession(userId);

        return {
          state: STATES.DONE,
          reportId,
          text: `🎉 **¡Reporte registrado exitosamente!**\n\nTu número de seguimiento es: **#${reportId}**\n\nLas unidades pertinentes han sido notificadas. Puedes consultar el estado en cualquier momento escribiendo *"estado de reporte ${reportId}"*.`,
          suggestedActions: ['Ver mis reportes', 'Menú principal'],
        };
      } else {
        await deleteSession(userId);
        return {
          state: STATES.CANCELLED,
          text: `❌ El reporte ha sido cancelado. Puedes iniciar uno nuevo cuando gustes.`,
          suggestedActions: ['Reportar incidente', 'Menú principal'],
        };
      }
    }

    default: {
      await deleteSession(userId);
      return {
        state: STATES.IDLE,
        text: `Comando no reconocido. ¿En qué te puedo ayudar?`,
      };
    }
  }
}

module.exports = {
  STATES,
  CATEGORIES,
  getSession,
  saveSession,
  deleteSession,
  processReportStep,
};
