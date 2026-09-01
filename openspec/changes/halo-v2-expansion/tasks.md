# Tareas de Implementación — Expansión HALO v2

Todas las tareas están ordenadas por dependencias (lo que desbloquea primero va primero). Cada tarea debe ser completable en máximo 4 horas e incluye un criterio de verificación claro.

---

## Fase 0: Preparación e Infraestructura Base

### 0.1 Infraestructura y Configuración

- [ ] **T-0.1:** Clonar los repositorios `frontend_urbanshield` y `backend_urbanshield` en el entorno de desarrollo local. Verificar que el frontend compila con `npm run dev` y que el backend se despliega con `serverless deploy` o corre localmente con `serverless offline`.
 - **Verificación:** `npm run dev` abre la app web en localhost sin errores; `serverless offline` responde a `GET /api/health` con 200.

- [ ] **T-0.2:** Crear el repositorio `mobile_urbanshield` en GitHub con la configuración inicial de Expo: `npx create-expo-app mobile_urbanshield --template blank-typescript`. Configurar ESLint, Prettier, y .gitignore. Hacer el primer commit y push.
 - **Verificación:** `npx expo start` abre la app en un emulador o dispositivo físico mostrando la pantalla por defecto de Expo.

- [ ] **T-0.3:** Crear el directorio `prediction-service/` dentro del repositorio del backend (o como repositorio separado) con el `Dockerfile`, `requirements.txt` base, y un `handler.py` placeholder que simplemente devuelva `{"status": "ok"}`. Verificar que la imagen Docker se construye localmente con `docker build -t halo-prediction .` sin errores.
 - **Verificación:** `docker build` completa sin errores; `docker run -p 9000:8080 halo-prediction` responde a una invocación de prueba con `{"status": "ok"}`.

- [ ] **T-0.4:** Crear un repositorio ECR en AWS para la imagen de predicción: `aws ecr create-repository --repository-name halo-prediction-model`. Documentar el URI del repositorio.
 - **Verificación:** `aws ecr describe-repositories --repository-names halo-prediction-model` devuelve la información del repositorio.

- [ ] **T-0.5:** Actualizar `docs/project_context.md` con el registro de los repositorios y la infraestructura creada.
 - **Verificación:** El archivo contiene los enlaces a los nuevos repositorios y las decisiones de configuración.

---

## Fase 1: Chatbot — Backend (WebSocket API)

### 1.1 Infraestructura de WebSocket

- [ ] **T-1.1:** Modificar `serverless.yml` del backend para agregar la configuración de AWS API Gateway WebSocket, definiendo las rutas `$connect`, `$disconnect`, y `sendMessage`, con sus funciones Lambda asociadas (`chatConnect`, `chatDisconnect`, `chatHandleMessage`). Agregar la tabla `WebSocketConnectionsTable` en DynamoDB con `connectionId` como PK, `userId` como GSI, y TTL habilitado.
 - **Verificación:** `serverless deploy` crea la API WebSocket y la tabla sin errores; la URL de WebSocket aparece en los outputs del stack.

- [ ] **T-1.2:** Agregar la tabla `ChatSessionsTable` en DynamoDB (en `serverless.yml`) con `sessionId` como PK, `userId` como GSI, y TTL de 30 minutos. Agregar la tabla `ChatFaqsTable` con `faqId` como PK y `category` como GSI.
 - **Verificación:** Las tres tablas (WebSocketConnections, ChatSessions, ChatFaqs) existen en la consola de DynamoDB tras el despliegue.

### 1.2 Handlers de Conexión

- [ ] **T-1.3:** Implementar `src/websocket/connect.js` — función Lambda para `$connect`. Debe extraer el token JWT del query parameter `?token=`, validarlo contra las claves públicas de Cognito (JWKS), y si es válido, guardar un registro `{connectionId, userId, connectedAt, ttl}` en `WebSocketConnectionsTable`. Si el token es inválido, devolver 401.
 - **Verificación:** Conectarse con un token válido usando `wscat` devuelve conexión exitosa; conectarse sin token o con token inválido devuelve rechazo.

- [ ] **T-1.4:** Implementar `src/websocket/disconnect.js` — función Lambda para `$disconnect`. Debe eliminar el registro del `connectionId` de `WebSocketConnectionsTable`.
 - **Verificación:** Tras desconectarse, el item ya no existe en DynamoDB; no se producen errores si se intenta desconectar una conexión ya eliminada.

### 1.3 Procesamiento de Mensajes

- [ ] **T-1.5:** Implementar `src/websocket/intentDetector.js` — módulo que recibe el texto del mensaje y devuelve la intención detectada (`greeting`, `help`, `faq`, `status`, `create`, `unknown`) con un score de confianza. Usar expresiones regulares y coincidencia de palabras clave según los patrones definidos en el ADR-002 del design.md.
 - **Verificación:** Un test unitario con al menos 20 frases de ejemplo clasifica correctamente el 85%+ de las intenciones.

- [ ] **T-1.6:** Implementar `src/websocket/handleMessage.js` — función Lambda principal para la ruta `sendMessage`. Debe: (1) recuperar el `userId` del `connectionId` desde DynamoDB, (2) llamar a `intentDetector` para clasificar el mensaje, (3) delegar al handler correspondiente según la intención, (4) enviar la respuesta de vuelta al cliente usando `@aws-sdk/client-apigatewaymanagementapi`.
 - **Verificación:** Enviar "hola" vía WebSocket devuelve el saludo del bot; enviar "ayuda" devuelve el menú de opciones.

- [ ] **T-1.7:** Implementar `src/websocket/handlers/greetingHandler.js` y `src/websocket/handlers/helpHandler.js`. El greeting devuelve un saludo personalizado con el nombre del usuario + menú de opciones. El help devuelve una lista de las capacidades del bot con ejemplos.
 - **Verificación:** Los handlers devuelven las respuestas esperadas con emojis y formato correcto.

- [ ] **T-1.8:** Implementar `src/websocket/handlers/faqHandler.js`. Debe consultar `ChatFaqsTable` buscando FAQs cuyas keywords coincidan con las palabras del mensaje del usuario. Devolver la FAQ con mayor coincidencia, o un mensaje de "no encontré información sobre eso" si no hay match.
 - **Verificación:** Insertar 5 FAQs de prueba en la tabla; preguntar "número de emergencias" devuelve la FAQ correcta; preguntar algo irrelevante devuelve el mensaje de fallback.

- [ ] **T-1.9:** Implementar `src/websocket/handlers/statusHandler.js`. Debe extraer el ID del reporte del mensaje (regex), consultar `ReportsTable`, verificar que pertenece al usuario, y devolver un resumen formateado del estado con emojis y las últimas 3 actividades del `ActivityLogsTable`.
 - **Verificación:** Preguntar "estado del reporte 123" devuelve la información correcta del reporte; preguntar por un reporte que no existe devuelve error amigable.

- [ ] **T-1.10:** Implementar `src/websocket/stateMachine.js` — módulo que gestiona la máquina de estados para la creación de reportes por chat. Debe leer y escribir el estado actual de la sesión en `ChatSessionsTable`, validar las entradas del usuario en cada paso, y transicionar al siguiente estado.
 - **Verificación:** Simular un flujo completo de creación de reporte (7 mensajes del usuario) resulta en un item correcto en `ReportsTable`.

- [ ] **T-1.11:** Implementar `src/websocket/handlers/createHandler.js`. Integrar el `stateMachine.js` con el handler de mensajes. Cada mensaje del usuario durante la creación de un reporte debe avanzar la máquina de estados y devolver el prompt correspondiente al siguiente paso.
 - **Verificación:** Test end-to-end: enviar la secuencia "quiero reportar" → "1" (categoría) → "descripción del incidente..." → "1" (usar GPS) → "2" (sin foto) → "sí" (confirmar) → el reporte se crea en DynamoDB.

### 1.4 API REST para FAQs

- [ ] **T-1.12:** Implementar los endpoints REST de CRUD de FAQs en `src/routes/admin/faqs.js`: `POST /api/admin/faqs`, `GET /api/admin/faqs`, `PUT /api/admin/faqs/:faqId`, `DELETE /api/admin/faqs/:faqId`. Proteger con middleware de autenticación de administrador.
 - **Verificación:** Crear, leer, actualizar y eliminar FAQs desde Postman funciona correctamente; los endpoints rechazan peticiones sin token de admin.

### 1.5 Notificaciones Proactivas

- [ ] **T-1.13:** Modificar el endpoint existente `PUT /api/reports/:id/status` para que, tras actualizar el estado del reporte, busque en `WebSocketConnectionsTable` si el ciudadano dueño del reporte tiene una conexión activa y le envíe una notificación WebSocket con el cambio de estado.
 - **Verificación:** Mientras el ciudadano tiene el chat abierto, un administrador cambia el estado de su reporte y el ciudadano recibe un mensaje del bot informando del cambio en menos de 3 segundos.

---

## Fase 2: Predicción de Hotspots — Pipeline de IA

### 2.1 Datos y ETL

- [ ] **T-2.1:** Implementar `prediction-service/src/generators/synthetic_data.py` — script que genera un dataset sintético de 365 días de incidentes urbanos con patrones estacionales realistas (diarios, semanales, mensuales) distribuidos en al menos 5 zonas geográficas. Guardar como CSV. Incluir docstrings y type hints.
 - **Verificación:** El script genera un CSV con >5000 registros; una gráfica rápida (`matplotlib`) del dataset muestra patrones estacionales visibles a simple vista.

- [ ] **T-2.2:** Implementar `prediction-service/src/pipeline/extract.py` — módulo que extrae datos de `ReportsTable` usando `boto3` (scan o query). Debe manejar paginación (DynamoDB devuelve máximo 1MB por scan). Si no hay datos suficientes, cargar los datos sintéticos generados en T-2.1.
 - **Verificación:** El módulo extrae correctamente todos los registros de la tabla (o los sintéticos) y los devuelve como una lista de diccionarios Python.

- [ ] **T-2.3:** Implementar `prediction-service/src/pipeline/transform.py` — módulo que transforma la lista de incidentes crudos en DataFrames de pandas agrupados por zona y frecuencia diaria (`ds`, `y`). Debe asignar zonas geográficas basándose en la configuración de `zones.json`, manejar fechas faltantes (rellenar con 0), y detectar outliers.
 - **Verificación:** Para cada zona, se genera un DataFrame con una fila por día y la columna `y` con la frecuencia de incidentes; no hay fechas faltantes en la secuencia.

### 2.2 Modelos

- [ ] **T-2.4:** Implementar `prediction-service/src/models/prophet_model.py` — módulo con función `train_prophet(df, zone_id)` que entrena un modelo Prophet con las estacionalidades configuradas (diaria, semanal, anual), genera predicciones a 30 días, y devuelve el forecast DataFrame junto con los componentes de estacionalidad.
 - **Verificación:** El modelo se entrena sin errores en los datos sintéticos; el forecast tiene 30 filas con `yhat`, `yhat_lower`, `yhat_upper`; las estacionalidades son interpretables.

- [ ] **T-2.5:** Implementar `prediction-service/src/models/arima_model.py` — módulo con función `train_arima(df, zone_id)` que usa `pmdarima.auto_arima` para seleccionar automáticamente los hiperparámetros `(p,d,q)(P,D,Q,s)` y generar predicciones a 30 días comparables con Prophet.
 - **Verificación:** `auto_arima` selecciona parámetros sin errores; las predicciones tienen el mismo formato que las de Prophet para facilitar la comparación.

- [ ] **T-2.6:** Implementar `prediction-service/src/models/evaluator.py` — módulo que calcula las métricas de evaluación (MAE, RMSE, MAPE, R²) para ambos modelos usando train-test split (80/20). Generar una tabla comparativa por zona y seleccionar el modelo ganador (menor RMSE) automáticamente.
 - **Verificación:** Las métricas se calculan correctamente; la tabla comparativa muestra valores razonables; el modelo ganador se selecciona automáticamente.

### 2.3 Despliegue y Scheduling

- [ ] **T-2.7:** Implementar `prediction-service/src/handler.py` — entry point de Lambda que orquesta todo el pipeline: (1) Extraer datos, (2) Transformar, (3) Entrenar Prophet por zona, (4) Entrenar ARIMA por zona, (5) Evaluar y comparar, (6) Serializar predicciones y métricas en JSON, (7) Subir resultados a S3.
 - **Verificación:** Invocar el handler localmente (`docker run ... handler.lambda_handler`) produce los archivos JSON esperados en la carpeta de output (simulando S3 localmente).

- [ ] **T-2.8:** Configurar el Dockerfile completo para Lambda Container Image con todas las dependencias de Python. Hacer build, tag y push de la imagen a ECR. Crear la función Lambda en `serverless.yml` (o manualmente via CLI) apuntando a la imagen de ECR.
 - **Verificación:** `docker push` completa sin errores; la función Lambda se crea en la consola de AWS apuntando a la imagen correcta; una invocación de prueba devuelve resultados.

- [ ] **T-2.9:** Configurar la regla de EventBridge en `serverless.yml` para ejecutar la Lambda de predicción diariamente a las 03:00 AM. Agregar una notificación SNS para alertar si el job falla.
 - **Verificación:** La regla aparece en la consola de EventBridge; un trigger manual de prueba ejecuta correctamente la Lambda y genera resultados en S3.

### 2.4 Endpoints de Consulta

- [ ] **T-2.10:** Implementar `src/routes/admin/predictions.js` en el backend Node.js con los endpoints: `GET /api/admin/predictions` (todas las zonas), `GET /api/admin/predictions/:zoneId` (zona específica con histórico), `GET /api/admin/predictions/heatmap` (datos del mapa de calor). Todos leen los JSON de S3 generados por el job batch.
 - **Verificación:** Tras una ejecución exitosa del job de predicción, los 3 endpoints devuelven datos JSON válidos con las predicciones y métricas.

---

## Fase 3: Chatbot — Frontend Web

- [ ] **T-3.1:** Implementar el custom hook `useWebSocket.js` en el frontend React que gestione la conexión WebSocket (connect, disconnect, reconnect con backoff exponencial, enviar mensajes, recibir mensajes). Debe manejar el estado de conexión (connecting, connected, disconnected, error).
 - **Verificación:** El hook se conecta al WebSocket API, envía un mensaje y recibe la respuesta; se reconecta automáticamente si se fuerza una desconexión.

- [ ] **T-3.2:** Implementar el componente `ChatWidget.jsx` — un Floating Action Button (FAB) en la esquina inferior derecha de la aplicación web que al hacer clic despliega la ventana del chat. Incluir badge de notificaciones no leídas, animación de apertura/cierre, y estado minimizado/maximizado.
 - **Verificación:** El FAB aparece en todas las páginas de la app web; al clic se despliega una ventana de chat con la lista de mensajes y un input de texto.

- [ ] **T-3.3:** Implementar los componentes `ChatWindow.jsx`, `ChatMessage.jsx`, `ChatInput.jsx`, `ChatTyping.jsx`. El ChatWindow muestra la conversación con scroll automático al final, distinguiendo visualmente las burbujas del usuario (derecha, color primario) y del bot (izquierda, color neutro). El ChatInput permite enviar con Enter o botón. El ChatTyping muestra un indicador animado ("...") mientras se espera la respuesta del bot.
 - **Verificación:** La interfaz del chat es funcional y estéticamente consistente con el diseño existente de HALO; las burbujas se distinguen claramente; el scroll automático funciona.

- [ ] **T-3.4:** Integrar el chat con el flujo de creación de reportes: cuando el bot pide "Usar mi ubicación actual", el componente de chat solicita permisos de geolocalización del navegador y envía las coordenadas como respuesta. Cuando pide una foto, abrir el file picker del navegador.
 - **Verificación:** Completar un flujo de creación de reporte por chat desde el frontend web funciona end-to-end: el reporte se crea en el backend con la ubicación y la foto correctas.

---

## Fase 4: Predicción — Frontend (Dashboard de Admin)

- [ ] **T-4.1:** Implementar `PredictionChart.jsx` — gráfica de series de tiempo con Recharts que superpone los datos históricos reales (línea azul sólida), las predicciones del modelo (línea roja punteada), y el intervalo de confianza (banda sombreada rosa). Agregar tooltip interactivo, zoom, y selector de zona.
 - **Verificación:** La gráfica se renderiza correctamente con datos del endpoint `/api/admin/predictions/:zoneId`; el tooltip muestra los valores correctos; el zoom funciona.

- [ ] **T-4.2:** Implementar `SeasonalityChart.jsx` — grid de 2x2 con las componentes de estacionalidad de Prophet (tendencia, semanal, diaria, anual). Cada subgráfica debe ser interpretable con labels y tooltips apropiados.
 - **Verificación:** Las 4 componentes se muestran correctamente; la estacionalidad semanal muestra picos en viernes/sábado; la diaria muestra pico nocturno.

- [ ] **T-4.3:** Implementar `HeatmapLayer.jsx` — capa de MapLibre GL JS que renderiza el mapa de calor predictivo sobre el mapa existente del administrador. Incluir toggle entre vista de marcadores y vista de heatmap, y selector temporal (hoy, mañana, próximos 7 días).
 - **Verificación:** El mapa de calor se renderiza con gradiente de colores (verde → rojo) sobre el mapa; al clic en una zona se muestra popup con predicciones detalladas.

- [ ] **T-4.4:** Implementar `ModelComparisonTable.jsx` y `PredictionKPIs.jsx`. La tabla muestra las métricas (MAE, RMSE, MAPE, R²) de Prophet vs ARIMA por zona. Los KPIs muestran tarjetas resumen con la precisión general, zonas analizadas, última actualización, y modelo preferido.
 - **Verificación:** La tabla y las tarjetas se renderizan con datos reales del endpoint de predicciones; la tabla resalta visualmente el modelo ganador por zona.

- [ ] **T-4.5:** Crear la página `PredictionsPage.jsx` en el Dashboard de Administración que integre todos los componentes anteriores (gráficas, mapa de calor, tabla, KPIs) en un layout organizado con tabs o secciones. Agregar la ruta en el React Router y un link en la navegación del admin.
 - **Verificación:** La página se accede desde la navegación del admin; todos los componentes cargan y muestran datos; la experiencia es fluida.

---

## Fase 5: Aplicación Móvil (React Native)

### 5.1 Navegación y Autenticación

- [ ] **T-5.1:** Configurar la navegación principal de la app con React Navigation: `AuthStack` (Splash, Login, Register) y `MainTabs` (Home, Mis Reportes, Crear Reporte, Chat, Perfil). Implementar el `RootNavigator` que decide si mostrar el AuthStack o MainTabs basándose en la existencia de un token en SecureStore.
 - **Verificación:** La app muestra el AuthStack si no hay sesión; tras login exitoso, navega al MainTabs; cerrar y reabrir la app mantiene la sesión.

- [ ] **T-5.2:** Implementar `LoginScreen.tsx` y `RegisterScreen.tsx` conectados al backend existente (`POST /api/auth/login`, `POST /api/auth/register`). Implementar almacenamiento seguro de tokens en `expo-secure-store` y renovación automática con interceptor de Axios.
 - **Verificación:** Un usuario puede registrarse, verificar su correo, iniciar sesión y mantener la sesión persistida; el token se renueva automáticamente antes de expirar.

### 5.2 Dashboard y Reportes

- [ ] **T-5.3:** Implementar `HomeScreen.tsx` con el mapa interactivo (`react-native-maps`) mostrando incidentes cercanos, tarjetas de resumen scrolleables y el FAB de reporte rápido. Obtener la ubicación del usuario con `expo-location` para centrar el mapa.
 - **Verificación:** El mapa muestra la ubicación del usuario y los marcadores de incidentes cercanos; las tarjetas muestran estadísticas correctas.

- [ ] **T-5.4:** Implementar `CreateReportScreen.tsx` con el formulario completo: selector visual de categorías, campos de texto con validación, mini-mapa con pin arrastrable para ubicación, botones de cámara/galería para fotos (`expo-image-picker`), y selector de urgencia. Conectar con el endpoint `POST /api/reports` y la subida de fotos a S3 via pre-signed URLs.
 - **Verificación:** Crear un reporte completo con foto y GPS desde la app; el reporte aparece en el backend y en el panel de administración web.

- [ ] **T-5.5:** Implementar `MyReportsScreen.tsx` y `ReportDetailScreen.tsx`. La lista con filtros, pull-to-refresh y scroll infinito. El detalle con mapa, galería de fotos, timeline de actividad y acciones.
 - **Verificación:** La lista muestra todos los reportes del usuario con filtros funcionales; el detalle muestra toda la información del reporte incluyendo el timeline de actividades.

### 5.3 Chat y Notificaciones

- [ ] **T-5.6:** Implementar `ChatScreen.tsx` conectado al WebSocket del backend (reutilizando la lógica del hook `useWebSocket`). Adaptar la interfaz de chat al diseño móvil con burbujas, input de texto, y teclado que no obstruya la conversación.
 - **Verificación:** El chat funciona en la app móvil exactamente como en la web; se pueden crear reportes por chat; las notificaciones proactivas se reciben.

- [ ] **T-5.7:** Configurar notificaciones push con `expo-notifications`: solicitar permisos, obtener el push token, registrarlo en el backend (`POST /api/users/push-token`). Implementar la recepción de notificaciones en foreground (banner in-app), background y killed (notificación del OS).
 - **Verificación:** Una notificación push enviada desde el backend llega correctamente en los 3 estados de la app; al tocar la notificación, la app navega al reporte correspondiente.

### 5.4 Offline y Perfil

- [ ] **T-5.8:** Implementar el modo offline básico: detectar pérdida de conexión con `@react-native-community/netinfo`, guardar borradores de reportes en AsyncStorage, y sincronizar automáticamente al recuperar conexión.
 - **Verificación:** Crear un reporte sin conexión WiFi; el borrador se guarda localmente; al reconectar, el reporte se envía automáticamente.

- [ ] **T-5.9:** Implementar `ProfileScreen.tsx` con datos del usuario, estadísticas, configuración (notificaciones, ubicación, modo oscuro), cambio de contraseña y cierre de sesión.
 - **Verificación:** El usuario puede ver y editar su perfil; el cierre de sesión limpia todos los datos locales y redirige al login.

---

## Fase 6: Testing, Integración y Polish

- [ ] **T-6.1:** Escribir tests unitarios para el `intentDetector.js` con al menos 30 frases de prueba cubriendo todas las intenciones. Cobertura mínima: 85%.
 - **Verificación:** `npm test` pasa sin errores; el reporte de cobertura muestra ≥85% para el módulo de intenciones.

- [ ] **T-6.2:** Escribir tests unitarios para los modelos de predicción (`test_prophet.py`, `test_arima.py`) verificando que los modelos se entrenan correctamente con datos sintéticos y producen métricas razonables (MAE < umbral definido).
 - **Verificación:** `pytest` pasa sin errores; las métricas reportadas están dentro de umbrales aceptables.

- [ ] **T-6.3:** Realizar test de integración end-to-end del chatbot: un script automatizado que establece conexión WebSocket, envía una secuencia de mensajes (saludo → FAQ → consulta de estado → creación de reporte completo) y verifica que las respuestas son correctas y que el reporte se crea en la base de datos.
 - **Verificación:** El script E2E pasa sin errores; el reporte creado por chat existe en DynamoDB con todos los campos correctos.

- [ ] **T-6.4:** Compilar la app React Native para Android (APK) con `eas build --platform android --profile preview`. Probar en al menos 2 dispositivos físicos o emuladores diferentes.
 - **Verificación:** El APK se instala y ejecuta correctamente en los dispositivos de prueba; todos los flujos principales (login, crear reporte, chat) funcionan.

- [ ] **T-6.5:** Actualizar `docs/project_context.md` con el estado final de todas las implementaciones, lecciones aprendidas, y decisiones técnicas tomadas durante el desarrollo.
 - **Verificación:** El documento refleja el estado real del proyecto con enlaces a los PRs y commits relevantes.

---

## Resumen de Dependencias entre Tareas

```
T-0.1 ──┬──▶ T-1.1 ──▶ T-1.2 ──▶ T-1.3 ──▶ T-1.4 ──┐
     │                       │
     │  T-1.5 ──▶ T-1.6 ──▶ T-1.7 ────────────────┤
     │          │              │
     │          ├──▶ T-1.8         │
     │          ├──▶ T-1.9         │
     │          └──▶ T-1.10 ──▶ T-1.11   │
     │                       │
     │  T-1.12 (independiente, solo necesita T-0.1) │
     │                       │
     │  T-1.13 (necesita T-1.3 + T-1.6)      │
     │                       │
T-0.2 ──┼──▶ T-5.1 ──▶ T-5.2 ──▶ T-5.3 ──▶ T-5.4 ──▶ T-5.5
     │               │
     │               ├──▶ T-5.6 (necesita T-1.6)
     │               ├──▶ T-5.7
     │               ├──▶ T-5.8
     │               └──▶ T-5.9
     │
T-0.3 ──┼──▶ T-2.1 ──▶ T-2.2 ──▶ T-2.3 ──▶ T-2.4 ──┐
T-0.4 ──┘               │   ├──▶ T-2.6
                    └──▶ T-2.5 ──┘
                          │
                    T-2.7 ◀────┘
                      │
                    T-2.8 ──▶ T-2.9
                          │
                    T-2.10 ◀───┘

T-3.1 ──▶ T-3.2 ──▶ T-3.3 ──▶ T-3.4 (necesita T-1.6 completo)

T-2.10 ──▶ T-4.1 ──▶ T-4.2
         ├──▶ T-4.3
         └──▶ T-4.4
            │
T-4.5 ◀───────────────┘ (necesita T-4.1 a T-4.4)

T-6.1 a T-6.5 (Fase final, requiere todas las fases anteriores)
```

