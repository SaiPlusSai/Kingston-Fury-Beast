# HALO v2 — Plataforma Inteligente de Gestión de Emergencias Urbanas

> **Taller de Sistemas Inteligentes** | Proyecto Integrador Semestral  
> Universidad — Semestre 2026-2  

[![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)](docs/project_context.md)
[![Metodología](https://img.shields.io/badge/Metodología-CRISP--ML(Q)%20%2B%20Scrum-blue)](docs/project_context.md)
[![IA Declarada](https://img.shields.io/badge/IA-Antigravity%20(Google%20DeepMind)-green)](docs/team_charter.md)

---

## 📌 Descripción del Proyecto

**HALO (Urban Shield)** es una plataforma de gestión de emergencias urbanas que conecta a ciudadanos, agentes de seguridad y administradores para reportar, gestionar y anticipar incidentes urbanos. Este repositorio contiene la documentación, especificaciones y arquitectura de la expansión **v2**, que agrega tres nuevas capacidades de inteligencia:

| Módulo | Descripción | Tecnología Principal |
|---|---|---|
| 🤖 **Chatbot en Tiempo Real** | Canal conversacional para consultas y creación de reportes | WebSocket (API Gateway) + Node.js Lambda |
| 📊 **Predicción de Hotspots (IA)** | Modelos estadísticos que anticipan zonas de riesgo | Python + Prophet + ARIMA/SARIMA |
| 📱 **App Móvil Nativa** | Acceso completo a HALO desde dispositivos móviles | React Native + Expo (Bare Workflow) |

---

## 🎯 Product Goal

> Para **ciudadanos, autoridades y administradores**, evolucionaremos la plataforma **HALO** incorporando un **chatbot inteligente en tiempo real** para consultas, expandiendo el acceso mediante una **versión móvil** nativa, y añadiendo un módulo de **predicción de hotspots** mediante modelos estadísticos propios (Prophet/ARIMA) para optimizar la toma de decisiones y agilizar los tiempos de respuesta en la ciudad.

---

## 👥 Equipo

| Integrante | Rol | Enfoque | Disponibilidad |
|---|---|---|---|
| **Sergio Arias** | Tech Lead / Product Owner | Valor de producto, arquitectura | Lun, Jue 18:00–21:00 |
| **Alan Flores** | Scrum Master | Proceso, bloqueos, riesgos | Mar, Jue 20:00–23:00 |
| **Kael Lopez** | Ingeniero de Datos | Pipeline de datos, EDA, baseline | Lun, Mie, Vie 19:00–21:00 |
| **Christhian Coronel** | Ingeniero de IA | Modelos Prophet/ARIMA, Docker, Lambda | Mar–Vie 19:00–22:00, Sáb–Dom |

---

## 🗺️ CRISP-ML(Q) — Ciclo de Vida del Proyecto

`
┌─────────────────────────────────────────────────────────────────┐
│                    CRISP-ML(Q) — HALO v2                       │
│                                                                 │
│  1. Comprensión    2. Comprensión    3. Preparación             │
│  del Negocio       de los Datos      de los Datos               │
│  ┌──────────┐     ┌──────────┐      ┌──────────┐               │
│  │problem_  │     │data_eco- │      │transform │               │
│  │statement │────▶│system.md │─────▶│.py + EDA │               │
│  │.md       │     │01_eda.py │      │          │               │
│  └──────────┘     └──────────┘      └────┬─────┘               │
│                                          │                      │
│  6. Despliegue    5. Evaluación     4. Modelado                 │
│  ┌──────────┐     ┌──────────┐      ┌──────────┐               │
│  │Lambda    │     │evaluator │      │prophet_  │               │
│  │Container │◀────│.py +     │◀─────│model.py  │               │
│  │EventBrdg │     │experiment│      │arima_    │               │
│  └──────────┘     │_log.md   │      │model.py  │               │
│                   └──────────┘      └──────────┘               │
└─────────────────────────────────────────────────────────────────┘
`

| Fase | Artefacto(s) | Estado |
|---|---|:---:|
| 1. Comprensión del Negocio | [problem_statement.md](docs/problem_statement.md), [product_goal.md](docs/product_goal.md) | ✅ Completo |
| 2. Comprensión de los Datos | [data_ecosystem.md](docs/data_ecosystem.md), prediction-service/notebooks/01_eda.py | ⚠️ Doc lista / Script pendiente |
| 3. Preparación de los Datos | prediction-service/transform.py | ❌ Pendiente (Sprint 1) |
| 4. Modelado | prediction-service/prophet_model.py, rima_model.py | ❌ Pendiente (Sprint 1) |
| 5. Evaluación | prediction-service/evaluator.py, [experiment_log.md](docs/experiment_log.md), [aseline.md](docs/baseline.md) | ⚠️ Docs listos / Código pendiente |
| 6. Despliegue | Lambda Container Image, EventBridge cron | ❌ Pendiente (Sprint 2) |

---

## 🏗️ Arquitectura General (C4 — Nivel 1: Contexto)

`
                    ┌─────────────────────────────┐
                    │       HALO Platform         │
                    │   (Urban Shield v2)         │
                    │                             │
Ciudadano ─────────▶│  • Chatbot (WebSocket)      │
                    │  • Web App (React 19)       │
Autoridad ─────────▶│  • Dashboard Predicciones   │◀───── AWS Services
                    │  • App Móvil (RN + Expo)    │       (Lambda, DynamoDB,
Administrador ─────▶│  • Gestión de Reportes      │        S3, Cognito, SNS)
                    └─────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │   Módulo de IA (Python)    │
                    │   Prophet + ARIMA          │
                    │   EventBridge (Cron 3AM)   │
                    └───────────────────────────┘
`

---

## 📊 Métricas de Éxito

| Módulo | Métrica | Objetivo | Estado |
|---|---|---|:---:|
| **Predicción** | MAPE Prophet (holdout) | ≤ 15% | ⏳ Pendiente |
| **Predicción** | RMSE vs. mejor baseline | Reducción ≥ 20% | ⏳ Pendiente |
| **Chatbot** | Precisión de intenciones | ≥ 90% en suite de 60 casos | ⏳ Pendiente |
| **Chatbot** | Latencia P95 | ≤ 2 segundos | ⏳ Pendiente |
| **App Móvil** | Pantallas implementadas | 14/14 del spec | ⏳ Pendiente |

---

## 📁 Estructura del Repositorio

`
Kingston-Fury-Beast/                  ← Repo de documentación y specs (este repo)
│
├── README.md                         ← Este archivo
├── docs/
│   ├── problem_statement.md          ← EC-1: Formulación del problema + stakeholders + métricas
│   ├── product_goal.md               ← EC-1: Product Goal del equipo
│   ├── data_ecosystem.md             ← EC-2: Inventario de datos + EDA + privacidad
│   ├── baseline.md                   ← EC-4: Modelos de referencia + umbrales Prophet
│   ├── experiment_log.md             ← EC-4: Log de experimentos (exitosos y fallidos)
│   ├── risk_register.md              ← EC-3: Registro activo de riesgos
│   ├── arquitectura_inicial.md       ← EC-3: Stack técnico existente
│   ├── project_context.md            ← EC-5: Registro de cambios + ADRs + estado
│   ├── team_charter.md               ← EC-5: Normas del equipo + uso de IA
│   ├── priorizacion_casos.md         ← EC-1: Matriz de selección del proyecto
│   ├── primer_prompt.md              ← Prompts pre-escritos para guiar el desarrollo con IA
│   ├── clickup_estructura.md         ← EC-5: Estructura del tablero Scrum
│   └── gaps_y_recomendaciones.md     ← Análisis de brechas vs. elementos de competencia
│
├── openspec/
│   └── changes/
│       └── halo-v2-expansion/
│           ├── proposal.md           ← Propuesta técnica expandida
│           ├── design.md             ← ADRs (6) + Diagramas C4 + Estructura de carpetas
│           ├── tasks.md              ← 40+ tareas en 7 fases con criterios de verificación
│           └── specs/
│               ├── chatbot/spec.md   ← Especificación completa del chatbot
│               ├── mobile-app/spec.md ← Especificación de la app móvil (14 pantallas)
│               └── predictions/spec.md ← Especificación del pipeline de predicción
│
└── .agent/                           ← Skills y workflows para Antigravity IDE
`

---

## 🔁 Reproducibilidad del Pipeline de Predicciones

### Prerrequisitos
- Python 3.11+
- Docker Desktop (para prueba de Lambda Container localmente)
- AWS CLI configurado (opcional, para despliegue real)

### Pasos para reproducir localmente (entorno académico)

`ash
# 1. Clonar el repo del servicio de predicciones
git clone https://github.com/chriscc27/backend_urbanshield.git
cd prediction-service/

# 2. Crear entorno virtual e instalar dependencias
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate en Windows
pip install -r requirements.txt

# 3. Generar datos sintéticos reproducibles (seed=42)
python scripts/generate_synthetic_data.py

# 4. Ejecutar EDA
python notebooks/01_eda.py

# 5. Calcular baselines y entrenar Prophet + ARIMA
python handler.py --mode local --compute-baselines

# 6. Ver resultados en
cat output/metrics_.json
cat output/baseline_comparison_.json
`

---

## 🔗 Documentación Clave

| Documento | Descripción | EC |
|---|---|---|
| [problem_statement.md](docs/problem_statement.md) | Problema, stakeholders, alcance, métricas SMART | EC-1 |
| [data_ecosystem.md](docs/data_ecosystem.md) | Inventario de datos, EDA, privacidad, pipeline | EC-2 |
| [design.md](openspec/changes/halo-v2-expansion/design.md) | 6 ADRs + diagramas C4 + estructura del código | EC-3 |
| [isk_register.md](docs/risk_register.md) | 10 riesgos con probabilidad, impacto y dueño | EC-3 |
| [aseline.md](docs/baseline.md) | 4 modelos baseline + umbrales de aceptación Prophet | EC-4 |
| [experiment_log.md](docs/experiment_log.md) | Log de experimentos con resultados y decisiones | EC-4 |
| [	asks.md](openspec/changes/halo-v2-expansion/tasks.md) | 40+ tareas en 7 fases con criterios de verificación | EC-5 |
| [	eam_charter.md](docs/team_charter.md) | Normas del equipo, PRs, uso de IA | EC-5 |

---

## 🚀 Estado Actual del Proyecto

| Componente | Estado | Progreso |
|---|---|:---:|
| 📄 Documentación y Specs | ✅ Completo | 100% |
| 🤖 Chatbot Backend (WebSocket + Handlers) | ❌ No iniciado | 0% |
| 💬 Chatbot Frontend (Widget React) | ❌ No iniciado | 0% |
| 📊 Predicción (Pipeline Python + Prophet/ARIMA) | ❌ No iniciado | 0% |
| 📈 Predicción (Dashboard de Visualización) | ❌ No iniciado | 0% |
| 📱 App Móvil (React Native + Expo) | ❌ No iniciado | 0% |
| 🧪 Testing e Integración | ❌ No iniciado | 0% |

---

## ⚖️ Declaración Transparente de Uso de IA

Este proyecto utiliza herramientas de IA generativa de forma transparente, de acuerdo con las políticas del equipo documentadas en [	eam_charter.md](docs/team_charter.md):

- **Herramientas utilizadas:** Antigravity (Google DeepMind) para generación de documentación, estructura de código y análisis de arquitectura.
- **Política:** Todo código o documento generado con IA es revisado, comprendido y probado por el miembro del equipo dueño de la tarea antes de ser incorporado al repositorio.
- **Trazabilidad:** Los PRs que contienen trabajo asistido por IA lo declaran explícitamente en su descripción.
- **Responsabilidad:** El dueño de cada tarea en ClickUp es responsable final del artefacto, sin importar si fue asistido por IA.

---

*Última actualización: 16/09/2026 | Equipo HALO | Taller de Sistemas Inteligentes*
