---
name: architecture-c4-validator
description: Validates system changes against HALO's C4 architecture model (Context, Container, Component, Code) and formal Architecture Decision Records (ADRs). Use when designing new features, adding AWS services, or modifying service boundaries.
---

# Architecture & C4 Validator — HALO (Urban Shield)

This skill guides the agent and developers in verifying that any architectural modification conforms to HALO v2 design principles, C4 diagrams, and formal ADRs.

## Architectural Baseline

1. **C4 Model Reference**:
   - Level 1 (Context): [docs/Arquitectura y Seguridad/C4/Nivel 1 - Contexto/](file:///c:/Users/Viviana/Documents/GitHub/Kingston-Fury-Beast-/docs/Arquitectura%20y%20Seguridad/C4/Nivel%201%20-%20Contexto/)
   - Level 2 (Container): [docs/Arquitectura y Seguridad/C4/Nivel 2 - Contenedor/](file:///c:/Users/Viviana/Documents/GitHub/Kingston-Fury-Beast-/docs/Arquitectura%20y%20Seguridad/C4/Nivel%202%20-%20Contenedor/)
   - Level 3 (Component): [docs/Arquitectura y Seguridad/C4/Nivel 3 - Componente/](file:///c:/Users/Viviana/Documents/GitHub/Kingston-Fury-Beast-/docs/Arquitectura%20y%20Seguridad/C4/Nivel%203%20-%20Componente/)
   - Level 4 (Code): [docs/Arquitectura y Seguridad/C4/Nivel 4 - Codigo/](file:///c:/Users/Viviana/Documents/GitHub/Kingston-Fury-Beast-/docs/Arquitectura%20y%20Seguridad/C4/Nivel%204%20-%20Codigo/)

2. **Core ADRs (Architecture Decision Records)** in `docs/Arquitectura y Seguridad/ADR/`:
   - `ADR-001`: Monolito Serverless en AWS Lambda con Express y `serverless-http`.
   - `ADR-002`: Chatbot con API Gateway WebSocket + Intent Detection basada en Regex/FSM.
   - `ADR-003`: Persistencia en Amazon DynamoDB con modelo de tablas dedicadas.
   - `ADR-004`: Autenticación delegada en Amazon Cognito con tokens JWT.
   - `ADR-005`: Almacenamiento de evidencias en S3 vía pre-signed URLs directas.
   - `ADR-006`: Notificaciones críticas ciudadanas vía Amazon SNS.
   - `ADR-007`: Predicción de hotspots con Prophet y ARIMA/SARIMA en Lambda Container Image (ECR).
   - `ADR-008`: Frontend Web desacoplado en React 19 + MapLibre GL JS + S3/CloudFront.
   - `ADR-009`: App Móvil ciudadana en React Native (Expo Bare Workflow).
   - `ADR-010`: Emulación local de nube mediante LocalStack para pruebas sin coste AWS.

## Validation Checklist

When reviewing or proposing code changes:

- [ ] **Monolith Pattern**: Is new backend functionality added as an Express route/controller within `backend/src/` rather than creating independent Lambda microservices, unless explicitly specified in ADRs (such as WebSocket handlers or Container Image)?
- [ ] **Data Model Consistency**: Are new attributes or tables documented in `docs/Arquitectura y Seguridad/` and reflected in `serverless.yml` resources?
- [ ] **Decoupled Client Communication**: Does the frontend communicate strictly via API Gateway HTTP API or WebSocket API without direct DynamoDB SDK access?
- [ ] **ADR Alignment**: If a change deviates from an existing ADR, propose a new ADR draft in `docs/Arquitectura y Seguridad/ADR/` rather than modifying code silently.
