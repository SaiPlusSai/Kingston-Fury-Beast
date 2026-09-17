# Gaps y Recomendaciones — Elementos de Competencia
## Proyecto HALO | Taller de Sistemas Inteligentes

> **Propósito:** Este documento es el registro vivo de todo lo que falta para cumplir los estándares de evaluación académica del curso. Cada brecha tiene una recomendación concreta, el artefacto que hay que crear y quién debería ejecutarla.
>
> **Metodología de análisis:** Diagnóstico realizado el **16/09/2026** contra el inventario actual del repositorio, contrastado con los 5 Elementos de Competencia (EC) definidos en la rúbrica de la materia.

---

## Resumen Ejecutivo

| Elemento de Competencia | Estado Actual | Brechas Críticas | Prioridad |
|---|:---:|:---:|:---:|
| EC-1: Formulación del Problema y Métricas | ⚠️ Parcial | 3 artefactos faltantes | 🔴 Alta |
| EC-2: Ecosistema de Datos | ❌ Ausente | 2 artefactos faltantes | 🔴 Alta |
| EC-3: Arquitectura y Gestión de Riesgos | ✅ Buena base | 1 brecha menor | 🟡 Media |
| EC-4: Línea Base y Evidencia Reproducible | ❌ Ausente | 3 artefactos faltantes | 🔴 Alta |
| EC-5: Trazabilidad y Repositorio (CRISP-ML + Scrum) | ⚠️ Parcial | 2 artefactos faltantes | 🟡 Media |

---

## EC-1 — Formulación del Problema y Métricas

### Estado actual

El [`product_goal.md`](./product_goal.md) tiene 4 líneas de descripción general. La
[`priorizacion_casos.md`](./priorizacion_casos.md) justifica bien la elección del proyecto, pero ninguno
de los dos cumple el estándar académico de una formulación formal del problema.

### Brechas detectadas

#### 🔴 BRECHA 1.1 — No existe `problem_statement.md`

Un documento con la formulación estructurada del problema, que responda:
- ¿Qué problema real resuelve el sistema? (con datos de contexto)
- ¿Quiénes son los stakeholders con nombre, rol e interés específico?
- ¿Cuál es el alcance exacto (qué resuelve y qué excluye)?
- ¿Cuáles son las métricas de éxito SMART y medibles?

#### 🔴 BRECHA 1.2 — `product_goal.md` insuficiente

El archivo actual solo tiene una oración de producto. Debe ampliarse con:
- Criterios de Acceptance Level por cada módulo (Chatbot, Predicciones, App Móvil)
- Hipótesis de valor: "Si implementamos X, entonces Y mejorará en Z%"

#### 🟡 BRECHA 1.3 — Sin mapa de stakeholders

No hay un registro de stakeholders con sus niveles de influencia/interés (matriz
Poder–Interés) ni sus requisitos específicos documentados.

### Recomendaciones

**Acción 1.1 — Crear `docs/problem_statement.md`**

Estructura recomendada:

```markdown
# Formulación del Problema — HALO v2

## 1. Contexto del Problema
## 2. Declaración del Problema (Problem Statement)
## 3. Stakeholders
   - Tabla: Nombre | Rol | Interés | Nivel de Influencia
## 4. Alcance del Sistema
   - ✅ IN SCOPE (qué resuelve)
   - ❌ OUT OF SCOPE (qué excluye explícitamente)
## 5. Métricas de Éxito (SMART)
   - Por módulo: Chatbot, Predicciones, App Móvil
## 6. Hipótesis de Valor
## 7. Definición de "Éxito del Proyecto"
```

**Ejemplo de métricas SMART para las Predicciones (referencia):**

| Métrica | Objetivo | Medición |
|---|---|---|
| MAPE del modelo Prophet | ≤ 15% en validación | Script `evaluator.py` |
| RMSE vs. baseline naive | Reducción ≥ 20% | Comparación en `baseline.md` |
| Tiempo de ejecución del pipeline | ≤ 10 min por corrida | CloudWatch Logs |
| Disponibilidad de predicciones | ≥ 99% | S3 + CloudFront |
| Intenciones correctas del chatbot | ≥ 90% en 6 intenciones | Test suite del chatbot |
| Tiempo de respuesta del chatbot | ≤ 2 seg (P95) | CloudWatch + X-Ray |

---

## EC-2 — Ecosistema de Datos

### Estado actual

No existe ningún documento de datos. Las specs de predicciones (`specs/predictions/spec.md`)
mencionan datos de DynamoDB y datos sintéticos, pero no hay inventario formal, análisis de
calidad ni reglas de preparación documentados.

### Brechas detectadas

#### 🔴 BRECHA 2.1 — No existe `docs/data_ecosystem.md`

Debe documentar:
- **Inventario de fuentes:** Todas las tablas de DynamoDB que alimentan el modelo
- **Análisis exploratorio (EDA):** Distribuciones, nulos, outliers, estacionalidad detectada
- **Restricciones legales/privacidad:** ¿Los datos de incidentes están anonimizados? ¿Hay PII?
- **Reglas de preparación:** Transformaciones, agrupaciones, manejo de gaps temporales

#### 🔴 BRECHA 2.2 — No hay pipeline de EDA documentado

No existe ningún notebook o script de exploración de datos que genere evidencia reproducible
del estado del dataset antes del entrenamiento del modelo.

### Recomendaciones

**Acción 2.1 — Crear `docs/data_ecosystem.md`**

Estructura recomendada:

```markdown
# Ecosistema de Datos — HALO v2

## 1. Inventario de Fuentes de Datos
   - Tabla: Nombre | Tipo | Descripción | Volumen estimado | Owner
## 2. Descripción de los Datos del Modelo Predictivo
   - ReportsTable: campos usados, tipos, cardinalidades
## 3. Restricciones Legales y de Privacidad
## 4. Análisis de Calidad (EDA Summary)
   - Período cubierto, distribución por zona, % de nulos, outliers
## 5. Estrategia de Datos Sintéticos
   - Justificación de por qué se usan datos sintéticos
   - Reglas de generación (patrones, estacionalidades, ruido)
## 6. Reglas de Preparación (Data Pipeline Rules)
   - Pasos de transform.py documentados aquí como referencia
## 7. Versionado de Datasets
```

**Acción 2.2 — Crear notebook/script de EDA**

Archivo sugerido: `prediction-service/notebooks/01_eda.ipynb` o `01_eda.py`

El EDA debe generar como mínimo:
- Gráfica de distribución de incidentes por zona y por hora
- Serie de tiempo con gaps marcados
- Heatmap de correlación entre variables
- Resumen estadístico exportado a `docs/eda_summary.md`

---

## EC-3 — Arquitectura y Gestión de Riesgos

### Estado actual

Esta es la sección **mejor cubierta** del repositorio. El [`design.md`](../openspec/changes/halo-v2-expansion/design.md)
tiene 6 ADRs documentados y diagramas de arquitectura. El [`project_context.md`](./project_context.md) registra
las decisiones. Sin embargo, hay una brecha menor en los diagramas C4.

### Brechas detectadas

#### 🟡 BRECHA 3.1 — Diagramas C4 no están en formato estándar

Los diagramas del `design.md` son diagramas ASCII/texto, no C4 formales (Context, Container,
Component, Code). Un evaluador que conozca la metodología C4 notará la diferencia.

#### 🟡 BRECHA 3.2 — Registro de Riesgos no tiene seguimiento activo

La [`priorizacion_casos.md`](./priorizacion_casos.md) menciona riesgos, pero no hay una tabla
de riesgos formal con probabilidad, impacto, estado de mitigación y dueño.

### Recomendaciones

**Acción 3.1 — Agregar diagramas C4 en Mermaid a `design.md`**

Añadir al menos los niveles 1 (Context) y 2 (Container) usando bloques Mermaid dentro del
`design.md` existente. Ejemplo del nivel 1:

```
[Citizen] --uses--> [HALO Platform] --deployed on--> [AWS Services]
[Admin]   --manages--> [HALO Platform]
```

**Acción 3.2 — Crear `docs/risk_register.md`**

Tabla de riesgos formal con seguimiento:

| ID | Riesgo | Prob | Impacto | Score | Mitigación | Dueño | Estado |
|---|---|:---:|:---:|:---:|---|---|:---:|
| R-01 | Cold starts pesados en Lambda Container (Prophet) | Media | Alto | 6/9 | Provisioned Concurrency + warm-up | Christhian | 🟡 Activo |
| R-02 | Datos sintéticos no representan patrones reales | Alta | Alto | 9/9 | Validar con datos reales en DynamoDB | Kael | 🔴 Crítico |
| R-03 | WebSocket API Gateway timeouts > 29 seg | Baja | Medio | 3/9 | Chunking de respuestas largas | Alan | 🟢 Mitigado |
| R-04 | Límite de tamaño de Lambda Container Image | Media | Medio | 4/9 | Lambda Container hasta 10GB (ADR-004) | Christhian | 🟢 Mitigado |
| R-05 | Modelo Prophet sobreajustado a datos sintéticos | Alta | Alto | 9/9 | Cross-validation temporal + holdout 20% | Kael | 🔴 Crítico |

---

## EC-4 — Línea Base y Evidencia Reproducible

### Estado actual

Esta es la **brecha más crítica** para la evaluación del componente de IA. Sin un baseline
documentado, no se puede demostrar que el modelo agrega valor. No existe ningún artefacto
en este eje.

### Brechas detectadas

#### 🔴 BRECHA 4.1 — No existe `docs/baseline.md`

Sin línea base, es imposible responder: "¿En qué porcentaje mejoró Prophet frente a no tener
modelo?" El evaluador no puede verificar el avance cuantitativo del modelo.

#### 🔴 BRECHA 4.2 — No existe estructura para `docs/experiment_log.md`

Si Prophet falla o ARIMA da mejores resultados, ese hallazgo debe quedar documentado como
evidencia válida de proceso científico. No tener ese registro se interpreta como ocultamiento
de resultados o falta de rigor.

#### 🔴 BRECHA 4.3 — Pipeline no es reproducible sin instrucciones

No hay un `README.md` ni sección que explique cómo reproducir el pipeline completo desde
cero (datos sintéticos → EDA → entrenamiento → evaluación → salida).

### Recomendaciones

**Acción 4.1 — Crear `docs/baseline.md`**

Estructura recomendada:

```markdown
# Definición de Línea Base (Baseline) — Módulo de Predicción

## 1. Justificación del Baseline
   Por qué un baseline naive es el punto de comparación correcto.

## 2. Modelos Baseline Definidos
   - Baseline 1 (Naive): predice el mismo valor del día anterior
   - Baseline 2 (Media móvil 7 días): promedio de la última semana
   - Baseline 3 (ARIMA auto): modelo estadístico como alternativa a Prophet

## 3. Métricas del Baseline (a completar al ejecutar el pipeline)
   | Modelo         | MAE | RMSE | MAPE | R²  |
   |----------------|-----|------|------|-----|
   | Naive          | TBD | TBD  | TBD  | TBD |
   | Media móvil 7d | TBD | TBD  | TBD  | TBD |
   | ARIMA auto     | TBD | TBD  | TBD  | TBD |
   | Prophet (meta) | ≤X  | ≤X   | ≤15% | ≥0.7|

## 4. Umbral de Aceptación
   Prophet se considera exitoso si supera al mejor baseline en ≥20% de RMSE.

## 5. Fecha de Actualización
```

**Acción 4.2 — Crear `docs/experiment_log.md`**

Plantilla para cada experimento (exitoso o fallido):

```markdown
# Log de Experimentos — HALO Predicciones

---

## EXP-001
- **Fecha:** YYYY-MM-DD
- **Responsable:** Nombre
- **Hipótesis:** "Prophet con estacionalidad semanal tendrá MAPE < 15%"
- **Configuración:**
  - changepoint_prior_scale: 0.05
  - seasonality_mode: 'multiplicative'
  - Datos: X días sintéticos, Y zonas
- **Resultado:** MAPE = X% → ✅ Confirmada / ❌ Rechazada
- **Hallazgo clave:** ...
- **Decisión tomada como consecuencia:** ...
- **Commit de referencia:** `abc1234`
```

> ⚠️ **Importante:** Los experimentos fallidos son evidencia igual de valiosa que los exitosos.
> Documentar un fracaso demuestra rigor científico — no ocultarlo.

**Acción 4.3 — Crear `README.md` con sección de Reproducibilidad**

```markdown
## 🔁 Reproducibilidad del Pipeline de Predicciones

### Prerrequisitos
- Python 3.11+
- Docker Desktop (para Lambda Container local)

### Pasos para reproducir localmente

1. Generar datos sintéticos:
   python prediction-service/scripts/generate_synthetic_data.py

2. Ejecutar EDA:
   python prediction-service/notebooks/01_eda.py

3. Entrenar modelos y evaluar:
   python prediction-service/handler.py --mode local

4. Ver métricas generadas en:
   prediction-service/output/metrics_YYYY-MM-DD.json
```

---

## EC-5 — Trazabilidad y Repositorio (CRISP-ML + Scrum)

### Estado actual

El repositorio tiene una buena estructura de specs y tareas. El [`team_charter.md`](./team_charter.md)
define el proceso de PRs y la transparencia con IA. Sin embargo, el marco CRISP-ML(Q) no
está declarado explícitamente y falta el `README.md` principal.

### Brechas detectadas

#### 🔴 BRECHA 5.1 — No hay `README.md` en la raíz del repositorio

Es el **primer artefacto que lee cualquier evaluador**. Su ausencia genera una pésima
primera impresión académica y dificulta la navegación del repositorio.

#### 🟡 BRECHA 5.2 — CRISP-ML(Q) no está mapeado al proyecto

El proceso de desarrollo sigue implícitamente CRISP-ML, pero no está declarado. Un
evaluador que busque evidencia del ciclo de vida del proyecto no lo encontrará fácilmente.

### Recomendaciones

**Acción 5.1 — Crear `README.md` en la raíz del repo**

Secciones obligatorias del README:

```markdown
# HALO v2 — Plataforma Inteligente de Gestión de Emergencias Urbanas

## 📌 Descripción del Proyecto
## 🎯 Product Goal
## 👥 Equipo (con roles)
## 🏗️ Arquitectura General (diagrama de alto nivel)
## 📦 Módulos del Sistema
   - Chatbot en Tiempo Real (WebSocket + Lambda)
   - Predicción de Hotspots (Prophet + ARIMA)
   - App Móvil (React Native + Expo)
## 🗺️ CRISP-ML(Q) — Fases del Proyecto
## 📊 Métricas de Éxito
## 🔁 Reproducibilidad del Pipeline
## 📁 Estructura del Repositorio (árbol de carpetas)
## 🔗 Documentación Clave (tabla con todos los links)
## 🚀 Estado Actual (tabla de progreso por módulo)
## ⚖️ Declaración Transparente de Uso de IA
```

**Acción 5.2 — Agregar tabla CRISP-ML(Q) al `project_context.md`**

| Fase CRISP-ML(Q) | Artefacto(s) | Estado |
|---|---|:---:|
| 1. Comprensión del Negocio | `problem_statement.md`, `product_goal.md` | ❌ Pendiente |
| 2. Comprensión de los Datos | `data_ecosystem.md`, `01_eda.py` | ❌ Pendiente |
| 3. Preparación de los Datos | `transform.py`, reglas en `data_ecosystem.md` | ❌ Pendiente |
| 4. Modelado | `prophet_model.py`, `arima_model.py` | ❌ Pendiente |
| 5. Evaluación | `evaluator.py`, `experiment_log.md`, `baseline.md` | ❌ Pendiente |
| 6. Despliegue | Lambda Container Image, EventBridge cron | ❌ Pendiente |

---

## Plan de Acción Priorizado

Todos los artefactos a crear, ordenados por impacto en la evaluación:

| Prioridad | Artefacto a Crear | EC Cubierto | Responsable sugerido | Sprint |
|:---:|---|:---:|---|:---:|
| 🔴 1 | `README.md` (raíz del repo) | EC-5 | Todo el equipo | Sprint 0 |
| 🔴 2 | `docs/problem_statement.md` | EC-1 | Sergio + Kael | Sprint 0 |
| 🔴 3 | `docs/baseline.md` | EC-4 | Kael + Christhian | Sprint 0 |
| 🔴 4 | `docs/data_ecosystem.md` | EC-2 | Kael | Sprint 0 |
| 🔴 5 | `docs/experiment_log.md` | EC-4 | Christhian | Sprint 1 |
| 🟡 6 | `prediction-service/notebooks/01_eda.py` | EC-2 | Kael + Christhian | Sprint 1 |
| 🟡 7 | `docs/risk_register.md` | EC-3 | Alan | Sprint 0 |
| 🟡 8 | Diagramas C4 Mermaid en `design.md` | EC-3 | Sergio | Sprint 1 |
| 🟢 9 | Tabla CRISP-ML(Q) en `project_context.md` | EC-5 | Todo el equipo | Sprint 0 |

---

## Checklist de Verificación Final

Antes de la entrega del proyecto, verificar que todos estos ítems estén ✅:

### EC-1 — Formulación del Problema
- [ ] `docs/problem_statement.md` creado con stakeholders y métricas SMART por módulo
- [ ] `docs/product_goal.md` expandido con hipótesis de valor cuantificables
- [ ] Alcance IN/OUT documentado explícitamente (qué resuelve y qué excluye)

### EC-2 — Ecosistema de Datos
- [ ] `docs/data_ecosystem.md` con inventario completo de fuentes y campos
- [ ] Script/notebook de EDA con gráficas generadas y exportadas
- [ ] `docs/eda_summary.md` con hallazgos clave del EDA
- [ ] Restricciones de privacidad/PII documentadas
- [ ] Estrategia de datos sintéticos justificada formalmente

### EC-3 — Arquitectura y Gestión de Riesgos
- [ ] Diagramas C4 niveles 1 y 2 en Mermaid dentro de `design.md`
- [ ] 6 ADRs con alternativas evaluadas y descartadas ✅ (ya existen, verificar contenido)
- [ ] `docs/risk_register.md` con tabla de riesgos, probabilidad, impacto y estado activo

### EC-4 — Línea Base y Evidencia Reproducible
- [ ] `docs/baseline.md` con modelos naive y métricas objetivo definidas
- [ ] `docs/experiment_log.md` con al menos 1 experimento documentado (exitoso o fallido)
- [ ] Pipeline reproducible documentado paso a paso en `README.md`
- [ ] Al menos 1 hipótesis rechazada documentada (evidencia de rigor científico)

### EC-5 — Trazabilidad y Repositorio
- [ ] `README.md` creado en la raíz con todas las secciones obligatorias
- [ ] Sección CRISP-ML(Q) visible en `README.md` o `project_context.md`
- [ ] Commits con mensajes descriptivos (`feat:`, `fix:`, `docs:`, `chore:`)
- [ ] Al menos 1 PR cerrado con descripción, evidencia y declaración de uso de IA
- [ ] ClickUp actualizado: tareas de documentación incluidas en un Sprint con criterios de aceptación

---

## Nota sobre Declaración de Uso de IA

De acuerdo con el [`team_charter.md`](./team_charter.md), cualquier artefacto generado con
asistencia de IA debe declararlo. Este documento fue generado con asistencia de **Antigravity**
(Google DeepMind) en sesión del **16/09/2026**, revisado por el equipo antes de su
incorporación al repositorio.

---

*Última actualización: 16/09/2026 — Análisis inicial de brechas post-kickoff*
*Próxima revisión: Al cierre del Sprint 0*
