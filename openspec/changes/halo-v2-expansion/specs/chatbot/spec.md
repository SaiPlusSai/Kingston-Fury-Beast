# Spec: Chatbot Interactivo en Tiempo Real

## 1. Resumen de la Capacidad

Este documento especifica todos los requisitos funcionales y no funcionales para el módulo de Chatbot Interactivo en Tiempo Real de la plataforma HALO. El chatbot será un componente transversal disponible tanto en la aplicación web (React 19) como en la futura aplicación móvil (React Native), conectado al backend mediante WebSockets a través de AWS API Gateway.

El chatbot actúa como un asistente virtual ciudadano capaz de:
- Responder preguntas frecuentes (FAQ) de forma inmediata.
- Consultar el estado de reportes de incidentes en tiempo real.
- Guiar al usuario paso a paso para crear un nuevo reporte de incidente de manera conversacional.
- Enviar notificaciones proactivas cuando el estado de un reporte cambie.

---

## 2. Requisitos Funcionales

### 2.1 Gestión de Conexiones WebSocket

#### RF-CHAT-001: Establecimiento de Conexión
- **Descripción:** El sistema debe permitir que un usuario autenticado establezca una conexión WebSocket persistente con el servidor.
- **Precondiciones:** El usuario debe tener un token JWT válido emitido por Amazon Cognito.
- **Flujo:**
  1. El cliente envía una solicitud de conexión WebSocket a la URL del API Gateway WebSocket, incluyendo el token JWT como query parameter (`?token=<jwt>`).
  2. La función Lambda `$connect` valida el token contra Cognito.
  3. Si es válido, se almacena el `connectionId` junto con el `userId` en la tabla `WebSocketConnectionsTable` de DynamoDB.
  4. Se responde con status code 200 (conexión aceptada).
  5. Si el token es inválido o ha expirado, se responde con status code 401 y se rechaza la conexión.
- **Criterio de Aceptación:** Un usuario con token válido puede establecer conexión WebSocket; un usuario sin token o con token inválido es rechazado con error 401.

#### RF-CHAT-002: Desconexión
- **Descripción:** Cuando un usuario cierra la conexión WebSocket (cierre de pestaña, pérdida de red, logout), el sistema debe limpiar su registro de la tabla de conexiones activas.
- **Flujo:**
  1. API Gateway dispara la función Lambda `$disconnect` con el `connectionId`.
  2. La Lambda elimina el registro correspondiente de `WebSocketConnectionsTable`.
- **Criterio de Aceptación:** Tras la desconexión, el registro ya no existe en DynamoDB; no se producen registros huérfanos.

#### RF-CHAT-003: Reconexión Automática del Cliente
- **Descripción:** Si la conexión WebSocket se interrumpe inesperadamente (pérdida de red, timeout de API Gateway tras 10 minutos de inactividad), el cliente debe intentar reconectarse automáticamente.
- **Flujo:**
  1. El cliente detecta el evento `onclose` o `onerror` del WebSocket.
  2. Inicia un ciclo de reconexión con backoff exponencial: 1s, 2s, 4s, 8s, máximo 30s.
  3. Al reconectar exitosamente, restaura el estado del chat (mensajes previos se mantienen en el estado local del cliente).
  4. Tras 5 intentos fallidos consecutivos, muestra un mensaje al usuario: "No se pudo conectar al servicio de chat. Verifica tu conexión a internet."
- **Criterio de Aceptación:** El chat se reconecta automáticamente tras una desconexión transitoria; el usuario no pierde el historial de la conversación actual.

### 2.2 Procesamiento de Mensajes

#### RF-CHAT-004: Envío de Mensajes del Usuario
- **Descripción:** El usuario puede enviar mensajes de texto a través de la interfaz de chat.
- **Payload de Entrada (Cliente → Servidor):**
  ```json
  {
    "action": "sendMessage",
    "data": {
      "message": "¿Cuál es el número de emergencias?",
      "timestamp": "2026-09-01T14:30:00Z",
      "sessionId": "uuid-v4-session-id"
    }
  }
  ```
- **Flujo:**
  1. El cliente envía el mensaje a través de la conexión WebSocket activa usando la acción `sendMessage`.
  2. La función Lambda `handleMessage` recibe el `connectionId` del contexto de API Gateway y el body del mensaje.
  3. Se recupera el `userId` asociado al `connectionId` de la tabla `WebSocketConnectionsTable`.
  4. Se detecta la intención del mensaje (ver RF-CHAT-005).
  5. Se procesa la intención y se genera una respuesta.
  6. Se envía la respuesta de vuelta al usuario a través del `connectionId` usando `@aws-sdk/client-apigatewaymanagementapi`.
- **Payload de Respuesta (Servidor → Cliente):**
  ```json
  {
    "type": "botResponse",
    "data": {
      "message": "El número de emergencias es 911. Para emergencias de bomberos, puedes llamar al 122.",
      "intent": "faq",
      "timestamp": "2026-09-01T14:30:01Z",
      "sessionId": "uuid-v4-session-id",
      "metadata": {
        "confidence": 0.95,
        "source": "faq-database"
      }
    }
  }
  ```
- **Criterio de Aceptación:** El mensaje llega al servidor, se procesa y la respuesta se entrega al cliente en menos de 2 segundos.

#### RF-CHAT-005: Detección de Intenciones (NLP)
- **Descripción:** El sistema debe clasificar cada mensaje del usuario en una de las siguientes intenciones predefinidas.
- **Intenciones soportadas:**

  | ID de Intención | Nombre | Ejemplos de Frases de Entrenamiento | Acción Resultante |
  |---|---|---|---|
  | `intent_faq` | Consulta de información general | "¿Cuál es el número de emergencias?", "¿Qué horario tienen?", "¿Qué tipos de incidentes puedo reportar?", "¿Cómo funciona la app?" | Buscar en la base de FAQs y devolver la respuesta correspondiente |
  | `intent_status` | Consulta de estado de reporte | "¿Cómo va mi reporte?", "Estado del reporte 2847", "¿Qué pasó con mi denuncia?", "Quiero saber el estado de mi caso" | Extraer el ID del reporte y consultar `ReportsTable` |
  | `intent_create` | Crear nuevo reporte | "Quiero reportar un incidente", "Hay un robo en mi cuadra", "Necesito hacer una denuncia", "Reportar accidente", "Quiero crear un reporte" | Iniciar el flujo conversacional de creación de reporte |
  | `intent_help` | Ayuda sobre el bot | "¿Qué puedes hacer?", "Ayuda", "Help", "Opciones", "Menú" | Mostrar menú de capacidades del bot |
  | `intent_greeting` | Saludo | "Hola", "Buenos días", "Hey", "Buenas" | Responder con saludo y menú de opciones |
  | `intent_unknown` | Intención no reconocida | Cualquier mensaje no clasificable | Responder con mensaje de fallback y sugerir opciones |

- **Implementación:**
  - **Fase 1 (MVP):** Detección por palabras clave y expresiones regulares. Cada intención tendrá un conjunto de patrones regex que se evaluarán en orden de prioridad.
  - **Fase 2 (Mejora):** Integración opcional con AWS Lex o servicio de NLP externo para detección semántica.
- **Criterio de Aceptación:** El sistema clasifica correctamente al menos el 85% de los mensajes de prueba en la intención correcta; los mensajes no reconocidos caen en `intent_unknown` con un mensaje de ayuda claro.

### 2.3 Intención FAQ

#### RF-CHAT-006: Base de Datos de FAQs
- **Descripción:** El sistema debe mantener una colección de preguntas frecuentes con sus respuestas, consultable por el bot.
- **Modelo de Datos (DynamoDB):**
  - **Tabla:** `ChatFaqsTable`
  - **Partition Key:** `faqId` (String, UUID)
  - **Atributos:**
    ```json
    {
      "faqId": "uuid",
      "question": "¿Cuál es el número de emergencias?",
      "answer": "El número de emergencias es 911. Para bomberos: 122. Para policía: 110.",
      "keywords": ["emergencia", "número", "teléfono", "llamar", "911"],
      "category": "contactos",
      "priority": 1,
      "isActive": true,
      "createdAt": "2026-09-01T00:00:00Z",
      "updatedAt": "2026-09-01T00:00:00Z"
    }
    ```
- **Búsqueda:** Se compararán las palabras clave del mensaje del usuario contra el campo `keywords` de cada FAQ activa. Se devolverá la FAQ con mayor coincidencia de keywords.
- **Criterio de Aceptación:** El bot devuelve la FAQ correcta cuando el usuario pregunta con cualquiera de las palabras clave asociadas; devuelve un mensaje de "no encontrado" si ninguna FAQ coincide.

#### RF-CHAT-007: Administración de FAQs
- **Descripción:** Los administradores deben poder gestionar (crear, editar, eliminar, activar/desactivar) las FAQs desde el panel de administración web.
- **Endpoints API REST (backend existente):**
  - `POST /api/admin/faqs` — Crear nueva FAQ
  - `GET /api/admin/faqs` — Listar todas las FAQs
  - `PUT /api/admin/faqs/:faqId` — Actualizar FAQ
  - `DELETE /api/admin/faqs/:faqId` — Eliminar FAQ
- **Criterio de Aceptación:** Un administrador puede crear una FAQ desde el panel web y el bot la utiliza inmediatamente en las respuestas sin necesidad de reiniciar el sistema.

### 2.4 Intención Consulta de Estado

#### RF-CHAT-008: Consulta de Estado de Reporte por ID
- **Descripción:** El bot debe ser capaz de extraer un ID de reporte del mensaje del usuario y consultar su estado actual en la base de datos.
- **Flujo:**
  1. El usuario envía un mensaje como "Estado del reporte 2847" o "¿Cómo va mi reporte #2847?".
  2. El sistema extrae el número del reporte usando regex: `/(?:reporte|caso|denuncia|report)\s*#?\s*(\d+)/i`.
  3. Si no se encuentra un ID, el bot pregunta: "¿Cuál es el número de tu reporte? Puedes encontrarlo en el correo de confirmación que recibiste."
  4. Se consulta `ReportsTable` con el ID proporcionado.
  5. Se verifica que el reporte pertenezca al `userId` del solicitante (seguridad).
  6. Se devuelve un resumen del estado:
     ```
     📋 Reporte #2847
     📌 Categoría: Accidente de tránsito
     📍 Ubicación: Av. Bolivar y 3ra Calle
     🔄 Estado: En Investigación
     📅 Reportado: 28/08/2026 a las 14:30
     📅 Última actualización: 30/08/2026 a las 09:15
     
     Últimas actividades:
     • 30/08 09:15 — Asignado al oficial Martinez
     • 29/08 16:00 — Evidencia fotográfica adjuntada
     • 28/08 14:30 — Reporte creado por el ciudadano
     ```
- **Criterio de Aceptación:** El bot devuelve el estado correcto del reporte incluyendo las últimas 3 actividades; si el reporte no existe o no pertenece al usuario, muestra un mensaje de error apropiado.

#### RF-CHAT-009: Consulta de Estado sin ID (por Contexto)
- **Descripción:** Si el usuario dice "¿cómo va mi reporte?" sin proporcionar ID, el sistema debe consultar los reportes recientes del usuario.
- **Flujo:**
  1. Consultar `ReportsTable` filtrando por `userId` del usuario autenticado, ordenados por fecha de creación descendente, límite 5.
  2. Si hay un solo reporte, devolver su estado directamente.
  3. Si hay múltiples reportes, listarlos y preguntar cuál desea consultar:
     ```
     Encontré estos reportes a tu nombre:
     1. #2847 — Accidente de tránsito (En Investigación)
     2. #2831 — Alumbrado público dañado (Resuelto)
     3. #2799 — Bache en la vía (Pendiente)
     
     ¿Cuál deseas consultar? Escribe el número.
     ```
- **Criterio de Aceptación:** El bot lista correctamente los reportes del usuario y permite seleccionar uno para ver el detalle completo.

### 2.5 Intención Crear Reporte

#### RF-CHAT-010: Flujo Conversacional de Creación de Reporte
- **Descripción:** El bot debe guiar al usuario a través de un flujo de pasos para crear un nuevo reporte, utilizando una máquina de estados que persista en la sesión del usuario.
- **Estados de la Máquina:**

  ```
  [IDLE] → (usuario dice "quiero reportar") → [ASK_CATEGORY]
  [ASK_CATEGORY] → (usuario elige categoría) → [ASK_DESCRIPTION]
  [ASK_DESCRIPTION] → (usuario escribe descripción) → [ASK_LOCATION]
  [ASK_LOCATION] → (usuario confirma GPS o escribe dirección) → [ASK_PHOTO]
  [ASK_PHOTO] → (usuario envía foto o dice "no") → [CONFIRM]
  [CONFIRM] → (usuario confirma "sí") → [SUBMITTING] → [DONE]
  [CONFIRM] → (usuario dice "no" / "cancelar") → [CANCELLED]
  
  Desde cualquier estado: (usuario dice "cancelar") → [CANCELLED]
  ```

- **Detalle de cada estado:**

  **Estado ASK_CATEGORY:**
  ```
  Bot: ¿Qué tipo de incidente deseas reportar?
  
  1. 🚨 Emergencia de seguridad (robo, asalto, vandalismo)
  2. 🚗 Accidente de tránsito
  3. 💡 Infraestructura (alumbrado, baches, semáforos)
  4. 🏥 Emergencia médica
  5. 🔥 Incendio
  6. 🌊 Desastre natural (inundación, derrumbe)
  7. 📢 Otro
  
  Escribe el número o describe el incidente.
  ```

  **Estado ASK_DESCRIPTION:**
  ```
  Bot: Describe brevemente lo que sucedió. Intenta incluir detalles como:
  - ¿Qué observaste?
  - ¿Hay personas afectadas?
  - ¿Sigue ocurriendo en este momento?
  ```
  - Validación: mínimo 10 caracteres, máximo 500 caracteres.

  **Estado ASK_LOCATION:**
  ```
  Bot: ¿Dónde ocurrió el incidente?
  
  1. 📍 Usar mi ubicación actual (GPS)
  2. ✏️ Escribir la dirección manualmente
  
  Escribe el número o la dirección directamente.
  ```
  - Si elige GPS: el cliente envía las coordenadas del dispositivo.
  - Si escribe dirección: se utiliza Amazon Location Service para geocodificar la dirección a coordenadas.

  **Estado ASK_PHOTO:**
  ```
  Bot: ¿Deseas adjuntar una foto como evidencia?
  
  1. 📷 Sí, adjuntar foto
  2. ⏭️ No, continuar sin foto
  ```
  - Si elige foto en web: se abre el file picker.
  - Si elige foto en móvil: se abre la cámara o galería.
  - La foto se sube a S3 mediante pre-signed URL.

  **Estado CONFIRM:**
  ```
  Bot: 📋 Resumen de tu reporte:
  
  📌 Categoría: Accidente de tránsito
  📝 Descripción: "Choque entre dos vehículos en la esquina, hay una persona herida."
  📍 Ubicación: Av. Bolivar y 3ra Calle (14.6349, -90.5069)
  📷 Foto: Sí (1 imagen adjunta)
  
  ¿Todo está correcto? Escribe "Sí" para enviar o "No" para modificar.
  ```

  **Estado DONE:**
  ```
  Bot: ✅ ¡Tu reporte ha sido creado exitosamente!
  
  📋 Número de reporte: #2850
  🔄 Estado: Pendiente de revisión
  
  Recibirás notificaciones cuando haya actualizaciones. 
  Puedes consultar el estado en cualquier momento escribiendo "estado del reporte 2850".
  ```

- **Persistencia del Estado:** El estado actual de la conversación se almacena en DynamoDB en la tabla `ChatSessionsTable` con un TTL de 30 minutos de inactividad.
- **Modelo de Datos de Sesión:**
  ```json
  {
    "sessionId": "uuid",
    "userId": "cognito-user-id",
    "connectionId": "api-gw-connection-id",
    "currentState": "ASK_DESCRIPTION",
    "reportDraft": {
      "category": "traffic_accident",
      "description": null,
      "latitude": null,
      "longitude": null,
      "photoUrl": null
    },
    "createdAt": "2026-09-01T14:30:00Z",
    "updatedAt": "2026-09-01T14:31:00Z",
    "ttl": 1725203400
  }
  ```
- **Criterio de Aceptación:** El usuario puede completar el flujo completo de creación de reporte conversacionalmente; el reporte creado aparece correctamente en la tabla `ReportsTable` y en el panel de administración; el usuario puede cancelar en cualquier momento.

### 2.6 Notificaciones Proactivas

#### RF-CHAT-011: Notificación de Cambio de Estado de Reporte
- **Descripción:** Cuando un administrador cambie el estado de un reporte, el sistema verificará si el ciudadano dueño del reporte tiene una conexión WebSocket activa y le enviará una notificación inmediata.
- **Flujo:**
  1. El administrador actualiza el estado de un reporte en el panel web (ej: "Pendiente" → "En Investigación").
  2. El endpoint `PUT /api/reports/:id/status` procesa la actualización en `ReportsTable`.
  3. Tras la actualización, el backend consulta `WebSocketConnectionsTable` buscando conexiones activas del `userId` dueño del reporte.
  4. Si existe una conexión activa, envía una notificación push vía WebSocket:
     ```json
     {
       "type": "notification",
       "data": {
         "title": "Actualización de tu reporte",
         "message": "Tu reporte #2847 ha cambiado de estado: Pendiente → En Investigación",
         "reportId": "2847",
         "newStatus": "in_progress",
         "timestamp": "2026-09-01T15:00:00Z"
       }
     }
     ```
  5. Si no hay conexión activa, la notificación se almacena para ser entregada cuando el usuario se reconecte o vía push notification de la app móvil.
- **Criterio de Aceptación:** El ciudadano con chat abierto recibe la notificación en menos de 3 segundos tras la actualización del administrador.

---

## 3. Requisitos No Funcionales

### 3.1 Rendimiento
- **RNF-CHAT-001:** El tiempo de respuesta del bot (desde que el usuario envía el mensaje hasta que recibe la respuesta) debe ser menor a 2 segundos en el percentil 95 (p95).
- **RNF-CHAT-002:** El sistema debe soportar al menos 100 conexiones WebSocket concurrentes sin degradación perceptible de rendimiento.
- **RNF-CHAT-003:** La función Lambda `handleMessage` debe completar su ejecución en menos de 5 segundos para evitar timeouts.

### 3.2 Disponibilidad
- **RNF-CHAT-004:** El servicio de chat debe estar disponible el 99.5% del tiempo durante horarios de operación (6:00 AM - 12:00 AM hora local).
- **RNF-CHAT-005:** Si el servicio de chat no está disponible, la UI debe mostrar un mensaje amigable y ofrecer alternativas (números de teléfono de emergencia, formulario web clásico).

### 3.3 Seguridad
- **RNF-CHAT-006:** Todas las conexiones WebSocket deben estar autenticadas mediante token JWT de Cognito. No se permitirán conexiones anónimas.
- **RNF-CHAT-007:** Los mensajes del chat no deben almacenarse permanentemente (solo durante la sesión activa + TTL de 30 minutos). No se persisten conversaciones históricas del bot.
- **RNF-CHAT-008:** El bot no debe revelar información de reportes que no pertenezcan al usuario solicitante.
- **RNF-CHAT-009:** Se debe implementar rate limiting: máximo 30 mensajes por minuto por usuario para evitar abuso.

### 3.4 Experiencia de Usuario
- **RNF-CHAT-010:** La interfaz del chat debe mostrar indicadores de "escribiendo..." mientras el bot procesa la respuesta.
- **RNF-CHAT-011:** Los mensajes del bot deben incluir emojis relevantes para mejorar la legibilidad y el tono amigable.
- **RNF-CHAT-012:** El chat debe ser responsivo y funcionar correctamente en resoluciones de 320px a 4K.
- **RNF-CHAT-013:** El componente de chat debe ser un widget flotante (floating action button) que no obstruya la navegación principal.

---

## 4. Contratos de API

### 4.1 WebSocket API

**URL de Conexión:**
```
wss://{api-id}.execute-api.{region}.amazonaws.com/{stage}?token={jwt_token}
```

**Rutas:**

| Ruta | Función Lambda | Descripción |
|---|---|---|
| `$connect` | `chatConnect` | Valida token y registra conexión |
| `$disconnect` | `chatDisconnect` | Limpia registro de conexión |
| `sendMessage` | `chatHandleMessage` | Procesa mensaje del usuario |

### 4.2 API REST (Nuevos Endpoints)

#### POST /api/admin/faqs
**Request Body:**
```json
{
  "question": "¿Cuál es el número de emergencias?",
  "answer": "El número de emergencias es 911.",
  "keywords": ["emergencia", "número", "teléfono", "911"],
  "category": "contactos"
}
```
**Response (201):**
```json
{
  "success": true,
  "data": {
    "faqId": "uuid",
    "question": "¿Cuál es el número de emergencias?",
    "answer": "El número de emergencias es 911.",
    "keywords": ["emergencia", "número", "teléfono", "911"],
    "category": "contactos",
    "isActive": true,
    "createdAt": "2026-09-01T00:00:00Z"
  }
}
```

#### GET /api/admin/faqs
**Query Parameters:** `?category=contactos&isActive=true`
**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "faqId": "uuid",
      "question": "¿Cuál es el número de emergencias?",
      "answer": "El número de emergencias es 911.",
      "keywords": ["emergencia", "número", "teléfono", "911"],
      "category": "contactos",
      "isActive": true
    }
  ],
  "count": 1
}
```

---

## 5. Modelos de Datos Nuevos

### 5.1 WebSocketConnectionsTable
| Atributo | Tipo | Key | Descripción |
|---|---|---|---|
| `connectionId` | String | PK | ID de la conexión de API Gateway |
| `userId` | String | GSI-PK | ID del usuario de Cognito |
| `connectedAt` | String (ISO 8601) | — | Timestamp de conexión |
| `ttl` | Number | — | TTL para auto-limpieza (2 horas) |

### 5.2 ChatSessionsTable
| Atributo | Tipo | Key | Descripción |
|---|---|---|---|
| `sessionId` | String | PK | UUID de la sesión de chat |
| `userId` | String | GSI-PK | ID del usuario |
| `connectionId` | String | — | Conexión WebSocket asociada |
| `currentState` | String | — | Estado actual de la máquina de estados |
| `reportDraft` | Map | — | Borrador parcial del reporte |
| `createdAt` | String | — | Timestamp de inicio de sesión |
| `updatedAt` | String | — | Timestamp de última interacción |
| `ttl` | Number | — | TTL de 30 minutos (auto-limpieza) |

### 5.3 ChatFaqsTable
| Atributo | Tipo | Key | Descripción |
|---|---|---|---|
| `faqId` | String | PK | UUID de la FAQ |
| `category` | String | GSI-PK | Categoría para filtrado |
| `question` | String | — | Pregunta en lenguaje natural |
| `answer` | String | — | Respuesta del bot |
| `keywords` | List\<String\> | — | Palabras clave para matching |
| `priority` | Number | GSI-SK | Orden de prioridad |
| `isActive` | Boolean | — | Si está habilitada |
| `createdAt` | String | — | Fecha de creación |
| `updatedAt` | String | — | Fecha de última modificación |

---

## 6. Diagrama de Secuencia

```
Ciudadano (Web/App)          API Gateway WS          Lambda handleMessage         DynamoDB
       │                          │                          │                        │
       │── ws://connect?token ──▶│                          │                        │
       │                          │── invoke $connect ──────▶│                        │
       │                          │                          │── PutItem ────────────▶│
       │                          │                          │  (WebSocketConnections) │
       │                          │◀── 200 OK ──────────────│                        │
       │◀── connection opened ───│                          │                        │
       │                          │                          │                        │
       │── sendMessage ─────────▶│                          │                        │
       │  {"message":"hola"}      │── invoke handleMessage ─▶│                        │
       │                          │                          │── GetItem(userId) ────▶│
       │                          │                          │◀── userData ───────────│
       │                          │                          │                        │
       │                          │                          │── detectIntent() ──────│
       │                          │                          │── generateResponse() ──│
       │                          │                          │                        │
       │                          │◀── postToConnection ────│                        │
       │◀── botResponse ─────────│                          │                        │
       │                          │                          │                        │
```
