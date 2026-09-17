# Contexto y Estado del Proyecto HALO (Registro de Cambios)

> **️ IMPORTANTE:** Este documento es el registro vivo del proyecto HALO. **Todos los desarrolladores y agentes IA** deben:
> 1. **Consultarlo** antes de iniciar cualquier tarea para entender el estado actual.
> 2. **Actualizarlo** después de cada implementación significativa.
> 3. Registrar decisiones técnicas, cambios de alcance y lecciones aprendidas.

---

## Estado General

| Componente | Estado | Progreso |
|---|---|---|
| Chatbot Backend (WebSocket + Handlers) | No iniciado | 0% |
| Chatbot Frontend (Widget + UI) | No iniciado | 0% |
| Predicción (Pipeline Python + Prophet/ARIMA) | No iniciado | 0% |
| Predicción (Dashboard de Visualización) | No iniciado | 0% |
| App Móvil (React Native) | No iniciado | 0% |
| Testing e Integración | No iniciado | 0% |

---

## Repositorios del Proyecto

| Repositorio | URL | Descripción |
|---|---|---|
| Frontend Web | [chriscc27/frontend_urbanshield](https://github.com/chriscc27/frontend_urbanshield) | React 19 + Vite + MapLibre + TailwindCSS |
| Backend Serverless | [chriscc27/backend_urbanshield](https://github.com/chriscc27/backend_urbanshield) | Node.js + Express + Lambda + DynamoDB |
| App Móvil | *Por crear* | React Native + Expo (Bare Workflow) |
| Documentación & Specs | Este repositorio (Kingston-Fury-Beast-) | OpenSpec, docs, prompts |

---

## Documentación de Referencia

| Documento | Ubicación | Descripción |
|---|---|---|
| Arquitectura Inicial | `docs/arquitectura_inicial.md` | Stack completo, servicios AWS, tablas DynamoDB, endpoints existentes |
| Spec del Chatbot | `openspec/changes/halo-v2-expansion/specs/chatbot/spec.md` | Requisitos funcionales/no funcionales, API contracts, modelos de datos |
| Spec de la App Móvil | `openspec/changes/halo-v2-expansion/specs/mobile-app/spec.md` | Todas las pantallas, navegación, capacidades nativas |
| Spec de Predicciones | `openspec/changes/halo-v2-expansion/specs/predictions/spec.md` | Pipeline de datos, modelos Prophet/ARIMA, Docker, visualizaciones |
| Diseño Técnico | `openspec/changes/halo-v2-expansion/design.md` | ADRs, diagramas de arquitectura, estructura de carpetas |
| Tareas de Implementación | `openspec/changes/halo-v2-expansion/tasks.md` | 40+ tareas en 7 fases con criterios de verificación |
| Prompts para Agentes | `docs/primer_prompt.md` | 6 prompts pre-escritos para guiar el desarrollo con IA |

---

## Decisiones Arquitectónicas Registradas

| ID | Decisión | Justificación | Fecha |
|---|---|---|---|
| ADR-001 | WebSocket API Gateway para el chatbot | 100% serverless, soporta bidireccional, se integra con Lambda | 31/08/2026 |
| ADR-002 | Regex + Keywords para detección de intenciones (MVP) | 6 intenciones predecibles, sin costo adicional, determinístico | 31/08/2026 |
| ADR-003 | React Native con Expo Bare Workflow | Equipo ya domina React, reutiliza lógica del frontend web | 31/08/2026 |
| ADR-004 | Lambda Container Images para Prophet/ARIMA | Dependencias de Python >500MB, Lambda Container hasta 10GB, serverless | 31/08/2026 |
| ADR-005 | S3 para almacenar predicciones (cache estático) | Predicciones 1x/día, lectura intensiva, costo mínimo | 31/08/2026 |
| ADR-006 | Máquina de estados en DynamoDB con TTL para sesiones de chat | Lambda es stateless, TTL auto-limpia sesiones abandonadas | 31/08/2026 |

---

## ️ Registro de Implementaciones (Changelog)

> *Agrega entradas nuevas en la parte **superior** siguiendo el formato:*
> `[Fecha] - [Autor/Agente] - [Resumen de lo implementado]`

- **31/08/2026 — IA / Setup Team:**
 - Actualización completa de los documentos de Project Charter, Priorización de Casos y Product Goal → enfoque 100% en la plataforma HALO.
 - Eliminación de todos los rastros del proyecto anterior (Pacman/agente-pacman).
 - Creación del config.yaml de OpenSpec con contexto completo del proyecto, reglas por artefacto, y guías operacionales.
 - Creación del .openspec.yaml del change `halo-v2-expansion`.
 - Generación de propuesta técnica expandida (`proposal.md`).
 - Generación de diseño técnico con 6 ADRs y diagramas de arquitectura (`design.md`).
 - Generación de 3 specs independientes y exhaustivas: chatbot, mobile-app, predictions.
 - Generación de lista de 40+ tareas organizadas en 7 fases con dependencias (`tasks.md`).
 - Creación del documento de arquitectura inicial (`docs/arquitectura_inicial.md`).
 - Creación de 6 prompts pre-escritos para guiar el desarrollo fase por fase (`docs/primer_prompt.md`).

---

## En Progreso (WIP)

*Ninguna implementación de código iniciada aún. Todo el trabajo hasta ahora ha sido de planificación y especificación.*

---

## Siguiente Paso

Usar el **Prompt 1** de `docs/primer_prompt.md` para iniciar la **Fase 1: Chatbot Backend** (tareas T-1.1 y T-1.2: configuración de WebSocket API y tablas DynamoDB en serverless.yml).

---

## 🗺️ Estado CRISP-ML(Q)

Seguimiento del ciclo de vida del proyecto según la metodología **CRISP-ML(Q)**. Actualizar con cada sprint.

| Fase CRISP-ML(Q) | Artefacto(s) Principal(es) | Estado | Sprint |
|---|---|:---:|:---:|
| **1. Comprensión del Negocio** | [`problem_statement.md`](./problem_statement.md), [`product_goal.md`](./product_goal.md), [`priorizacion_casos.md`](./priorizacion_casos.md) | ✅ Completo | Sprint 0 |
| **2. Comprensión de los Datos** | [`data_ecosystem.md`](./data_ecosystem.md), `prediction-service/notebooks/01_eda.py` | ⚠️ Doc lista / Script pendiente | Sprint 0–1 |
| **3. Preparación de los Datos** | `prediction-service/scripts/generate_synthetic_data.py`, `prediction-service/transform.py` | ❌ Pendiente | Sprint 1 |
| **4. Modelado** | `prediction-service/prophet_model.py`, `prediction-service/arima_model.py` | ❌ Pendiente | Sprint 1 |
| **5. Evaluación** | `prediction-service/evaluator.py`, [`baseline.md`](./baseline.md), [`experiment_log.md`](./experiment_log.md) | ⚠️ Docs listos / Código pendiente | Sprint 1 |
| **6. Despliegue** | `prediction-service/Dockerfile`, EventBridge cron en `serverless.yml`, ECR | ❌ Pendiente | Sprint 2 |

> **Regla:** Actualizar esta tabla al cerrar cada tarea relacionada. El estado se mueve de ❌ → ⚠️ → ✅ a medida que los artefactos se completan.

---

## ️ Registro de Implementaciones (Changelog) — Continuación

- **16/09/2026 — Antigravity (Google DeepMind) / Kael Lopez:**
  - Diagnóstico de brechas contra los 5 Elementos de Competencia → `docs/gaps_y_recomendaciones.md`
  - Creación de `docs/problem_statement.md` — Formulación formal con stakeholders, alcance IN/OUT, métricas SMART (EC-1)
  - Creación de `docs/data_ecosystem.md` — Inventario de fuentes, reglas de generación sintética, restricciones de privacidad, reglas de preparación (EC-2)
  - Creación de `docs/baseline.md` — 4 modelos baseline + umbrales de aceptación para Prophet (EC-4)
  - Creación de `docs/experiment_log.md` — Log con EXP-000 a EXP-003 predefinidos y plantilla (EC-4)
  - Creación de `docs/risk_register.md` — 10 riesgos con probabilidad, impacto, score, mitigación y dueño (EC-3)
  - Creación de `README.md` en la raíz — Con CRISP-ML(Q), métricas, estructura del repo, reproducibilidad y declaración de IA (EC-5)
  - Actualización de `openspec/changes/halo-v2-expansion/design.md` — Agregados diagramas C4 niveles 1, 2 y 3 en Mermaid (EC-3)
  - Actualización de `docs/project_context.md` — Tabla de estado CRISP-ML(Q) + changelog actualizado (EC-5)



