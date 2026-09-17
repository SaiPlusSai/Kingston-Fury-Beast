# HALO v2 — Plataforma Inteligente de Gestión de Emergencias Urbanas

> **Taller de Sistemas Inteligentes** | Proyecto Integrador Semestral  
> Universidad — Semestre 2026-2  

[![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)](docs/project_context.md)
[![Metodología](https://img.shields.io/badge/Metodología-CRISP--ML(Q)%20%2B%20Scrum-blue)](docs/project_context.md)
[![Arquitectura C4](https://img.shields.io/badge/Arquitectura-C4%20(4%20Niveles)-purple)](docs/Arquitectura%20y%20Seguridad/C4/)
[![ADRs Formalizados](https://img.shields.io/badge/ADRs-10%20Decisiones-darkblue)](docs/Arquitectura%20y%20Seguridad/ADR/)
[![Seguridad](https://img.shields.io/badge/Seguridad-Security%20by%20Design-red)](docs/Arquitectura%20y%20Seguridad/Seguridad/Analisis-Security-by-Design.md)
[![IA Verificada](https://img.shields.io/badge/IA%20Fase%202-Human--in--the--Loop-green)](docs/declaracion_ia_evidencia_humana.md)

---

## 📌 Descripción del Proyecto

**HALO (Urban Shield)** es una plataforma de gestión de emergencias urbanas que conecta a ciudadanos, agentes de seguridad y administradores para reportar, gestionar y anticipar incidentes urbanos. Este repositorio contiene la documentación, especificaciones, arquitectura formal y gobernanza de la expansión **v2**, que agrega tres nuevas capacidades inteligentes:

| Módulo | Descripción | Tecnología Principal |
|---|---|---|
| 🤖 **Chatbot en Tiempo Real** | Canal conversacional para consultas y creación de reportes | WebSocket (API Gateway V2) + Node.js Lambda + Regex/FSM |
| 📊 **Predicción de Hotspots (IA)** | Modelos estadísticos que anticipan zonas de riesgo urbano | Python + Prophet + ARIMA/SARIMA (Docker Lambda) |
| 📱 **App Móvil Nativa** | Acceso completo a HALO desde dispositivos móviles | React Native + Expo (Bare Workflow) |

---

## 🎯 Product Goal

> Para **ciudadanos, autoridades y administradores**, evolucionaremos la plataforma **HALO** incorporando un **chatbot inteligente en tiempo real** para consultas, expandiendo el acceso mediante una **versión móvil** nativa, y añadiendo un módulo de **predicción de hotspots** mediante modelos estadísticos propios (Prophet/ARIMA) para optimizar la toma de decisiones y agilizar los tiempos de respuesta en la ciudad, respaldado por una arquitectura segura y auditable.

---

## 👥 Equipo y Responsabilidades

| Integrante | Rol | Enfoque | Disponibilidad |
|---|---|---|---|
| **Sergio Arias** | Tech Lead / Product Owner | Valor de producto, arquitectura C4 y seguridad | Lun, Jue 18:00–21:00 |
| **Alan Flores** | Scrum Master | Proceso, bloqueos, matriz de riesgos y ClickUp | Mar, Jue 20:00–23:00 |
| **Kael Lopez** | Ingeniero de Datos | Pipeline de datos, EDA, baseline y privacidad | Lun, Mie, Vie 19:00–21:00 |
| **Christhian Coronel** | Ingeniero de IA | Modelos Prophet/ARIMA, Docker Container, Lambda | Mar–Vie 19:00–22:00, Sáb–Dom |

---

## 🗺️ CRISP-ML(Q) — Ciclo de Vida del Proyecto

```
┌─────────────────────────────────────────────────────────────────┐
│                    CRISP-ML(Q) — HALO v2                        │
│                                                                 │
│  1. Comprensión    2. Comprensión    3. Preparación             │
│  del Negocio       de los Datos      de los Datos               │
│  ┌──────────┐     ┌──────────┐      ┌──────────┐               │
│  │problem_  │     │data_eco- │      │generate_ │               │
│  │statement │────▶│system.md │─────▶│data.py   │               │
│  │.md       │     │eda.ipynb │      │          │               │
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
```

| Fase | Artefacto(s) | Estado |
|---|---|:---:|
| 1. Comprensión del Negocio | [problem_statement.md](docs/problem_statement.md), [product_goal.md](docs/product_goal.md), [priorizacion_casos.md](docs/priorizacion_casos.md) | ✅ Completo |
| 2. Comprensión de los Datos | [data_ecosystem.md](docs/data_ecosystem.md), `prediction-service/notebooks/01_eda.ipynb` | ✅ Completo |
| 3. Preparación de los Datos | `prediction-service/scripts/generate_synthetic_data.py` | ✅ Completo (Dataset Diario y Crudo) |
| 4. Modelado | `prediction-service/notebooks/02_baseline.ipynb` (Modelos Base) | ✅ Baselines Completos — 4 modelos ejecutados |
| 5. Evaluación | `prediction-service/output/baseline_comparison.json`, [experiment_log.md](docs/experiment_log.md), [baseline.md](docs/baseline.md) | ✅ Baselines ejecutados con resultados reales / Prophet en Sprint 2 |
| 6. Despliegue | Lambda Container Image, EventBridge cron, [Analisis-Security-by-Design.md](docs/Arquitectura%20y%20Seguridad/Seguridad/Analisis-Security-by-Design.md) | ✅ Arquitectura lista / Código en Sprint 2 |

---

## 🏗️ Arquitectura y Modelo C4 Completo (4 Niveles)

El proyecto cuenta con modelado arquitectónico completo bajo el estándar **C4 Model** disponible en [`docs/Arquitectura y Seguridad/C4/`](docs/Arquitectura%20y%20Seguridad/C4/):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 MODELO C4 — RESUMEN                                    │
├─────────────────┬──────────────────────────────────────────────────────────────────────┤
│ Nivel 1         │ Contexto del Sistema: Usuarios (Ciudadano, Autoridad, Admin)         │
│ [Ver Diagrama]  │ interactuando con HALO Platform y servicios externos de AWS.         │
│ (C4-01)         │ ↳ docs/Arquitectura y Seguridad/C4/C4-01-Contexto.png                │
├─────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Nivel 2         │ Contenedores: Web SPA (React 19), Backend API (Lambda Express),      │
│ [Ver Diagrama]  │ WebSocket Handler, DynamoDB, S3 Bucket, Container de Predicción (ML). │
│ (C4-02)         │ ↳ docs/Arquitectura y Seguridad/C4/C4-02-Contenedores.png            │
├─────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Nivel 3         │ Componentes: Desglose interno del Backend, Chatbot y Módulo de IA.   │
│ [Ver Diagramas] │ ↳ C4-03-01-Componentes-Backend.png                                  │
│                 │ ↳ C4-03-02-Componentes-Chatbot.png                                  │
│                 │ ↳ C4-03-03-Componentes-Prediccion-IA.png                            │
├─────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Nivel 4         │ Código: Diagramas de clases y estructura interna de controladores.   │
│ [Ver Diagramas] │ ↳ C4-04-01-Codigo-Core-Reportes.png                                 │
│                 │ ↳ C4-04-02-Codigo-Chatbot.png                                       │
│                 │ ↳ C4-04-03-Codigo-Prediccion-IA.png                                 │
│                 │ ↳ C4-04-04-Codigo-Auth-Seguridad-Infra.png                          │
└─────────────────┴──────────────────────────────────────────────────────────────────────┘
```

---

## 📑 Registro de Decisiones de Arquitectura (10 ADRs Formalizados)

Ubicación oficial: [`docs/Arquitectura y Seguridad/ADR/`](docs/Arquitectura%20y%20Seguridad/ADR/)

| ID | Título del ADR | Decisión Principal | Alternativas Evaluadas y Descartadas |
|---|---|---|---|
| **ADR-001** | [Arquitectura General](docs/Arquitectura%20y%20Seguridad/ADR/ADR-001-Arquitectura-General-Serverless-Event-Driven.md) | Serverless Event-Driven en AWS | Monolito tradicional en EC2, Microservicios en ECS |
| **ADR-002** | [Backend Monolito Serverless](docs/Arquitectura%20y%20Seguridad/ADR/ADR-002-Backend-Monolito-Serverless-Express.md) | Node.js + Express en Lambda (`serverless-http`) | Lambdas individuales por endpoint, FastAPI en ECS |
| **ADR-003** | [Canal WebSocket del Chatbot](docs/Arquitectura%20y%20Seguridad/ADR/ADR-003-Canal-Tiempo-Real-Chatbot-API-Gateway-WebSockets.md) | AWS API Gateway WebSocket API | HTTP Polling, Server-Sent Events (SSE), AppSync |
| **ADR-004** | [Motor NLP del Chatbot](docs/Arquitectura%20y%20Seguridad/ADR/ADR-004-Motor-NLP-Chatbot-Regex-Maquina-Estados.md) | Regex + Máquina de Estados Finita determinística | AWS Lex v2, OpenAI API (GPT-4o), Dialogflow |
| **ADR-005** | [Pipeline de Predicción IA](docs/Arquitectura%20y%20Seguridad/ADR/ADR-005-Pipeline-IA-Prediccion-Prophet-ARIMA-Lambda-Container.md) | Prophet + ARIMA en AWS Lambda Container Image | Inferencia en tiempo real, Amazon SageMaker, EC2 |
| **ADR-006** | [Persistencia Híbrida](docs/Arquitectura%20y%20Seguridad/ADR/ADR-006-Persistencia-Hibrida-DynamoDB-S3-Cache-Estatico.md) | DynamoDB (datos operativos) + S3 (predicciones JSON) | RDS PostgreSQL, MongoDB Atlas, Redis Cache |
| **ADR-007** | [Frontend y App Móvil](docs/Arquitectura%20y%20Seguridad/ADR/ADR-007-Frontend-Web-React19-Mobile-ReactNative-Expo.md) | React 19 (Web) + React Native con Expo Bare Workflow | Flutter (Dart), Aplicaciones Nativas independientes |
| **ADR-008** | [Estrategia de Autenticación Dual](docs/Arquitectura%20y%20Seguridad/ADR/ADR-008-Estrategia-Autenticacion-Dual-Cognito-JWT.md) | Cognito en AWS + Adaptador local Bcrypt/JWT | Solo Cognito en la nube, Autenticación básica sin tokens |
| **ADR-009** | [Carga Directa de Archivos](docs/Arquitectura%20y%20Seguridad/ADR/ADR-009-Carga-Directa-Archivos-S3-Presigned-URLs.md) | Subida directa a S3 vía Pre-signed URLs | Subir fotos a través de Lambda (base64 multipart) |
| **ADR-010** | [Mitigación de Cold-Start y Datos](docs/Arquitectura%20y%20Seguridad/ADR/ADR-010-Generacion-Datos-Sinteticos-Mitigacion-Cold-Start-ML.md) | Generador de datos sintéticos con seed fija (42) | Esperar acumulación de datos reales en producción |

---

## 🔒 Seguridad y Security by Design

El sistema implementa **Defensa en Profundidad (Defense in Depth)** y cumplimiento con **OWASP Top 10 API Security (2023)** y **OWASP LLM/ML (2025)**:
- 📄 Documento Completo: [`docs/Arquitectura y Seguridad/Seguridad/Analisis-Security-by-Design.md`](docs/Arquitectura%20y%20Seguridad/Seguridad/Analisis-Security-by-Design.md)
- 📊 Matriz de Amenazas: [`docs/Arquitectura y Seguridad/Seguridad/Matriz-Riesgos.md`](docs/Arquitectura%20y%20Seguridad/Seguridad/Matriz-Riesgos.md)

**Pilares Clave:**
1. **Control de Acceso y BOLA (OWASP API1):** Verificación estricta de propiedad del reporte en capa de servicio antes de lectura/mutación.
2. **Protección Perimetral:** Rate limiting (100 req/15min en Auth), API Gateway Throttling, y cabeceras `helmet`.
3. **Cero Secretos:** Credenciales inyectadas vía AWS SSM Parameter Store y variables de entorno ignoradas en Git.
4. **Minimización de PII:** Agrupación espacial en celdas de 500m para proteger la identidad de ciudadanos denunciantes.

---

## ⚖️ Declaración de IA y Verificación Humana (Fase 2 — Blindada)

De acuerdo con el estándar de excelencia exigido en la rúbrica del Elemento de Competencia 1, el equipo opera bajo un **Protocolo de Verificación Humana en el Bucle (Human-in-the-Loop - HITL)**:

* 📄 Protocolo y Matriz de Verificación: [`docs/declaracion_ia_evidencia_humana.md`](docs/declaracion_ia_evidencia_humana.md)

### Principios de la Fase 2:
1. **Auditoría de Alucinaciones:** Toda sugerencia de IA es analizada críticamente. Se han descartado propuestas inviables de IA (como usar WebSockets en EC2 o SageMaker para series de tiempo simples) a favor de decisiones óptimas documentadas en los ADRs.
2. **Matriz de Intervención Humana:** Cada documento cuenta con registro del responsable humano que validó y modificó el artefacto.
3. **Cero Datos Sensibles en Prompts:** Ningún secreto, token o dato real se envía a herramientas de IA.
4. **Apropiación Técnica:** Todos los integrantes comprenden y defienden técnicamente cada decisión sin depender de la IA frente al docente.

---


---

## 🚀 Guía de Inicio Rápido y Ejecución Local (Backend y Frontend)

Para reproducir y evaluar el sistema en vivo durante la defensa, sigue este tutorial paso a paso para levantar tanto el **Backend Serverless** como el **Frontend Web**.

### 📋 Prerrequisitos del Entorno
* **Node.js:** Versión 18.0.0 o superior (`node -v`)
* **NPM:** Gestor de paquetes incluido con Node (`npm -v`)
* **Navegador Web:** Chrome, Edge o Firefox moderno

---

### 🟢 1. Iniciar el Backend (`backend_urbanshield`)

El backend está desarrollado en **Node.js + Express** y cuenta con un modo de desarrollo local (**in-memory store**) que permite levantarlo y probarlo al 100% sin requerir credenciales activas de AWS.

#### Paso 1.1: Navegar a la carpeta del backend
Abre una terminal y colócate en el directorio del backend:
```bash
# Si estás en la raíz de los repositorios:
cd backend_urbanshield
```

#### Paso 1.2: Configurar las variables de entorno
Copia la plantilla de variables de entorno:
```bash
# En Windows (PowerShell):
Copy-Item .env.example .env

# En Linux / macOS / Git Bash:
cp .env.example .env
```
> 💡 **Nota de configuración:** El archivo `.env.example` ya viene preconfigurado para desarrollo local con:
> - `PORT=3000`
> - `API_PREFIX=/api`
> - `USE_IN_MEMORY_STORE=true` *(habilita base de datos en memoria para pruebas sin DynamoDB remoto)*
> - `USE_COGNITO=false` *(habilita autenticación local con JWT y Bcrypt sin Cognito)*
> - `CORS_ORIGIN=http://localhost:5173` *(permite conexión con el frontend)*

#### Paso 1.3: Instalar dependencias
```bash
npm install
```

#### Paso 1.4: Iniciar el servidor en modo desarrollo
```bash
npm run dev
```
*(El servidor iniciará mediante `nodemon` escuchando en el puerto 3000).*

#### Paso 1.5: Verificación en vivo del Backend
* **API Base:** `http://localhost:3000/api`
* **Documentación Interactiva Swagger / OpenAPI:**  
  👉 **`http://localhost:3000/api-docs`**  
  *(Permite probar directamente endpoints de autenticación, creación y listado de incidentes).*

---

### 🔵 2. Iniciar el Frontend (`frontend_urbanshield`)

La aplicación cliente está construida sobre **React 19 + Vite + TailwindCSS v4** y consume los endpoints del backend local.

#### Paso 2.1: Navegar a la carpeta del frontend
Abre una **segunda terminal** (mantén el backend corriendo en la primera):
```bash
# Si estás en la raíz de los repositorios:
cd frontend_urbanshield
```

#### Paso 2.2: Configurar las variables de entorno
Copia la plantilla de variables de entorno:
```bash
# En Windows (PowerShell):
Copy-Item .env.example .env

# En Linux / macOS / Git Bash:
cp .env.example .env
```
Asegúrate de que el archivo `.env` contenga la URL que apunta al backend local:
```env
VITE_API_URL=http://localhost:3000/api
```

#### Paso 2.3: Instalar dependencias
```bash
npm install
```

#### Paso 2.4: Iniciar el servidor de desarrollo Vite
```bash
npm run dev
```

#### Paso 2.5: Verificación en vivo del Frontend
Abre tu navegador e ingresa a:  
👉 **`http://localhost:5173`**

---

### 🟣 3. Iniciar el Pipeline de Inteligencia Artificial (Sprint 0)

El módulo de predicción de hotspots tiene un pipeline de ciencia de datos listo para evaluación.

#### Paso 3.1: Entorno Virtual e Instalación
Abre una terminal en la carpeta del servicio:
```bash
cd prediction-service
pip install -r requirements.txt
```

#### Paso 3.2: Generar Datos Sintéticos
El proyecto simula 10,000 incidentes individuales y los agrupa por día para entrenar la IA:
```bash
python scripts/generate_synthetic_data.py
```
*(Esto generará `synthetic_lapaz_v1.csv` y `synthetic_lapaz_daily.csv` en `data/raw/`)*

#### Paso 3.3: Ejecutar Jupyter Notebooks (EDA y Baselines)
Hemos preparado dos cuadernos Jupyter interactivos para visualizar los hallazgos:
1. Abre `notebooks/01_eda.ipynb` (Análisis Exploratorio de Datos) en VS Code y ejecútalo para ver los mapas de calor y distribuciones.
2. Abre `notebooks/02_baseline.ipynb` (Evaluación de Baselines) en VS Code y ejecútalo para ver cómo se comportan los modelos estacionales básicos frente a la realidad.

---

## 📁 Estructura del Repositorio

```
Kingston-Fury-Beast/                  ← Repositorio central de documentación y especificaciones
│
├── README.md                         ← Este portal de navegación
│
├── docs/
│   ├── problem_statement.md          ← EC-1: Formulación del problema, stakeholders y métricas
│   ├── product_goal.md               ← EC-1: Product Goal formal
│   ├── priorizacion_casos.md         ← EC-1: Matriz de priorización y justificación del proyecto
│   ├── data_ecosystem.md             ← EC-2: Inventario de datos, EDA, pipeline y privacidad
│   ├── baseline.md                   ← EC-4: 4 modelos de referencia y umbrales Prophet
│   ├── experiment_log.md             ← EC-4: Log de experimentos (exitosos y fallidos)
│   ├── risk_register.md              ← EC-3: Registro activo de 10 riesgos (P x I)
│   ├── declaracion_ia_evidencia_humana.md ← EC-5: Blindaje HITL de uso de IA (Fase 2)
│   ├── team_charter.md               ← EC-5: Normas del equipo, SLAs y Definition of Done
│   ├── clickup_estructura.md         ← EC-5: Flujo de trabajo Scrum y trazabilidad
│   ├── project_context.md            ← Estado vivo del proyecto, changelog y tabla CRISP-ML(Q)
│   ├── gaps_y_recomendaciones.md     ← Diagnóstico de brechas vs Elementos de Competencia
│   ├── arquitectura_inicial.md       ← Stack completo, tablas DynamoDB y endpoints existentes
│   ├── primer_prompt.md              ← 6 prompts pre-escritos para guiar el desarrollo con IA
│   │
│   └── Arquitectura y Seguridad/     ← 🏛️ ARQUITECTURA FORMAL Y SEGURIDAD
│       ├── ADR/                      ← 10 Decisiones de Arquitectura (ADR-001 a ADR-010)
│       ├── C4/                       ← Diagramas C4 en 4 niveles
│       │   ├── C4-01-Contexto.png
│       │   ├── C4-02-Contenedores.png
│       │   ├── C4-03-Componentes.png
│       │   ├── C4-04-Codigo.png
│       │   ├── Componentes/          ← C4-03-01, C4-03-02, C4-03-03 (Backend, Chatbot, IA)
│       │   └── Codigo/               ← C4-04-01 a C4-04-04 (Core, Chatbot, IA, Auth)
│       └── Seguridad/                ← Security by Design y Matriz de Riesgos
│
├── backend/                          ← Backend Node.js + Express (modo local in-memory)
├── frontend/                         ← Frontend React 19 + Vite + TailwindCSS v4
├── mobile/                           ← App Móvil React Native + Expo (⚠️ Por iniciar)
│
├── prediction-service/               ← Pipeline de Ciencia de Datos (Python)
│   ├── scripts/generate_synthetic_data.py
│   ├── notebooks/
│   │   ├── 01_eda.ipynb              ← Análisis Exploratorio de Datos
│   │   └── 02_baseline.ipynb         ← Evaluación de 4 modelos baseline ✅ Ejecutado
│   ├── data/raw/                     ← Datasets sintéticos generados
│   └── output/                       ← Resultados: baseline_comparison.json, gráficas
│
├── openspec/                         ← Especificaciones de Cambios y Ciclo de Vida
│   └── changes/
│       └── halo-v2-expansion/
│           ├── design.md             ← Diseño técnico detallado
│           ├── proposal.md           ← Propuesta técnica expandida
│           ├── tasks.md              ← 40+ tareas por fases
│           └── specs/                ← Especificaciones por módulo (Chatbot, Móvil, Predicción)
│
└── .agent/                           ← Habilidades y workflows para Antigravity IDE
```

---

*Última actualización: 17/09/2026 — Baselines ejecutados, estructura del repo actualizada | Equipo HALO (Sergio Arias, Alan Flores, Kael Lopez, Christhian Coronel)*
