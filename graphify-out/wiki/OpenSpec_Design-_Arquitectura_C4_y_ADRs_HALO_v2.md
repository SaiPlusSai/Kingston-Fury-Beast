# OpenSpec Design: Arquitectura C4 y ADRs HALO v2

> 20 nodes

## Key Concepts

- **OpenSpec Design: Arquitectura C4 y ADRs HALO v2** (9 connections) — `openspec/changes/halo-v2-expansion/design.md`
- **OpenSpec Spec: Aplicacion Movil Nativa (React Native)** (8 connections) — `openspec/changes/halo-v2-expansion/specs/mobile-app/spec.md`
- **OpenSpec Spec: Prediccion de Hotspots (Prophet / ARIMA)** (7 connections) — `openspec/changes/halo-v2-expansion/specs/predictions/spec.md`
- **Flujo Conversacional de Creacion de Reporte (7 Estados)** (6 connections) — `openspec/changes/halo-v2-expansion/specs/chatbot/spec.md`
- **OpenSpec Spec: Chatbot Interactivo en Tiempo Real** (6 connections) — `openspec/changes/halo-v2-expansion/specs/chatbot/spec.md`
- **Prophet Time Series Model (Meta)** (4 connections) — `openspec/changes/halo-v2-expansion/specs/predictions/spec.md`
- **OpenSpec Proposal: Expansion HALO v2** (4 connections) — `openspec/changes/halo-v2-expansion/proposal.md`
- **Notificaciones Proactivas WebSocket por Cambio de Estado** (3 connections) — `openspec/changes/halo-v2-expansion/specs/chatbot/spec.md`
- **ADR-006: Maquina de Estados del Chat en DynamoDB con TTL** (3 connections) — `openspec/changes/halo-v2-expansion/design.md`
- **Umbral Objetivo Prophet (RMSE <= 0.829, +20% Mejora)** (3 connections) — `prediction-service/output/baseline_comparison.json`
- **Motor NLP de Intenciones (greeting, help, faq, status, create)** (2 connections) — `openspec/changes/halo-v2-expansion/specs/chatbot/spec.md`
- **Capacidades Nativas Moviles (GPS, Camara, SecureStore, Push)** (2 connections) — `openspec/changes/halo-v2-expansion/specs/mobile-app/spec.md`
- **Modo Offline de Borradores en AsyncStorage + NetInfo Sync** (2 connections) — `openspec/changes/halo-v2-expansion/specs/mobile-app/spec.md`
- **BL-3 Media Estacional Semanal (Mejor Baseline, RMSE 1.036)** (2 connections) — `prediction-service/notebooks/02_baseline.ipynb`
- **OpenSpec Tasks: Plan de Implementacion HALO v2** (2 connections) — `openspec/changes/halo-v2-expansion/tasks.md`
- **ADR-001: AWS API Gateway WebSocket API para Chatbot** (2 connections) — `openspec/changes/halo-v2-expansion/design.md`
- **ADR-002: Deteccion de Intenciones NLP con Regex + Keywords** (2 connections) — `openspec/changes/halo-v2-expansion/design.md`
- **ADR-003: React Native con Expo Bare Workflow / Prebuild** (2 connections) — `openspec/changes/halo-v2-expansion/design.md`
- **ADR-004: AWS Lambda Container Images (Docker ECR) para ML** (2 connections) — `openspec/changes/halo-v2-expansion/design.md`
- **ADR-005: Almacenamiento de Predicciones en S3 como Cache JSON** (2 connections) — `openspec/changes/halo-v2-expansion/design.md`

## Relationships

- [report.service.js](report.service.js.md) (4 shared connections)
- [s3.service.js](s3.service.js.md) (4 shared connections)
- [02_baseline.ipynb (Evaluacion de Baselines y ARIMA)](02_baseline.ipynb_Evaluacion_de_Baselines_y_ARIMA.md) (3 shared connections)
- [generate_synthetic_data.py](generate_synthetic_data.py.md) (3 shared connections)
- [sendSuccess](sendSuccess.md) (2 shared connections)
- [CreateReport.jsx](CreateReport.jsx.md) (2 shared connections)
- [CitizenDashboard.jsx](CitizenDashboard.jsx.md) (2 shared connections)
- [AppError.js](AppError.js.md) (2 shared connections)
- [admin.service.js](admin.service.js.md) (1 shared connections)
- [HALO v2 (UrbanShield) Master Overview & Governance](HALO_v2_UrbanShield_Master_Overview_&_Governance.md) (1 shared connections)
- [Card](Card.md) (1 shared connections)

## Source Files

- `openspec/changes/halo-v2-expansion/design.md`
- `openspec/changes/halo-v2-expansion/proposal.md`
- `openspec/changes/halo-v2-expansion/specs/chatbot/spec.md`
- `openspec/changes/halo-v2-expansion/specs/mobile-app/spec.md`
- `openspec/changes/halo-v2-expansion/specs/predictions/spec.md`
- `openspec/changes/halo-v2-expansion/tasks.md`
- `prediction-service/notebooks/02_baseline.ipynb`
- `prediction-service/output/baseline_comparison.json`

## Audit Trail

- EXTRACTED: 47 (96%)
- INFERRED: 2 (4%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*