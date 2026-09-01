# Diseño Técnico: Expansión de HALO v2

Este documento describe las decisiones de arquitectura, los patrones de implementación y los riesgos técnicos identificados para las tres funcionalidades de la expansión de HALO v2. Cada decisión sigue el formato ADR (Architecture Decision Record) para documentar el contexto, las alternativas consideradas y la justificación de la elección.

---

## 1. Decisiones de Arquitectura

### ADR-001: WebSockets para el Chatbot — API Gateway WebSocket API

**Contexto:** El chatbot requiere comunicación bidireccional en tiempo real entre el cliente y el servidor. Las opciones evaluadas fueron:
1. **Polling HTTP tradicional:** El cliente consulta cada 2 segundos si hay nuevos mensajes.
2. **Server-Sent Events (SSE):** Canal unidireccional servidor → cliente.
3. **AWS API Gateway WebSocket API:** Conexión bidireccional persistente, totalmente serverless.
4. **AWS AppSync (GraphQL Subscriptions):** WebSockets gestionados con un API GraphQL.

**Decisión:** Usar **AWS API Gateway WebSocket API**.

**Justificación:**
- Es la única opción que mantiene la filosofía 100% serverless del proyecto (sin servidores EC2 o ECS para mantener conexiones).
- Soporta hasta 500 conexiones concurrentes por API sin costo adicional significativo.
- Se integra nativamente con Lambda para el procesamiento de mensajes.
- SSE fue descartado porque es unidireccional (el cliente no puede enviar mensajes por el mismo canal).
- Polling fue descartado por la latencia inherente y el costo de invocaciones Lambda innecesarias.
- AppSync fue descartado porque agregaría una capa de complejidad GraphQL que no necesitamos; nuestro backend es REST.

**Consecuencias:**
- Se necesita una tabla DynamoDB adicional para persistir las conexiones activas (`WebSocketConnectionsTable`).
- El timeout por defecto de WebSocket en API Gateway es de 10 minutos de inactividad; implementaremos un mecanismo de keepalive (ping cada 5 minutos desde el cliente).
- Se requiere el SDK `@aws-sdk/client-apigatewaymanagementapi` para enviar mensajes de vuelta al cliente.

---

### ADR-002: Detección de Intenciones del Chatbot — Regex + Keywords (Fase 1)

**Contexto:** El chatbot necesita entender qué quiere hacer el usuario (intención). Las opciones fueron:
1. **AWS Lex v2:** Servicio gestionado de NLP de Amazon, con intenciones, slots y fulfillment.
2. **Dialogflow (Google):** Servicio de NLP gestionado con integración REST.
3. **OpenAI API (GPT):** LLM de propósito general para clasificación de intenciones.
4. **Regex + Keywords propios:** Detección de intenciones basada en expresiones regulares y coincidencia de palabras clave en código propio.

**Decisión:** Usar **Regex + Keywords** para la Fase 1 (MVP), con opción de migrar a AWS Lex en una Fase 2 si el tiempo lo permite.

**Justificación:**
- El número de intenciones es bajo (6 intenciones) y las frases de activación son predecibles.
- No genera costos adicionales (AWS Lex cobra por request; OpenAI cobra por token).
- Es más fácil de depurar y testear: un map de regex es completamente determinístico.
- No requiere configuración de servicios adicionales en AWS.
- AWS Lex se reserva como mejora futura si la detección por regex resulta insuficiente.

**Implementación:**
```javascript
// intent-detector.js
const INTENT_PATTERNS = {
 greeting: [/^(hola|buenos?\s+d[ií]as?|buenas?\s+(tardes?|noches?)|hey|saludos)/i],
 help: [/^(ayuda|help|opciones|men[uú]|que\s+puedes?\s+hacer)/i],
 faq: [/(?:cu[aá]l|qu[eé]|c[oó]mo|d[oó]nde|cu[aá]ndo)\s+(?:es|son|est[aá])/i, /(?:n[uú]mero|tel[eé]fono|horario|contacto|informaci[oó]n)/i],
 status: [/(?:estado|c[oó]mo\s+va|qu[eé]\s+pas[oó]|seguimiento)\s+(?:de\s+)?(?:mi\s+)?(?:reporte|caso|denuncia)/i, /reporte\s*#?\s*\d+/i],
 create: [/(?:quiero|necesito|deseo)\s+(?:reportar|denunciar|crear|hacer)/i, /(?:reportar|denunciar)\s+(?:un|una)/i, /(?:hay|hubo)\s+(?:un|una)\s+(?:robo|accidente|incendio|emergencia)/i],
 unknown: [/.*/] // Fallback
};

function detectIntent(message) {
 for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
  for (const pattern of patterns) {
   if (pattern.test(message.trim())) {
    return { intent, confidence: intent === 'unknown' ? 0.1 : 0.9 };
   }
  }
 }
 return { intent: 'unknown', confidence: 0 };
}
```

---

### ADR-003: React Native con Expo Bare Workflow para la App Móvil

**Contexto:** Se necesita desarrollar una app móvil multiplataforma. Las opciones fueron:
1. **React Native con Expo Managed Workflow:** Desarrollo rápido, pero limitaciones con módulos nativos.
2. **React Native con Expo Bare Workflow (o Prebuild):** Acceso completo a módulos nativos, con la conveniencia de las herramientas de Expo.
3. **Flutter:** Rendimiento nativo superior, pero requiere aprender Dart.
4. **Nativo (Kotlin + Swift):** Máximo rendimiento y acceso a APIs, pero doble codebase.

**Decisión:** Usar **React Native con Expo (Bare Workflow / Prebuild)**.

**Justificación:**
- El equipo ya domina React 19 del frontend web; la curva de aprendizaje de React Native es mínima comparada con Flutter (Dart) o nativo (Kotlin/Swift).
- Expo Prebuild permite "eyectar" selectivamente los módulos nativos que necesitamos (react-native-maps, expo-location con background) sin perder las herramientas de Expo (EAS Build, hot reload, etc.).
- Podemos reutilizar gran parte de la lógica de negocio (API calls, state management, validaciones) del frontend web.
- Flutter fue descartado porque requeriría aprender un lenguaje nuevo (Dart) en un semestre ya ajustado.

**Consecuencias:**
- Se crea un nuevo repositorio separado para la app móvil (ej: `mobile_urbanshield`).
- Se deberá configurar Android Studio y/o Xcode para compilación local.
- react-native-maps requiere configuración de API keys de Google Maps (Android) y Apple Maps (iOS).

---

### ADR-004: AWS Lambda Container Images para el Pipeline de Predicción

**Contexto:** Los modelos de predicción (Prophet, ARIMA) están escritos en Python y sus dependencias (pystan, pandas, numpy, scipy, etc.) pesan en conjunto más de 500MB. Las opciones de despliegue fueron:
1. **Lambda Layer:** Límite de 250MB (descomprimido). Insuficiente.
2. **Lambda Container Image:** Hasta 10GB de imagen. Serverless, paga por uso.
3. **ECS Fargate (contenedor dedicado):** Sin límite de tamaño, pero con costo fijo mínimo (siempre encendido o con mínimo de 1 tarea).
4. **EC2 dedicada con cron:** Máximo control, pero rompe la filosofía serverless.
5. **AWS SageMaker:** Diseñado para ML, pero excesivo para un modelo Prophet simple.

**Decisión:** Usar **AWS Lambda Container Images (Docker en ECR)**.

**Justificación:**
- Mantiene la filosofía 100% serverless: solo pagas cuando el modelo se entrena (una vez al día, ~5-10 minutos).
- Lambda Container Images soporta hasta 10GB, más que suficiente para nuestras dependencias (~800MB).
- Costo estimado: ~$0.10/día (3008MB RAM × 15 min × 30 días = ~$4/mes) vs ~$30-50/mes de ECS Fargate mínimo.
- Se integra nativamente con EventBridge para scheduling.

**Consecuencias:**
- Cold start significativo (~10-30 segundos) para la primera invocación después de un período sin uso. Aceptable porque el modelo se ejecuta en batch nocturno, no en tiempo real.
- Se necesita configurar un repositorio ECR y un pipeline para construir y subir la imagen Docker.
- El timeout de Lambda se configurará al máximo (15 minutos).

---

### ADR-005: Almacenamiento de Predicciones — S3 como Cache Estático

**Contexto:** Las predicciones generadas por los modelos deben estar disponibles para consulta desde el frontend. Las opciones fueron:
1. **DynamoDB:** Almacenar cada predicción como un item.
2. **S3 (JSON estáticos):** Guardar el resultado completo como archivos JSON.
3. **ElastiCache (Redis):** Cache en memoria de ultra-baja latencia.

**Decisión:** Usar **Amazon S3** para almacenar las predicciones como archivos JSON estáticos.

**Justificación:**
- Las predicciones se generan 1 vez al día y se leen muchas veces. S3 es perfecto para este patrón de lectura intensiva.
- No requiere provisionar ni gestionar un cluster de cache (Redis).
- El backend Node.js simplemente lee el JSON de S3 y lo devuelve al frontend, sin transformación pesada.
- Costo despreciable: ~$0.023/GB/mes.
- DynamoDB fue descartado porque las predicciones son documentos jerárquicos complejos (arrays anidados) que se ajustan mejor a un archivo JSON que a items planos de DynamoDB.

---

### ADR-006: Estado del Chat — Máquina de Estados en DynamoDB

**Contexto:** El flujo de creación de reportes por chat requiere mantener el estado de la conversación (en qué paso está el usuario) entre múltiples mensajes.

**Decisión:** Usar una **máquina de estados persistida en DynamoDB** (tabla `ChatSessionsTable`) con TTL automático.

**Justificación:**
- Lambda es stateless; no podemos guardar el estado en memoria entre invocaciones.
- DynamoDB con TTL nos permite limpiar automáticamente sesiones abandonadas (30 minutos de inactividad).
- El modelo de estados es simple (7 estados) y no justifica un servicio como AWS Step Functions.

**Implementación:**
```
Estados: IDLE → ASK_CATEGORY → ASK_DESCRIPTION → ASK_LOCATION → ASK_PHOTO → CONFIRM → DONE | CANCELLED

Transiciones:
- Cada mensaje del usuario dispara una transición.
- El handler lee el estado actual de DynamoDB, procesa la entrada, actualiza el estado, y responde.
- Si el TTL expira, la sesión se elimina automáticamente y el usuario empieza desde IDLE.
```

---

## 2. Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               CLIENTES                    │
│                                       │
│ ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│ │ React Web  │   │ React Native │   │ Admin Web  │       │
│ │ (Ciudadano) │   │ (Ciudadano) │   │ (Autoridad) │       │
│ └──────┬───────┘   └──────┬───────┘   └──────┬───────┘       │
│     │           │           │           │
└─────────┼─────────────────────┼──────────────────────┼──────────────────────┘
     │ HTTPS        │ HTTPS/WSS      │ HTTPS
     ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│             AWS API GATEWAY                   │
│                                       │
│ ┌──────────────────────┐     ┌──────────────────────┐        │
│ │  HTTP API (REST)  │     │ WebSocket API    │        │
│ │  /api/*       │     │ $connect      │        │
│ │           │     │ $disconnect     │        │
│ │           │     │ sendMessage     │        │
│ └──────────┬───────────┘     └──────────┬───────────┘        │
│       │                 │              │
└─────────────┼──────────────────────────────────┼────────────────────────────┘
       │                 │
       ▼                 ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│ Lambda: Backend Node.js │   │ Lambda: Chat Handler  │
│ (serverless-http/Express)│   │ (Node.js)        │
│             │   │ - $connect       │
│ Endpoints:       │   │ - $disconnect      │
│ - /api/auth/*      │   │ - handleMessage     │
│ - /api/reports/*    │   │ - detectIntent     │
│ - /api/admin/*     │   │ - stateMachine     │
│ - /api/admin/faqs/*   │   │             │
│ - /api/admin/predictions│   │             │
│ - /api/users/*     │   │             │
└────────────┬─────────────┘   └────────────┬─────────────┘
       │                 │
  ┌────────┼────────────────────────┬─────────┼───────────┐
  │    │            │     │      │
  ▼    ▼            ▼     ▼      ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│DynamoDB│ │ S3  │ │Cognito │ │ SNS  │ │Location│ │ ECR  │
│    │ │    │ │    │ │    │ │Service │ │    │
│Tables: │ │Buckets:│ │User  │ │Topics: │ │Geocode │ │Images: │
│-Users │ │-Photos │ │Pool  │ │-Alerts │ │Reverse │ │-predict│
│-Reports│ │-Predict│ │    │ │-Errors │ │    │ │    │
│-Notif │ │    │ │    │ │    │ │    │ │    │
│-WS Conn│ │    │ │    │ │    │ │    │ │    │
│-ChatSes│ │    │ │    │ │    │ │    │ │    │
│-ChatFaq│ │    │ │    │ │    │ │    │ │    │
└────────┘ └───┬────┘ └────────┘ └────────┘ └────────┘ └───┬────┘
        │                      │
        │      ┌────────────────────┐      │
        │      │ Amazon EventBridge │      │
        │      │ (Cron: 3AM diario) │      │
        │      └─────────┬──────────┘      │
        │           │ Invoca        │
        │           ▼            │
        │ ┌──────────────────────────────────────┐ │
        │ │ Lambda Container Image (Python 3.11) │ │
        │ │                   │◄─┘
        │ │ - Prophet model training       │
        │ │ - ARIMA/SARIMA training        │
        │ │ - Metrics evaluation         │
        │ │ - Prediction generation        │
        │ │                   │
        │ └───────────────┬──────────────────────┘
        │         │ Escribe resultados
        └──────────────────┘
```

---

## 3. Estructura de Carpetas Propuesta

### 3.1 Backend (`backend_urbanshield`) — Cambios

```
backend_urbanshield/
├── src/
│  ├── routes/
│  │  ├── admin/
│  │  │  ├── faqs.js      # [NUEVO] CRUD de FAQs
│  │  │  └── predictions.js  # [NUEVO] Consulta de predicciones desde S3
│  │  └── users/
│  │    └── pushToken.js   # [NUEVO] Registro de push tokens
│  ├── websocket/        # [NUEVO] Todo el módulo de WebSocket
│  │  ├── connect.js      # Handler de $connect
│  │  ├── disconnect.js     # Handler de $disconnect
│  │  ├── handleMessage.js   # Handler principal de mensajes
│  │  ├── intentDetector.js   # Detección de intenciones (regex)
│  │  ├── stateMachine.js    # Máquina de estados del reporte
│  │  ├── handlers/
│  │  │  ├── faqHandler.js   # Procesador de intent_faq
│  │  │  ├── statusHandler.js # Procesador de intent_status
│  │  │  ├── createHandler.js # Procesador de intent_create
│  │  │  ├── greetingHandler.js# Procesador de intent_greeting
│  │  │  └── helpHandler.js  # Procesador de intent_help
│  │  └── utils/
│  │    └── wsResponse.js   # Utilidad para enviar respuestas WS
│  └── ...
├── serverless.yml        # [MODIFICAR] Agregar WebSocket API + nuevas Lambdas + tablas
└── ...
```

### 3.2 Predicciones (nuevo directorio en el backend o repositorio separado)

```
prediction-service/
├── Dockerfile          # Imagen para Lambda Container
├── requirements.txt       # Dependencias Python
├── src/
│  ├── handler.py        # Entry point de Lambda
│  ├── pipeline/
│  │  ├── extract.py      # Extracción de datos de DynamoDB
│  │  ├── transform.py     # Transformación y agregación
│  │  └── load.py        # Escritura de resultados a S3
│  ├── models/
│  │  ├── prophet_model.py   # Entrenamiento y predicción con Prophet
│  │  ├── arima_model.py    # Entrenamiento y predicción con ARIMA
│  │  └── evaluator.py     # Cálculo de métricas comparativas
│  ├── generators/
│  │  └── synthetic_data.py   # Generación de datos sintéticos
│  └── config/
│    ├── zones.json      # Configuración de zonas geográficas
│    └── model_config.yaml   # Hiperparámetros de los modelos
├── tests/
│  ├── test_pipeline.py
│  ├── test_prophet.py
│  └── test_arima.py
└── scripts/
  ├── build_and_push.sh     # Script para build Docker + push a ECR
  └── generate_test_data.py   # Script local para generar datos de prueba
```

### 3.3 Frontend (`frontend_urbanshield`) — Cambios

```
frontend_urbanshield/
├── src/
│  ├── components/
│  │  ├── chat/         # [NUEVO] Componentes del chatbot
│  │  │  ├── ChatWidget.jsx  # Widget flotante principal
│  │  │  ├── ChatWindow.jsx  # Ventana del chat expandida
│  │  │  ├── ChatMessage.jsx  # Burbuja de mensaje individual
│  │  │  ├── ChatInput.jsx   # Input de texto del chat
│  │  │  └── ChatTyping.jsx  # Indicador de "escribiendo..."
│  │  └── predictions/     # [NUEVO] Componentes de predicciones
│  │    ├── PredictionChart.jsx  # Gráfica de series de tiempo
│  │    ├── SeasonalityChart.jsx  # Gráfica de componentes estacionales
│  │    ├── HeatmapLayer.jsx    # Capa de mapa de calor
│  │    ├── ModelComparisonTable.jsx# Tabla comparativa de modelos
│  │    └── PredictionKPIs.jsx   # Tarjetas de KPIs
│  ├── hooks/
│  │  └── useWebSocket.js    # [NUEVO] Custom hook para WebSocket
│  ├── services/
│  │  ├── chatService.js    # [NUEVO] Lógica de comunicación del chat
│  │  └── predictionService.js # [NUEVO] Llamadas al API de predicciones
│  └── pages/
│    └── admin/
│      └── PredictionsPage.jsx # [NUEVO] Página de predicciones
└── ...
```

### 3.4 App Móvil (nuevo repositorio)

```
mobile_urbanshield/
├── app.json           # Configuración de Expo
├── App.tsx            # Entry point
├── src/
│  ├── navigation/
│  │  ├── AuthStack.tsx
│  │  ├── MainTabs.tsx
│  │  └── RootNavigator.tsx
│  ├── screens/
│  │  ├── auth/
│  │  │  ├── SplashScreen.tsx
│  │  │  ├── LoginScreen.tsx
│  │  │  └── RegisterScreen.tsx
│  │  ├── home/
│  │  │  └── HomeScreen.tsx
│  │  ├── reports/
│  │  │  ├── MyReportsScreen.tsx
│  │  │  ├── CreateReportScreen.tsx
│  │  │  └── ReportDetailScreen.tsx
│  │  ├── chat/
│  │  │  └── ChatScreen.tsx
│  │  └── profile/
│  │    └── ProfileScreen.tsx
│  ├── components/
│  │  ├── MapView.tsx
│  │  ├── ReportCard.tsx
│  │  ├── ChatBubble.tsx
│  │  └── CategoryPicker.tsx
│  ├── services/
│  │  ├── api.ts
│  │  ├── auth.ts
│  │  ├── websocket.ts
│  │  └── storage.ts
│  ├── store/
│  │  ├── authStore.ts
│  │  ├── reportsStore.ts
│  │  └── chatStore.ts
│  └── utils/
│    ├── constants.ts
│    └── helpers.ts
├── assets/
├── package.json
└── tsconfig.json
```

---

## 4. Riesgos Técnicos y Mitigaciones

| # | Riesgo | Probabilidad | Impacto | Estrategia de Mitigación |
|---|---|:---:|:---:|---|
| R1 | Cold start de Lambda Container Image (Python) tarda >30s | Alta | Bajo | El modelo se ejecuta en batch nocturno (EventBridge cron). El usuario nunca espera al modelo. Las predicciones se leen de S3. |
| R2 | WebSocket timeout de API Gateway tras 10 min inactivos | Alta | Medio | Implementar ping/pong keepalive cada 5 min desde el cliente; reconexión automática con backoff exponencial. |
| R3 | Datos históricos insuficientes (<90 días) para Prophet | Media | Alto | Generar dataset sintético realista (365 días) con distribuciones estadísticas que emulan patrones urbanos reales. Documentar claramente que son sintéticos. |
| R4 | Tamaño de imagen Docker excede expectativas (>2GB) | Media | Medio | Usar imagen base `python:3.11-slim` en vez de `public.ecr.aws/lambda/python`; instalar solo las dependencias estrictamente necesarias; usar multi-stage build. |
| R5 | react-native-maps requiere configuración compleja de API keys | Media | Bajo | Documentar el proceso paso a paso; usar Expo Prebuild que facilita la inyección de API keys en `app.json`. |
| R6 | Rate limiting no implementado en WebSocket permite abuso | Baja | Alto | Implementar contador de mensajes por minuto por `connectionId` en DynamoDB; desconectar al cliente si excede 30 msg/min. |
| R7 | Cognito token validation falla silenciosamente en $connect | Baja | Crítico | Implementar validación explícita del JWT con la librería `jsonwebtoken` y las claves públicas de Cognito JWKS. Registrar errores en CloudWatch. |

---

## 5. Consideraciones de Seguridad

1. **Autenticación en WebSocket:** El token JWT se valida en `$connect`. No se aceptan conexiones sin token válido. Las funciones de mensajes (`handleMessage`) confían en que la conexión ya fue autenticada (el `connectionId` existe en `WebSocketConnectionsTable` con un `userId` válido).
2. **Aislamiento de datos:** Un usuario solo puede consultar el estado de sus propios reportes. El handler de `intent_status` verifica que el `userId` del reporte coincida con el `userId` de la conexión.
3. **Sanitización de input:** Todos los mensajes del chat se sanitizan antes de procesarlos (strip HTML, limitar longitud a 500 caracteres, escapar caracteres especiales).
4. **Pre-signed URLs:** Las fotos subidas desde la app móvil usan pre-signed URLs con expiración de 5 minutos y tamaño máximo de 5MB.
5. **Secretos:** Todas las API keys, tokens y credenciales se almacenan en AWS Systems Manager Parameter Store (SSM), nunca en variables de entorno del código fuente.

