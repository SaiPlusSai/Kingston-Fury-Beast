# Serverless Framework IaC Configuration (urbanshield-backend)

> 17 nodes

## Key Concepts

- **Serverless Framework IaC Configuration (urbanshield-backend)** (9 connections) — `backend/serverless.yml`
- **lambda.js** (8 connections) — `backend/src/lambda.js`
- **Tablas DynamoDB (Users, Reports, Notifications, ActivityLogs, SupportMessages)** (8 connections) — `backend/serverless.yml`
- **ADR-001: Arquitectura General Serverless y Event-Driven en AWS** (5 connections) — `docs/Arquitectura y Seguridad/ADR/ADR-001-Arquitectura-General-Serverless-Event-Driven.md`
- **Amazon Location Service (UrbanShieldMap & UrbanShieldPlaceIndex)** (4 connections) — `backend/serverless.yml`
- **Amazon SNS EmergencyAlertsTopic para Alertas Ciudadanas** (4 connections) — `backend/serverless.yml`
- **Modulo Chatbot Conversacional en Tiempo Real (WebSocket + FSM)** (4 connections) — `docs/Arquitectura y Seguridad/ADR/ADR-003-Canal-Tiempo-Real-Chatbot-API-Gateway-WebSockets.md`
- **Arquitectura Inicial del Proyecto HALO (UrbanShield)** (3 connections) — `docs/arquitectura_inicial.md`
- **Diagrama C4 Nivel 2: Contenedores Cloud AWS y Clientes** (3 connections) — `docs/Arquitectura y Seguridad/C4/C4-02-Contenedores.png`
- **ADR-002: Backend Monolito Serverless (Lambdalith) con Express** (3 connections) — `docs/Arquitectura y Seguridad/ADR/ADR-002-Backend-Monolito-Serverless-Express.md`
- **ADR-003: Canal Tiempo Real para Chatbot via API Gateway WebSockets** (3 connections) — `docs/Arquitectura y Seguridad/ADR/ADR-003-Canal-Tiempo-Real-Chatbot-API-Gateway-WebSockets.md`
- **serverless-http** (2 connections) — `backend/package.json`
- **Amazon Cognito User Pool & JWT Verification** (2 connections) — `backend/serverless.yml`
- **ADR-004: Motor NLP del Chatbot mediante Regex y Maquina de Estados** (2 connections) — `docs/Arquitectura y Seguridad/ADR/ADR-004-Motor-NLP-Chatbot-Regex-Maquina-Estados.md`
- **app** (1 connections) — `backend/src/lambda.js`
- **serverless** (1 connections) — `backend/src/lambda.js`
- **Diagrama C4 Nivel 3: Componentes del Chatbot WebSocket** (1 connections) — `docs/Arquitectura y Seguridad/C4/Componentes/C4-03-02-Componentes-Chatbot.png`

## Relationships

- [app.js](app.js.md) (3 shared connections)
- [AppError.js](AppError.js.md) (2 shared connections)
- [s3.service.js](s3.service.js.md) (2 shared connections)
- [HALO v2 (UrbanShield) Master Overview & Governance](HALO_v2_UrbanShield_Master_Overview_&_Governance.md) (2 shared connections)
- [NotificationsPage.jsx](NotificationsPage.jsx.md) (2 shared connections)
- [backend/package.json](backend-package.json.md) (1 shared connections)
- [admin.service.js](admin.service.js.md) (1 shared connections)
- [report.service.js](report.service.js.md) (1 shared connections)
- [aws/location.service.js](aws-location.service.js.md) (1 shared connections)
- [services/location.service.js](services-location.service.js.md) (1 shared connections)
- [CitizenDashboard.jsx](CitizenDashboard.jsx.md) (1 shared connections)
- [sns.service.js](sns.service.js.md) (1 shared connections)

## Source Files

- `backend/package.json`
- `backend/serverless.yml`
- `backend/src/lambda.js`
- `docs/Arquitectura y Seguridad/ADR/ADR-001-Arquitectura-General-Serverless-Event-Driven.md`
- `docs/Arquitectura y Seguridad/ADR/ADR-002-Backend-Monolito-Serverless-Express.md`
- `docs/Arquitectura y Seguridad/ADR/ADR-003-Canal-Tiempo-Real-Chatbot-API-Gateway-WebSockets.md`
- `docs/Arquitectura y Seguridad/ADR/ADR-004-Motor-NLP-Chatbot-Regex-Maquina-Estados.md`
- `docs/Arquitectura y Seguridad/C4/C4-02-Contenedores.png`
- `docs/Arquitectura y Seguridad/C4/Componentes/C4-03-02-Componentes-Chatbot.png`
- `docs/arquitectura_inicial.md`

## Audit Trail

- EXTRACTED: 39 (95%)
- INFERRED: 2 (5%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*