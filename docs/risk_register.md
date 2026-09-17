# Registro de Riesgos — HALO v2
## Proyecto Integrador | Taller de Sistemas Inteligentes

> **Propósito:** Registro formal y activo de todos los riesgos técnicos, de datos y de IA identificados. Debe revisarse en cada Sprint Review y actualizarse con el estado real de cada riesgo.
>
> **Scoring:** Probabilidad × Impacto (escala 1–3 cada uno, máximo 9).
>
> **Declaración de IA:** Documento generado con asistencia de Antigravity (Google DeepMind) el 16/09/2026.

---

## Resumen Ejecutivo de Riesgos

| Total | Críticos 🔴 | Activos 🟡 | Mitigados 🟢 | Cerrados ⚫ |
|:---:|:---:|:---:|:---:|:---:|
| 10 | 2 | 4 | 4 | 0 |

---

## Tabla de Riesgos

### Riesgos de IA / Modelo

| ID | Categoría | Riesgo | Prob | Impacto | Score | Mitigación | Dueño | Estado | Fecha |
|---|---|---|:---:|:---:|:---:|---|---|:---:|---|
| R-01 | IA — Modelo | **Sobreajuste de Prophet a datos sintéticos:** El modelo aprende los patrones perfectos del generador y falla con datos reales | Alta (3) | Alto (3) | **9/9** | Usar holdout temporal estricto (73 días). Documentar MAPE esperado en aseline.md. Agregar ruido (15%) en generación | Kael + Christhian | 🔴 Crítico | 16/09/2026 |
| R-02 | IA — Datos | **Datos sintéticos no representan patrones reales:** El generador inyecta estacionalidad perfecta que no existe en datos urbanos reales | Alta (3) | Alto (3) | **9/9** | Documentar explícitamente como limitación en data_ecosystem.md. Comparar con al menos 1 fuente pública real si hay tiempo | Kael | 🔴 Crítico | 16/09/2026 |
| R-03 | IA — Modelo | **ARIMA auto selecciona orden incorrecto (p,d,q):** pmdarima puede fallar en series cortas o con outliers extremos | Media (2) | Medio (2) | **4/9** | Fijar rango de búsqueda: max_p=5, max_q=5. Usar criterio AIC para selección. Tener configuración manual de fallback | Christhian | 🟡 Activo | 16/09/2026 |
| R-04 | IA — Evaluación | **MAPE engañoso cuando y≈0:** Zonas con muy pocos incidentes generan MAPE infinito o extremo | Media (2) | Medio (2) | **4/9** | Usar sMAPE (symmetric MAPE) o excluir días con y=0 del cálculo. Documentar en evaluator.py | Kael | 🟡 Activo | 16/09/2026 |

### Riesgos de Infraestructura / Técnicos

| ID | Categoría | Riesgo | Prob | Impacto | Score | Mitigación | Dueño | Estado | Fecha |
|---|---|---|:---:|:---:|:---:|---|---|:---:|---|
| R-05 | Infra — Lambda | **Cold start de 15–30 seg en Lambda Container (Prophet):** Primera invocación después de inactividad falla el timeout del EventBridge | Media (2) | Alto (3) | **6/9** | Configurar timeout Lambda = 15 min. Warm-up lambda con EventBridge 5 min antes del cron real. El cold start no impacta al usuario (es batch nocturno) | Christhian | 🟡 Activo | 16/09/2026 |
| R-06 | Infra — WebSocket | **WebSocket API Gateway timeout de 29 seg:** Flujos de chat largos (crear reporte) pueden exceder el timeout de la conexión activa | Baja (1) | Medio (2) | **2/9** | Implementar chunking de respuestas largas. Implementar keepalive (ping cada 5 min desde cliente). Documentado en ADR-001 | Alan | 🟢 Mitigado | 16/09/2026 |
| R-07 | Infra — Docker | **Imagen Docker de Python + Prophet + ARIMA supera límites de ECR:** Si la imagen comprimida excede 10GB, no se puede subir a Lambda | Baja (1) | Alto (3) | **3/9** | Usar imagen base public.ecr.aws/lambda/python:3.11-slim. Instalar solo dependencias mínimas. Target: imagen < 2GB. Documentado en ADR-004 | Christhian | 🟢 Mitigado | 16/09/2026 |
| R-08 | Infra — DynamoDB | **Costos de lectura de DynamoDB en extracción diaria:** Un scan completo de ReportsTable con 50k+ items puede generar costos altos | Baja (1) | Medio (2) | **2/9** | Usar GSI por createdAt con filtro de fecha (últimos 365 días). Nunca hacer full table scan | Kael | 🟢 Mitigado | 16/09/2026 |

### Riesgos de Proceso / Académicos

| ID | Categoría | Riesgo | Prob | Impacto | Score | Mitigación | Dueño | Estado | Fecha |
|---|---|---|:---:|:---:|:---:|---|---|:---:|---|
| R-09 | Proceso | **Deuda técnica de documentación al final del semestre:** El equipo completa el código pero no actualiza project_context.md, experiment_log.md ni el README.md | Alta (3) | Medio (2) | **6/9** | Definition of Done incluye obligatoriamente: actualizar project_context.md antes de cerrar cualquier tarea. Revisión en Sprint Review | Todo el equipo | 🟡 Activo | 16/09/2026 |
| R-10 | Proceso | **Alcance descontrolado (scope creep):** El equipo intenta agregar NLP avanzado (AWS Lex, GPT) fuera del alcance definido | Media (2) | Alto (3) | **6/9** | El alcance está explícitamente definido como OUT OF SCOPE en problem_statement.md. Product Owner (Sergio) decide cualquier cambio de alcance | Sergio | 🟢 Mitigado | 16/09/2026 |

---

## Matriz Visual de Riesgos (Probabilidad × Impacto)

`
IMPACTO
 Alto  │ R-07🟢  R-05🟡  R-01🔴 R-02🔴
       │         R-10🟢  R-09🟡
Medio  │ R-06🟢  R-03🟡  
       │ R-08🟢  R-04🟡  
 Bajo  │         
       └─────────────────────────────────
         Baja    Media    Alta      PROBABILIDAD
`

---

## Plan de Contingencia para Riesgos Críticos

### R-01 y R-02 — Sobreajuste / Datos Sintéticos No Representativos

Si tras ejecutar EXP-001 el MAPE supera el 30% (el doble del umbral):

**Plan A:** Ajustar los parámetros del generador de datos sintéticos para añadir más ruido y menos estacionalidad perfecta.

**Plan B:** Buscar y usar un dataset público de incidentes urbanos para La Paz (ej. datos del ONSC - Observatorio Nacional de Seguridad Ciudadana de Bolivia, informes del GAMLP - Gobierno Autónomo Municipal de La Paz, o datos abiertos del INE Bolivia con licencia abierta).

**Plan C (fallback académico):** Documentar el resultado como hallazgo válido. La hipótesis queda rechazada y se analiza por qué Prophet no mejora sobre el baseline con datos sintéticos perfectos.

> ⚠️ El Plan C **nunca es un fracaso académico** — es evidencia de proceso científico riguroso. Se documenta en experiment_log.md y se incluye en la presentación final.

---

## Historial de Cambios del Registro

| Fecha | Cambio | Autor |
|---|---|---|
| 16/09/2026 | Creación inicial con 10 riesgos identificados | Alan Flores + Antigravity |

---

*Última actualización: 16/09/2026 — Versión inicial*
*Autor: Alan Flores (Proceso) | Asistencia de IA: Antigravity (Google DeepMind)*
