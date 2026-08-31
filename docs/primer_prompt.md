# Primer Prompt — Guía para iniciar el desarrollo con IA

> **Instrucciones:** Copia y pega el texto del bloque correspondiente a un agente de programación (Antigravity, Claude, ChatGPT, Cursor, etc.) cuando estés listo para empezar a programar cada fase. Cada prompt está diseñado para dar contexto absoluto al agente y guiarlo a ejecutar las tareas en el orden correcto.

---

## Prompt 1: Chatbot Backend (Fase 1 — Tareas T-1.1 a T-1.4)

```text
Hola, eres un agente experto en desarrollo Backend Serverless con Node.js y AWS. Estamos trabajando en la expansión de "HALO" (Urban Shield), una plataforma de gestión de emergencias urbanas.

CONTEXTO OBLIGATORIO — LEE ESTOS ARCHIVOS PRIMERO:
1. docs/arquitectura_inicial.md — Entiende la arquitectura actual del proyecto (Lambda, DynamoDB, API Gateway HTTP, etc.).
2. docs/project_context.md — Registro de cambios y estado actual del proyecto.
3. openspec/changes/halo-v2-expansion/specs/chatbot/spec.md — Especificación COMPLETA del chatbot (requisitos funcionales, no funcionales, contratos de API, modelos de datos, diagramas).
4. openspec/changes/halo-v2-expansion/design.md — Decisiones de arquitectura (ADR-001 WebSocket, ADR-002 Detección de intenciones, ADR-006 Máquina de estados).
5. openspec/changes/halo-v2-expansion/tasks.md — Lista completa de tareas con verificaciones.

STACK DEL BACKEND EXISTENTE:
- Node.js + Express envuelto en serverless-http
- AWS Lambda (monolito serverless)
- AWS API Gateway V2 (HTTP API) para REST
- Amazon DynamoDB (tablas: UsersTable, ReportsTable, NotificationsTable, ActivityLogsTable, SupportMessagesTable)
- Serverless Framework (serverless.yml) para IaC
- Amazon Cognito para autenticación

TU OBJETIVO:
Ejecutar las tareas T-1.1 y T-1.2 del tasks.md:
- T-1.1: Modificar serverless.yml para agregar una API WebSocket con rutas $connect, $disconnect, sendMessage + crear la tabla WebSocketConnectionsTable.
- T-1.2: Agregar las tablas ChatSessionsTable y ChatFaqsTable en serverless.yml.

INSTRUCCIONES:
1. Primero, muestra un plan paso a paso breve de los archivos que vas a modificar.
2. Pide mi confirmación antes de escribir código.
3. Aplica las mejores prácticas de Serverless Framework v3/v4.
4. Asegúrate de que las tablas tengan los índices GSI, TTL y configuración exacta descrita en el spec del chatbot (sección 5 "Modelos de Datos Nuevos").
5. Al terminar, actualiza docs/project_context.md registrando lo que implementaste.

¿Entendido? Muestra tu plan.
```

---

## Prompt 2: Chatbot Handlers (Fase 1 — Tareas T-1.3 a T-1.11)

```text
Continuamos con el desarrollo del Chatbot de HALO. Ya se completaron las tareas T-1.1 y T-1.2 (infraestructura WebSocket + tablas DynamoDB). Revisa docs/project_context.md para ver el estado actual.

CONTEXTO:
- Lee openspec/changes/halo-v2-expansion/specs/chatbot/spec.md (requisitos RF-CHAT-001 a RF-CHAT-010).
- Lee openspec/changes/halo-v2-expansion/design.md (ADR-002 para el patrón de detección de intenciones por regex, ADR-006 para la máquina de estados).
- Las tablas WebSocketConnectionsTable, ChatSessionsTable y ChatFaqsTable ya existen en serverless.yml.

TU OBJETIVO:
Implementar las tareas T-1.3 a T-1.11 en orden:
1. T-1.3: Handler $connect (validar JWT de Cognito, guardar connectionId en DynamoDB).
2. T-1.4: Handler $disconnect (eliminar connectionId).
3. T-1.5: Módulo intentDetector.js (regex + keywords para 6 intenciones).
4. T-1.6: Handler principal handleMessage.js (orquestador).
5. T-1.7: greetingHandler.js y helpHandler.js.
6. T-1.8: faqHandler.js (consultar ChatFaqsTable por keywords).
7. T-1.9: statusHandler.js (consultar ReportsTable + ActivityLogsTable).
8. T-1.10: stateMachine.js (máquina de estados para creación de reportes).
9. T-1.11: createHandler.js (integración del stateMachine con handleMessage).

INSTRUCCIONES:
1. Crea los archivos en la estructura descrita en design.md sección 3.1 (src/websocket/).
2. Usa @aws-sdk/client-apigatewaymanagementapi para enviar respuestas al cliente.
3. Sigue los payloads exactos descritos en el spec (sección 4 "Contratos de API").
4. Incluye los emojis y formato de mensajes del bot tal como están en el spec.
5. Para cada archivo creado, muestra brevemente qué hace y su verificación.
6. Al terminar todo, actualiza docs/project_context.md.

Empieza con T-1.3 ($connect handler).
```

---

## Prompt 3: Pipeline de Predicciones (Fase 2 — Tareas T-2.1 a T-2.9)

```text
Vamos a implementar el módulo de Predicción de Hotspots de HALO. Este es el componente de IA del proyecto.

CONTEXTO OBLIGATORIO:
- Lee openspec/changes/halo-v2-expansion/specs/predictions/spec.md — COMPLETA (requisitos RF-PRED-001 a RF-PRED-012, pipeline de datos, modelos Prophet y ARIMA, evaluación, Dockerfile, scheduling).
- Lee openspec/changes/halo-v2-expansion/design.md — ADR-004 (Lambda Container Images) y ADR-005 (S3 como cache).
- Lee docs/arquitectura_inicial.md para entender las tablas de DynamoDB existentes.

STACK DE PREDICCIÓN:
- Python 3.11
- Prophet (Meta) como modelo principal
- ARIMA/SARIMA (statsmodels + pmdarima) como modelo comparativo
- pandas, numpy, scikit-learn para datos y métricas
- boto3 para interacción con DynamoDB y S3
- Docker para empaquetado en Lambda Container Image
- Amazon ECR para almacenamiento de la imagen
- Amazon EventBridge para scheduling diario

TU OBJETIVO:
Ejecutar las tareas T-2.1 a T-2.9 del tasks.md:
1. T-2.1: Script de generación de datos sintéticos (365 días, 5+ zonas, patrones estacionales).
2. T-2.2: Módulo extract.py (extracción de datos de DynamoDB).
3. T-2.3: Módulo transform.py (ETL: limpieza, agrupación por zona/día, DataFrame para Prophet).
4. T-2.4: Módulo prophet_model.py (entrenamiento Prophet con estacionalidades).
5. T-2.5: Módulo arima_model.py (auto_arima + SARIMA).
6. T-2.6: Módulo evaluator.py (métricas: MAE, RMSE, MAPE, R², comparación).
7. T-2.7: handler.py (orquestador del pipeline completo).
8. T-2.8: Dockerfile completo + build + push a ECR.
9. T-2.9: Regla de EventBridge en serverless.yml para cron diario.

INSTRUCCIONES:
1. Crea todos los archivos en prediction-service/ con la estructura del design.md sección 3.2.
2. Incluye docstrings completos, type hints, y manejo de errores.
3. Sigue los contratos de API y estructura de S3 exactos del spec (sección 4 "Endpoints" y sección 4.1 "Estructura de S3").
4. Los hiperparámetros del modelo deben estar en config/model_config.yaml.
5. Al terminar, actualiza docs/project_context.md.

Empieza con T-2.1 (datos sintéticos). Muestra tu plan.
```

---

## Prompt 4: Frontend del Chatbot (Fase 3 — Tareas T-3.1 a T-3.4)

```text
Vamos a implementar la interfaz del Chatbot en el frontend web de HALO (React 19).

CONTEXTO:
- Frontend repo: chriscc27/frontend_urbanshield (React 19 + Vite + TailwindCSS + MapLibre).
- Lee openspec/changes/halo-v2-expansion/specs/chatbot/spec.md — secciones de RNF de UX (RNF-CHAT-010 a RNF-CHAT-013).
- Lee openspec/changes/halo-v2-expansion/design.md — estructura de carpetas sección 3.3.

TU OBJETIVO:
Tareas T-3.1 a T-3.4:
1. T-3.1: Custom hook useWebSocket.js (connect, disconnect, reconnect con backoff exponencial, enviar/recibir mensajes).
2. T-3.2: Componente ChatWidget.jsx (FAB flotante con badge de notificaciones, animación apertura/cierre).
3. T-3.3: ChatWindow.jsx, ChatMessage.jsx, ChatInput.jsx, ChatTyping.jsx (burbujas de chat, scroll automático, indicador de "escribiendo...").
4. T-3.4: Integración con geolocalización del navegador y file picker para fotos durante el flujo de creación de reportes por chat.

INSTRUCCIONES:
1. El diseño del chat debe ser premium, con animaciones suaves (framer-motion o CSS transitions).
2. El FAB debe ser un botón circular con ícono de chat, con pulso suave cuando hay mensajes no leídos.
3. Los colores deben ser consistentes con el tema existente de HALO.
4. Al terminar, actualiza docs/project_context.md.

Empieza con T-3.1 (useWebSocket hook).
```

---

## Prompt 5: Dashboard de Predicciones (Fase 4 — Tareas T-4.1 a T-4.5)

```text
Vamos a implementar las visualizaciones de predicciones en el Dashboard de Administración de HALO.

CONTEXTO:
- Lee openspec/changes/halo-v2-expansion/specs/predictions/spec.md — sección 2.4 "Visualización" (RF-PRED-009 a RF-PRED-012).
- Los endpoints /api/admin/predictions, /api/admin/predictions/:zoneId, y /api/admin/predictions/heatmap ya están implementados.
- El frontend usa Recharts para gráficas y MapLibre GL JS para mapas.

TU OBJETIVO:
Tareas T-4.1 a T-4.5:
1. T-4.1: PredictionChart.jsx — gráfica de Predicción vs Realidad (línea azul = real, roja punteada = predicción, banda rosa = intervalo de confianza).
2. T-4.2: SeasonalityChart.jsx — grid 2x2 con componentes de estacionalidad Prophet (trend, weekly, daily, yearly).
3. T-4.3: HeatmapLayer.jsx — capa de mapa de calor predictivo en MapLibre con toggle y selector temporal.
4. T-4.4: ModelComparisonTable.jsx + PredictionKPIs.jsx — tabla de métricas y tarjetas de resumen.
5. T-4.5: PredictionsPage.jsx — página completa que integra todo en el dashboard de admin.

INSTRUCCIONES:
1. Las gráficas deben ser interactivas (tooltip, zoom, selectors).
2. Usa Recharts para gráficas de series de tiempo y barras.
3. El mapa de calor usa la capa nativa 'heatmap' de MapLibre GL JS.
4. El diseño debe ser profesional y consistente con el dashboard existente.
5. Al terminar, actualiza docs/project_context.md.

Empieza con T-4.1 (PredictionChart).
```

---

## Prompt 6: App Móvil (Fase 5 — Tareas T-5.1 a T-5.9)

```text
Vamos a desarrollar la aplicación móvil de HALO usando React Native con Expo.

CONTEXTO OBLIGATORIO:
- Lee openspec/changes/halo-v2-expansion/specs/mobile-app/spec.md — COMPLETA (14 requisitos funcionales detallados, requisitos no funcionales, estructura de navegación, dependencias, contratos de API).
- Lee openspec/changes/halo-v2-expansion/design.md — ADR-003 (React Native con Expo Bare Workflow) y sección 3.4 (estructura de carpetas).
- El backend ya está completamente funcional con la API REST y el WebSocket.

STACK MÓVIL:
- React Native con Expo (Bare Workflow / Prebuild)
- TypeScript
- React Navigation (Bottom Tabs + Native Stack)
- react-native-maps, expo-location, expo-image-picker, expo-secure-store, expo-notifications
- Axios para HTTP, zustand para estado global
- react-native-reanimated para animaciones

TU OBJETIVO:
Tareas T-5.1 a T-5.9 en orden:
1. T-5.1: Configurar navegación (AuthStack + MainTabs + RootNavigator).
2. T-5.2: LoginScreen + RegisterScreen + almacenamiento seguro de tokens.
3. T-5.3: HomeScreen con mapa interactivo y tarjetas de resumen.
4. T-5.4: CreateReportScreen (formulario completo con cámara, GPS, pre-signed URLs).
5. T-5.5: MyReportsScreen + ReportDetailScreen (lista con filtros, detalle con timeline).
6. T-5.6: ChatScreen (WebSocket conectado al chatbot del backend).
7. T-5.7: Notificaciones push (expo-notifications + registro de token).
8. T-5.8: Modo offline (borradores en AsyncStorage + sync automático).
9. T-5.9: ProfileScreen (datos, configuración, logout).

INSTRUCCIONES:
1. Inicializa el proyecto con: npx create-expo-app mobile_urbanshield --template blank-typescript
2. Sigue la estructura de carpetas del design.md sección 3.4.
3. Sigue los requisitos funcionales del spec exactamente (RF-MOB-001 a RF-MOB-014).
4. Al terminar cada pantalla principal, muestra brevemente qué hace y su verificación.
5. Al terminar todo, actualiza docs/project_context.md.

Empieza con T-5.1 (navegación). Muestra tu plan.
```
