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


