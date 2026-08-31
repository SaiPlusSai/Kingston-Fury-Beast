# Arquitectura Inicial del Proyecto HALO (Urban Shield)

Este documento detalla la estructura base del sistema y los componentes actuales con los que el equipo debe integrarse y trabajar para continuar con la fase de expansión (Chatbot, App Móvil y Predicción de Hotspots).

---

## 1. Repositorios del Proyecto

### 1.1 Frontend Web (React 19 + Vite)
- **Repositorio:** [chriscc27/frontend_urbanshield](https://github.com/chriscc27/frontend_urbanshield)
- **Pila Tecnológica:**
  - React 19 (SPA — Single Page Application)
  - Vite como bundler y dev server
  - React Router para navegación
  - TailwindCSS para estilos utility-first
  - MapLibre GL JS para mapas interactivos con marcadores y clusters
  - Recharts para gráficas y analíticas en el dashboard
  - Axios para peticiones HTTP al backend
  - Context API / hooks para gestión de estado
- **Alojamiento:** Bucket estático de Amazon S3 expuesto mundialmente mediante Amazon CloudFront (CDN).
- **Estructura Principal de Vistas:**
  - **Vistas del Ciudadano:** Dashboard con radar/mapa de incidentes, formulario de creación de reportes, lista de "Mis Reportes", detalle de reporte con timeline de actividades, panel de notificaciones.
  - **Vistas del Administrador:** Dashboard analítico con KPIs y gráficas (Recharts), bandeja de soporte/tickets, gestión de reportes con tablero Kanban, mapa general de incidentes con filtros avanzados.

### 1.2 Backend Serverless (Node.js + AWS Lambda)
- **Repositorio:** [chriscc27/backend_urbanshield](https://github.com/chriscc27/backend_urbanshield)
- **Pila Tecnológica:**
  - Node.js con Express envuelto en `serverless-http` (patrón Monolito Serverless — toda la API REST vive en una única función Lambda)
  - AWS SDK v3 para interacción con servicios de AWS
  - Serverless Framework para Infrastructure as Code (IaC) — `serverless.yml`
  - JWT para autenticación con validación contra Cognito
- **Servicios AWS Utilizados:**

  | Servicio | Uso en HALO |
  |---|---|
  | **AWS Lambda** | Ejecución del backend (función principal `api`) |
  | **API Gateway V2 (HTTP API)** | Puerta de enlace que recibe todas las peticiones REST y las envía a Lambda |
  | **Amazon DynamoDB** | Base de datos NoSQL principal |
  | **Amazon S3** | Almacenamiento de evidencias fotográficas (upload directo via pre-signed URLs) |
  | **Amazon Cognito** | Pool de usuarios para autenticación y autorización |
  | **Amazon SNS** | Envío de alertas críticas (push/email/SMS) |
  | **Amazon Location Service** | Geocodificación inversa (coordenadas → dirección), marcadores en mapa |
  | **AWS Systems Manager (SSM)** | Almacenamiento de secretos y variables de configuración |
  | **Amazon CloudWatch** | Logs, métricas y alarmas |

- **Tablas de DynamoDB Existentes:**

  | Tabla | PK | SK/GSI | Descripción |
  |---|---|---|---|
  | `UsersTable` | `userId` | GSI: `email` | Información de los usuarios (ciudadanos y admins) |
  | `ReportsTable` | `reportId` | GSI: `userId`, `status`, `createdAt` | Reportes de incidentes urbanos |
  | `NotificationsTable` | `notificationId` | GSI: `userId` | Notificaciones para los usuarios |
  | `ActivityLogsTable` | `logId` | GSI: `reportId` | Timeline de actividades por reporte |
  | `SupportMessagesTable` | `messageId` | GSI: `ticketId` | Mensajes del sistema de soporte/tickets |

- **Endpoints API REST Principales:**

  | Método | Endpoint | Descripción |
  |---|---|---|
  | `POST` | `/api/auth/register` | Registro de usuario (Cognito + DynamoDB) |
  | `POST` | `/api/auth/login` | Autenticación y emisión de tokens JWT |
  | `POST` | `/api/auth/refresh` | Renovación de token de acceso |
  | `GET` | `/api/reports` | Listar reportes (con filtros: status, category, geo) |
  | `GET` | `/api/reports/user` | Reportes del usuario autenticado |
  | `GET` | `/api/reports/:id` | Detalle de un reporte específico |
  | `POST` | `/api/reports` | Crear nuevo reporte de incidente |
  | `PUT` | `/api/reports/:id` | Actualizar reporte |
  | `PUT` | `/api/reports/:id/status` | Cambiar estado del reporte (admin) |
  | `GET` | `/api/uploads/presigned-url` | Obtener URL pre-firmada para subir foto a S3 |
  | `GET` | `/api/notifications` | Listar notificaciones del usuario |
  | `GET` | `/api/admin/dashboard` | Métricas y KPIs del dashboard de admin |

---

## 2. Diagrama de Arquitectura Actual

```
                    ┌────────────────────┐
                    │   Amazon CloudFront │
                    │   (CDN Global)      │
                    └─────────┬──────────┘
                              │ Sirve assets estáticos
                              ▼
                    ┌────────────────────┐
                    │   Amazon S3        │
                    │   (Frontend Web)   │
                    │   React 19 + Vite  │
                    └─────────┬──────────┘
                              │
                    Usuarios Web (Navegador)
                              │
                              │ HTTPS (REST API)
                              ▼
                    ┌────────────────────┐
                    │  AWS API Gateway   │
                    │  HTTP API V2       │
                    │  /api/*            │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │   AWS Lambda       │
                    │   Node.js/Express  │
                    │   (serverless-http)│
                    └────┬────┬────┬─────┘
                         │    │    │
              ┌──────────┘    │    └──────────┐
              ▼               ▼               ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │   DynamoDB   │ │   Amazon S3  │ │   Cognito    │
     │              │ │   (Fotos)    │ │   (Auth)     │
     │  5 Tablas    │ │              │ │              │
     └──────────────┘ └──────────────┘ └──────────────┘
              │
     ┌────────┼────────┐
     ▼        ▼        ▼
  ┌──────┐ ┌──────┐ ┌──────────┐
  │ SNS  │ │ SSM  │ │ Location │
  │      │ │      │ │ Service  │
  └──────┘ └──────┘ └──────────┘
```

---

## 3. Evolución de la Arquitectura (Fase de Expansión v2)

La expansión suma las siguientes piezas clave, manteniendo la filosofía **100% serverless** en AWS:

### 3.1 WebSockets para el Chatbot
- **Componente:** API Gateway WebSocket API (separado del HTTP API existente).
- **Funciones Lambda nuevas:** `chatConnect`, `chatDisconnect`, `chatHandleMessage`.
- **Tablas DynamoDB nuevas:** `WebSocketConnectionsTable`, `ChatSessionsTable`, `ChatFaqsTable`.
- **Integración:** El handler de mensajes interactúa directamente con las tablas existentes (`ReportsTable`, `UsersTable`, `ActivityLogsTable`) para responder consultas y crear reportes.

### 3.2 Predicción de Hotspots (Python + Prophet)
- **Componente:** AWS Lambda Container Image (Docker en ECR) con Python 3.11 + Prophet + ARIMA.
- **Scheduling:** Amazon EventBridge (cron diario a las 03:00 AM).
- **Almacenamiento de resultados:** Amazon S3 (JSON estáticos con predicciones y métricas).
- **Consulta:** Los endpoints REST del backend Node.js leen los JSON de S3 y los sirven al frontend.
- **Visualización:** Nuevos componentes React (Recharts + MapLibre GL JS heatmap) en el Dashboard de Administrador.

### 3.3 Aplicación Móvil (React Native)
- **Componente:** Nuevo proyecto React Native con Expo (Bare Workflow).
- **Conexión:** Consume exactamente la misma API REST de API Gateway + el WebSocket API del chatbot.
- **Capacidades nativas:** GPS de alta precisión, cámara, notificaciones push (FCM/APNs via SNS o Expo Notifications), almacenamiento seguro de tokens.

### 3.4 Diagrama de Arquitectura Expandida

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                                  CLIENTES                                       │
│                                                                                 │
│   ┌───────────────┐    ┌───────────────┐    ┌───────────────┐                  │
│   │  React Web    │    │ React Native  │    │  Admin Web    │                  │
│   │  (Ciudadano)  │    │  (Ciudadano)  │    │  (Autoridad)  │                  │
│   │  + ChatWidget │    │  + ChatScreen │    │  + Predicciones│                 │
│   └───────┬───────┘    └───────┬───────┘    └───────┬───────┘                  │
│           │                    │                     │                          │
└───────────┼────────────────────┼─────────────────────┼──────────────────────────┘
            │ HTTPS              │ HTTPS/WSS           │ HTTPS
            ▼                    ▼                     ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                           AWS API GATEWAY                                       │
│   ┌─────────────────────┐              ┌─────────────────────┐                 │
│   │   HTTP API V2       │              │  WebSocket API      │                 │
│   │   /api/* (REST)     │              │  (Chat en vivo)     │                 │
│   └──────────┬──────────┘              └──────────┬──────────┘                 │
└──────────────┼─────────────────────────────────────┼───────────────────────────┘
               │                                     │
               ▼                                     ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│ Lambda: Backend Node.js │         │  Lambda: Chat Handlers  │
│ (Monolito Serverless)   │         │  (Node.js)              │
│                         │         │  connect/disconnect/    │
│ + /api/admin/predictions│         │  handleMessage          │
│ + /api/admin/faqs       │         │  intentDetector         │
│ + /api/users/push-token │         │  stateMachine           │
└────────────┬────────────┘         └────────────┬────────────┘
             │                                    │
    ┌────────┼────────────────────────────────────┼──────────┐
    │        │                                    │          │
    ▼        ▼                                    ▼          ▼
┌────────┐┌────────┐┌────────┐┌────────┐┌───────────────┐┌────────┐
│DynamoDB││  S3    ││Cognito ││  SNS   ││   Location    ││  ECR   │
│        ││        ││        ││        ││   Service     ││        │
│8 Tablas││2 Bucket││User    ││Alertas ││  Geocode      ││Docker  │
│(+3 new)││(+1 new)││Pool    ││        ││               ││Images  │
└────────┘└───┬────┘└────────┘└────────┘└───────────────┘└───┬────┘
              │                                               │
              │        ┌─────────────────────┐                │
              │        │  Amazon EventBridge  │                │
              │        │  Cron: 03:00 AM      │                │
              │        └──────────┬──────────┘                │
              │                   │                            │
              │                   ▼                            │
              │  ┌────────────────────────────────────────┐   │
              │  │  Lambda Container Image (Python 3.11)  │◄──┘
              │  │  Prophet + ARIMA + pandas + numpy       │
              │  │  Entrenamiento batch diario             │
              │  └──────────────────┬─────────────────────┘
              │                     │ Escribe predicciones
              └─────────────────────┘ (JSON a S3)
```

---

## 4. Cómo Empezar a Trabajar

1. **Clonar los repositorios:**
   ```bash
   git clone https://github.com/chriscc27/frontend_urbanshield.git
   git clone https://github.com/chriscc27/backend_urbanshield.git
   ```

2. **Instalar dependencias:**
   ```bash
   cd frontend_urbanshield && npm install
   cd ../backend_urbanshield && npm install
   ```

3. **Ejecutar localmente:**
   ```bash
   # Frontend
   cd frontend_urbanshield && npm run dev
   
   # Backend (requiere serverless-offline)
   cd backend_urbanshield && npx serverless offline
   ```

4. **Consultar las specs y tareas:**
   - Specs del chatbot: `openspec/changes/halo-v2-expansion/specs/chatbot/spec.md`
   - Specs del móvil: `openspec/changes/halo-v2-expansion/specs/mobile-app/spec.md`
   - Specs de predicciones: `openspec/changes/halo-v2-expansion/specs/predictions/spec.md`
   - Lista de tareas: `openspec/changes/halo-v2-expansion/tasks.md`

5. **Registrar progreso en:** `docs/project_context.md`
