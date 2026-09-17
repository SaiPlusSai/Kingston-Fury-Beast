# Formulación del Problema — HALO v2
## Proyecto Integrador | Taller de Sistemas Inteligentes (SIS-352)

> **Declaración de IA y Verificación Humana (Fase 2):** Documento elaborado con asistencia de Antigravity (Google DeepMind) y sometido a verificación técnica y auditoría humana por el equipo según el protocolo en [declaracion_ia_evidencia_humana.md](declaracion_ia_evidencia_humana.md).

---

## 1. Contexto del Problema

Las ciudades latinoamericanas enfrentan una brecha crítica en la gestión de emergencias e incidentes urbanos: los ciudadanos no tienen canales eficientes para reportar incidentes, las autoridades carecen de visibilidad en tiempo real del estado de los reportes, y los administradores toman decisiones reactivas en lugar de preventivas porque no existen herramientas que anticipen dónde ocurrirán los próximos incidentes.

La plataforma **HALO (Urban Shield)** ya resuelve la gestión básica de incidentes mediante una aplicación web (React 19) y un backend serverless en AWS (Node.js/Express en Lambda). Sin embargo, la plataforma presenta tres limitaciones funcionales y operativas que este proyecto integrador aborda:

1. **Canales de consulta limitados y lentos:** No existe un canal de asistencia en tiempo real; los ciudadanos deben navegar por la interfaz web completa para obtener información básica de sus casos.
2. **Acceso exclusivo vía web:** No existe versión móvil nativa, excluyendo a usuarios que requieren reportar incidentes directamente en el lugar de los hechos.
3. **Gestión reactiva sin anticipación:** Las autoridades responden a incidentes ya ocurridos. No hay un modelo predictivo que anticipe zonas de riesgo (hotspots) para patrullaje preventivo.
4. **Vulnerabilidades de arquitectura y seguridad:** Exposición a riesgos OWASP API Security (BOLA/IDOR), necesidad de autenticación dual robusta (Cognito + JWT local) y resguardo estricto de la privacidad ciudadana mediante minimización de datos.

---

## 2. Declaración del Problema (Problem Statement)

> **"Los ciudadanos y autoridades de gestión de emergencias urbanas carecen de: (a) un canal conversacional en tiempo real para consultar el estado de incidentes y reportar emergencias, (b) acceso móvil nativo a la plataforma, (c) capacidad predictiva estadística para anticipar zonas de riesgo (hotspots) con modelos reproducibles, y (d) un diseño de arquitectura y seguridad estandarizado (C4, ADRs, Security by Design) que garantice la integridad y privacidad de la información; lo que resulta en tiempos de respuesta subóptimos, toma de decisiones puramente reactiva y riesgos operativos en el manejo de incidentes."**

---

## 3. Stakeholders

### Matriz Poder–Interés

| Stakeholder | Rol | Interés Principal | Poder | Influencia | Estrategia |
|---|---|---|:---:|:---:|---|
| **Ciudadano** | Usuario final que reporta incidentes | Reportar rápido desde el celular, consultar estado de su reporte vía chat sin fricción | Bajo | Alto | Gestionar de cerca: UX simple y accesible |
| **Autoridad / Agente de seguridad** | Gestiona y atiende los reportes | Ver mapa en tiempo real, recibir alertas predictivas de hotspots | Medio | Alto | Gestionar de cerca: Dashboard analítico |
| **Administrador HALO** | Opera y configura la plataforma | Estabilidad del sistema, métricas del chatbot, seguridad perimetral y precisión de predicciones | Alto | Alto | Gestionar de cerca: KPIs, logs y auditoría |
| **Equipo de desarrollo** | Implementa la solución | Claridad en requisitos, arquitectura C4 coherente, ADRs justificados y proceso Scrum | Alto | Alto | Stakeholder interno: Team Charter y DoD |
| **Docente evaluador** | Evalúa el proyecto académico | Cumplimiento de EC-1 a EC-5, rigor metodológico CRISP-ML(Q), baseline reproducible y uso ético de IA | Alto | Alto | Gestionar activamente: Evidencia en vivo |

### Requisitos por Stakeholder

| Stakeholder | Requisitos Principales | Trazabilidad Arquitectónica |
|---|---|---|
| Ciudadano | Chat accesible desde web y móvil; crear reporte por chat; consultar estado por chat con privacidad | ADR-001, ADR-003, ADR-004 |
| Autoridad | Dashboard con mapa predictivo de hotspots; visualización de tendencias por zona a 7 días | ADR-005, ADR-006, C4-03-03 |
| Administrador | Métricas del chatbot; control de acceso RBAC; auditoría de seguridad y logs centralizados | ADR-002, ADR-008, Security by Design |
| Docente evaluador | Baseline documentado, 10 ADRs, C4 en 4 niveles, experiment log activo, verificación humana de IA demostrable | ADR-001 a ADR-010, C4-01 a C4-04 |

---

## 4. Alcance del Sistema

### ✅ IN SCOPE — Qué resuelve este proyecto

- **Chatbot en tiempo real (WebSocket):** 6 intenciones: saludo, ayuda, FAQ, estado de reporte, crear reporte, fallback. Motor determinístico Regex + FSM (ADR-004).
- **Predicción de hotspots:** Pipeline Python con Prophet (modelo principal) y ARIMA/SARIMA (modelo comparativo). Entrena 1 vez/día con histórico de DynamoDB ReportsTable. Genera predicciones por zona para los próximos 7 días en inferencia batch nocturna (ADR-005).
- **Dashboard de predicciones:** Visualización de Predicción vs. Realidad (Recharts), mapa de calor predictivo (MapLibre), tabla comparativa de métricas.
- **App móvil (React Native + Expo Bare Workflow):** Las 14 pantallas definidas en la spec. Consume la misma API REST y WebSocket del backend existente (ADR-003, ADR-007).
- **Datos sintéticos para entrenamiento inicial:** Script con `random_seed=42` que genera 365 días de datos históricos realistas para 5+ zonas (ADR-010).
- **Arquitectura y Gobernanza Formal:** Modelo C4 documentado en sus 4 niveles (Contexto, Contenedores, Componentes, Código) y 10 Registros de Decisiones de Arquitectura (ADR-001 a ADR-010).
- **Seguridad desde el Diseño (Security by Design):** Mitigación de OWASP Top 10 API (BOLA/IDOR), autenticación dual Cognito/JWT local (ADR-008), subida directa a S3 vía pre-signed URLs (ADR-009) y encriptación en tránsito y reposo.
- **Uso Transparente de IA (Fase 2):** Protocolo Human-in-the-Loop con Matriz de Evidencia de Revisión Humana auditable.

### ❌ OUT OF SCOPE — Qué excluye explícitamente

- No se implementará NLP pesado en la nube comercial (AWS Lex, OpenAI GPT) en la Fase 1 para no incurrir en costos por token.
- No se desplegará en producción real de pago en AWS durante esta fase (presupuesto académico; ejecución offline/local).
- No se integrarán bases de datos externas de la policía ni servicios meteorológicos de terceros.
- No se transmitirá video o streaming en vivo de incidentes.
- La app móvil no incluirá modo de accesibilidad WCAG avanzado en esta versión.

---

## 5. Métricas de Éxito (SMART)

### 5.1 Módulo de Predicción (IA — Núcleo del Proyecto)

| ID | Métrica | Objetivo | Cómo medirlo | Plazo |
|---|---|---|---|---|
| M-P01 | **MAPE del modelo Prophet** | ≤ 15% en el conjunto de validación (holdout 20%) | `evaluator.py` → `metrics_YYYY-MM-DD.json` | Sprint 1 |
| M-P02 | **RMSE de Prophet vs. mejor baseline** | Reducción ≥ 20% frente al mejor modelo baseline | Tabla comparativa en `baseline.md` | Sprint 1 |
| M-P03 | **Tiempo de ejecución del pipeline** | ≤ 10 minutos por corrida completa | CloudWatch Logs / ejecución local | Sprint 1 |
| M-P04 | **Predicciones disponibles en S3/Cache** | Disponibles ≤ 5 min después de que el cron dispare | Timestamp de archivo generado | Sprint 1 |
| M-P05 | **R² del modelo Prophet** | ≥ 0.65 promedio por zona | `evaluator.py` | Sprint 1 |

### 5.2 Módulo de Chatbot

| ID | Métrica | Objetivo | Cómo medirlo | Plazo |
|---|---|---|---|---|
| M-C01 | **Precisión de detección de intenciones** | ≥ 90% en suite de pruebas (60 casos cubiertos) | Test suite Jest en `chatbot.test.js` | Sprint 1 |
| M-C02 | **Latencia de respuesta (P95)** | ≤ 2 segundos desde envío hasta respuesta | CloudWatch / logs de WebSocket | Sprint 1 |
| M-C03 | **Flujo de creación de reporte por chat** | Tasa de completitud ≥ 80% de sesiones iniciadas | DynamoDB ChatSessionsTable → DONE vs CANCELLED | Sprint 1 |

### 5.3 Módulo App Móvil

| ID | Métrica | Objetivo | Cómo medirlo | Plazo |
|---|---|---|---|---|
| M-M01 | **Pantallas implementadas** | 14/14 pantallas del spec completadas y funcionales | Review manual + checklist del spec | Sprint 2 |
| M-M02 | **Tiempo de carga inicial** | ≤ 3 segundos en condiciones normales | Flipper / Expo performance monitor | Sprint 2 |

### 5.4 Arquitectura, Seguridad y Gobernanza de IA

| ID | Métrica | Objetivo | Cómo medirlo | Plazo |
|---|---|---|---|---|
| M-A01 | **Cobertura de Decisiones de Arquitectura** | 10 ADRs formalizados con alternativas descartadas | Carpeta `docs/Arquitectura y Seguridad/ADR/` | Cumplido |
| M-A02 | **Nivel de detalle del Modelo C4** | 4 niveles completos (Contexto, Contenedores, Componentes, Código) | Carpeta `docs/Arquitectura y Seguridad/C4/` | Cumplido |
| M-S01 | **Cero Secretos Expuestos** | 0 llaves de API, tokens o credenciales en git | Escaneo automatizado / revisión manual | Permanente |
| M-S02 | **Mitigación BOLA/IDOR (OWASP API1)** | 100% de endpoints protegidos por validación de ownership | Pruebas de servicio en backend | Sprint 1 |
| M-IA01 | **Verificación Humana Demostrable (Fase 2)** | 100% de intervenciones de IA con evidencia en Matriz HITL | `docs/declaracion_ia_evidencia_humana.md` | Cumplido |

---

## 6. Hipótesis de Valor

| ID | Hipótesis | Indicador de Verificación |
|---|---|---|
| H-01 | Si implementamos un chatbot de consulta rápida, el tiempo promedio que un ciudadano tarda en obtener el estado de su reporte se reducirá de ~3 min a ≤ 30 seg. | Comparación de flujo UI vs. flujo chat en prueba de usuario |
| H-02 | Si Prophet entrenado con el histórico de incidentes tiene MAPE ≤ 15%, entonces las autoridades podrán asignar recursos preventivamente 24h antes en las zonas predichas. | Validación de MAPE en holdout set (73 días) |
| H-03 | Si existe una app móvil nativa, la tasa de reportes desde dispositivos móviles aumentará significativamente frente a solo web responsive. | Logs de user-agent en peticiones de reportes |
| H-04 | Si la arquitectura aplica Security by Design y minimización de datos (grid 500m), se protege la identidad ciudadana sin perder resolución analítica para las autoridades. | Auditoría de payloads y cumplimiento GDPR |

---

## 7. Definición de "Éxito del Proyecto" (Criterios de Cierre)

El proyecto se considera **exitoso integralmente** si:
1. El pipeline de predicción supera al baseline naive en al menos 20% de RMSE (M-P02).
2. El chatbot clasifica correctamente ≥ 90% de las intenciones de la suite de pruebas (M-C01).
3. Todos los artefactos de CRISP-ML(Q) están documentados (EDA, baseline, experimentos, evaluación).
4. La arquitectura C4 en 4 niveles y los 10 ADRs justifican cada componente frente al docente.
5. El análisis de seguridad demuestra mitigaciones concretas contra OWASP API Top 10.
6. El uso de IA está respaldado por la Matriz de Verificación Humana (Fase 2), demostrando que el equipo domina técnicamente la totalidad del sistema.

---

*Última actualización: 17/09/2026 — Versión 2.0 (Actualizada con Arquitectura, Seguridad y Gobernanza de IA)*  
*Autores: Equipo HALO (Sergio Arias, Alan Flores, Kael Lopez, Christhian Coronel) | Asistencia de IA: Antigravity*
