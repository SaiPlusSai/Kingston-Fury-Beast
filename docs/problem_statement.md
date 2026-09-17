# Formulación del Problema — HALO v2
## Proyecto Integrador | Taller de Sistemas Inteligentes

> **Declaración de IA:** Este documento fue elaborado con asistencia de Antigravity (Google DeepMind) el 16/09/2026 y revisado por el equipo antes de su incorporación al repositorio.

---

## 1. Contexto del Problema

Las ciudades latinoamericanas enfrentan una brecha crítica en la gestión de emergencias e incidentes urbanos: los ciudadanos no tienen canales eficientes para reportar incidentes, las autoridades carecen de visibilidad en tiempo real del estado de los reportes, y los administradores toman decisiones reactivas en lugar de preventivas porque no existen herramientas que anticipen dónde ocurrirán los próximos incidentes.

La plataforma **HALO (Urban Shield)** ya resuelve la gestión básica de incidentes mediante una aplicación web y un backend serverless en AWS. Sin embargo, la plataforma tiene tres limitaciones concretas que este proyecto integrador aborda:

1. **Canales de consulta limitados:** No existe un canal de asistencia en tiempo real; los ciudadanos deben navegar por la interfaz completa para obtener información básica.
2. **Acceso exclusivo vía web:** No existe versión móvil, excluyendo a usuarios que reportarían incidentes desde el lugar usando su teléfono.
3. **Gestión reactiva:** Las autoridades responden a incidentes ya ocurridos. No hay un modelo predictivo que anticipe zonas de riesgo.

---

## 2. Declaración del Problema (Problem Statement)

> **"Los ciudadanos y autoridades de gestión de emergencias urbanas carecen de: (a) un canal conversacional en tiempo real para consultar el estado de incidentes y reportar emergencias, (b) acceso móvil nativo a la plataforma, y (c) capacidad predictiva estadística para anticipar zonas de riesgo (hotspots), lo que resulta en tiempos de respuesta subóptimos y toma de decisiones puramente reactiva."**

---

## 3. Stakeholders

### Matriz Poder–Interés

| Stakeholder | Rol | Interés Principal | Poder | Influencia | Estrategia |
|---|---|---|:---:|:---:|---|
| **Ciudadano** | Usuario final que reporta incidentes | Reportar rápido desde el celular, consultar estado de su reporte | Bajo | Alto | Gestionar de cerca: UX simple |
| **Autoridad / Agente de seguridad** | Gestiona y atiende los reportes | Ver mapa en tiempo real, recibir alertas predictivas | Medio | Alto | Gestionar de cerca: Dashboard |
| **Administrador HALO** | Opera y configura la plataforma | Estabilidad del sistema, métricas del chatbot, precisión de predicciones | Alto | Alto | Gestionar de cerca: KPIs y logs |
| **Equipo de desarrollo** | Implementa la solución | Claridad en requisitos, arquitectura limpia | Alto | Alto | Stakeholder interno |
| **Docente evaluador** | Evalúa el proyecto académico | Cumplimiento de EC, rigor metodológico, evidencia reproducible | Alto | Alto | Gestionar activamente |

### Requisitos por Stakeholder

| Stakeholder | Requisitos Principales |
|---|---|
| Ciudadano | Chat accesible desde web y móvil; crear reporte por chat; consultar estado por chat |
| Autoridad | Dashboard con mapa predictivo de hotspots; visualización de tendencias por zona |
| Administrador | Métricas del chatbot (intenciones detectadas, % éxito); precisión del modelo Prophet |
| Docente evaluador | Baseline documentado, experimentos registrados, CRISP-ML(Q) visible, ADRs justificados |

---

## 4. Alcance del Sistema

### ✅ IN SCOPE — Qué resuelve este proyecto

- **Chatbot en tiempo real (WebSocket):** 6 intenciones: saludo, ayuda, FAQ, estado de reporte, crear reporte, fallback. Disponible en web y app móvil.
- **Predicción de hotspots:** Pipeline Python con Prophet (modelo principal) y ARIMA/SARIMA (modelo comparativo). Entrena 1 vez/día con histórico de ReportsTable. Genera predicciones por zona para los próximos 7 días.
- **Dashboard de predicciones:** Visualización de Predicción vs. Realidad (Recharts), mapa de calor predictivo (MapLibre), tabla comparativa de métricas.
- **App móvil (React Native + Expo):** Las 14 pantallas definidas en la spec. Consume la misma API REST y WebSocket del backend existente.
- **Datos sintéticos para entrenamiento inicial:** Script que genera 365 días de datos históricos realistas para 5+ zonas geográficas.

### ❌ OUT OF SCOPE — Qué excluye explícitamente

- No se implementará NLP avanzado (AWS Lex, GPT) en la Fase 1. El chatbot usa regex + keywords.
- No se desplegará en producción real en AWS (el presupuesto es académico; se trabajará con serverless-offline y datos sintéticos localmente).
- No se gestionará el registro de nuevos usuarios administradores (Cognito Admin flow queda fuera).
- No se implementará video o transmisión en vivo de incidentes.
- No se integrarán fuentes de datos externas (policía, bomberos, meteorología).
- La app móvil no incluirá modo de accesibilidad (WCAG) en esta versión.

---

## 5. Métricas de Éxito (SMART)

### Módulo de Predicción (IA — Núcleo del Proyecto)

| ID | Métrica | Objetivo | Cómo medirlo | Plazo |
|---|---|---|---|---|
| M-P01 | **MAPE del modelo Prophet** | ≤ 15% en el conjunto de validación (holdout 20%) | evaluator.py → metrics_YYYY-MM-DD.json | Al completar la Fase 2 |
| M-P02 | **RMSE de Prophet vs. mejor baseline** | Reducción ≥ 20% frente al mejor modelo baseline | Tabla comparativa en aseline.md | Al completar la Fase 2 |
| M-P03 | **Tiempo de ejecución del pipeline** | ≤ 10 minutos por corrida completa | CloudWatch Logs → duración de Lambda | Al completar la Fase 2 |
| M-P04 | **Predicciones disponibles en S3** | Disponibles ≤ 5 min después de que el cron dispare | CloudWatch Events → timestamp | Al completar la Fase 2 |
| M-P05 | **R² del modelo Prophet** | ≥ 0.65 promedio por zona | evaluator.py | Al completar la Fase 2 |

### Módulo de Chatbot

| ID | Métrica | Objetivo | Cómo medirlo | Plazo |
|---|---|---|---|---|
| M-C01 | **Precisión de detección de intenciones** | ≥ 90% en suite de pruebas (60 casos cubiertos) | Test suite Jest en chatbot.test.js | Al completar la Fase 1 |
| M-C02 | **Latencia de respuesta (P95)** | ≤ 2 segundos desde envío hasta respuesta | CloudWatch + X-Ray | Al completar la Fase 1 |
| M-C03 | **Flujo de creación de reporte por chat** | Tasa de completitud ≥ 80% de sesiones iniciadas | DynamoDB ChatSessionsTable → estados DONE vs CANCELLED | Al completar la Fase 1 |

### Módulo App Móvil

| ID | Métrica | Objetivo | Cómo medirlo | Plazo |
|---|---|---|---|---|
| M-M01 | **Pantallas implementadas** | 14/14 pantallas del spec completadas y funcionales | Review manual + checklist del spec | Al completar la Fase 5 |
| M-M02 | **Tiempo de carga inicial** | ≤ 3 segundos en condiciones normales | Flipper performance monitor | Al completar la Fase 5 |

---

## 6. Hipótesis de Valor

| ID | Hipótesis | Indicador de Verificación |
|---|---|---|
| H-01 | Si implementamos un chatbot de consulta rápida, el tiempo promedio que un ciudadano tarda en obtener el estado de su reporte se reducirá de ~3 min (navegar UI) a ≤ 30 seg (consulta por chat). | Comparación de flujo UI vs. flujo chat en prueba de usuario |
| H-02 | Si Prophet entrenado con el histórico de incidentes tiene MAPE ≤ 15%, entonces las autoridades podrán asignar recursos preventivamente 24h antes en las zonas predichas. | Validación de MAPE en holdout set |
| H-03 | Si existe una app móvil nativa, la tasa de reportes desde dispositivos móviles aumentará (vs. solo web responsive). | Comparación de user-agent logs antes y después |

---

## 7. Definición de "Éxito del Proyecto"

El proyecto se considera **exitoso académicamente** si:
1. El pipeline de predicción supera al baseline naive en al menos 20% de RMSE (M-P02).
2. El chatbot clasifica correctamente ≥ 90% de las intenciones de la suite de pruebas (M-C01).
3. Todos los artefactos de CRISP-ML(Q) están documentados (EDA, baseline, experimentos, evaluación).
4. Existe al menos 1 experimento documentado con resultado negativo como evidencia de proceso científico.
5. El código del pipeline es reproducible con un solo comando desde un entorno limpio.

---

*Última actualización: 16/09/2026 — Versión inicial*
*Autores: Equipo HALO | Asistencia de IA: Antigravity (Google DeepMind)*
