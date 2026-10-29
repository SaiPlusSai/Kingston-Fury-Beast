# Log de Experimentos — Módulo de Predicción HALO v2
## Proyecto Integrador | Taller de Sistemas Inteligentes

> **Propósito:** Registro cronológico de todos los experimentos ejecutados durante el desarrollo del modelo predictivo. Los experimentos fallidos tienen el mismo valor académico que los exitosos — documentar un fracaso demuestra rigor científico y guía las decisiones siguientes.
>
> **Regla de oro:** Nunca eliminar un experimento de este log. Marcar como ❌ Rechazada y documentar la causa.
>
> **Declaración de IA:** Plantilla generada con asistencia de Antigravity (Google DeepMind) el 16/09/2026. Resultados de EXP-000 a EXP-003, hallazgos H-1 a H-4 y la sección de evidencia añadidos el 29/10/2026 con asistencia de Claude Code.

---

## Índice de Experimentos

| ID | Hipótesis (resumen) | Resultado | Fecha |
|---|---|:---:|---|
| EXP-000 | Definición de baseline — mejor baseline: media estacional por día de la semana | ✅ Referencia | 16/09/2026 (resultados 29/10/2026) |
| EXP-001 | Prophet con la configuración del evaluador alcanza MAPE ≤ 15 % y RMSE −20 % | ❌ Rechazada | 29/10/2026 |
| EXP-002 | Prophet con changepoint 0.01 y estacionalidad multiplicativa reduce el MAPE ≥ 5 pp | ❌ Rechazada | 29/10/2026 |
| EXP-003 | Prophet supera a ARIMA en RMSE ≥ 20 % (ADR-002) | ⚠️ ADR-002 revisado | 29/10/2026 |
| EXP-004 | Regresor de feriados (`is_holiday`) en Prophet | ⏳ Propuesto, no ejecutado | — |

---

## EXP-000 — Definición de Baseline (Referencia)

> **Tipo:** Experimento de referencia. No es un experimento de IA, sino el punto de partida obligatorio.

- **Fecha:** 16/09/2026 (definición); 29/10/2026 (resultados)
- **Responsable:** Kael Lopez + Christhian Coronel
- **Fase CRISP-ML(Q):** Evaluación (Paso 5)

### Hipótesis
> "Los modelos baseline (Naive, Media Móvil, Media Estacional, ARIMA) establecen el límite mínimo de desempeño que Prophet debe superar para justificar su complejidad."

### Configuración
- **Dataset:** `synthetic_lapaz_v1.csv` (DVC, md5 `ffed625750ae8b223299ffb50d0ca499`): 10,000 incidentes, 7 macrodistritos, 1,096 días por zona.
- **Split:** holdout de 73 días (20 %) como protocolo principal y de 14 días como control (`test_size` por defecto del evaluador).
- **Modelos evaluados:** Naive, Media móvil 7d, Media estacional por día de la semana, ARIMA(1,1,1).

### Resultado
Tablas completas en `baseline.md`, sección 4. Resumen (holdout de 73 días, RMSE):

| Modelo | RMSE | MAE | MAPE (%) | R² |
|---|:---:|:---:|:---:|:---:|
| Naive | 1.7208 | 1.4423 | 82.28 | -1.6111 |
| Media móvil 7d | 1.1180 | 0.9164 | 51.81 | -0.1304 |
| **Media estacional (B_best)** | **1.0315** | 0.8374 | 52.47 | 0.0390 |
| ARIMA(1,1,1) | 1.0731 | 0.8743 | 53.39 | -0.0231 |

### Decisión tomada
- **B_best = media estacional por día de la semana** (RMSE 1.0315 en 73 días; 0.9995 en 14 días).
- Umbral que Prophet debe cumplir: RMSE ≤ 0.8252 (20 % menos que B_best), MAPE ≤ 15 %, R² ≥ 0.65.

### Commit de referencia
`86f01e6` (código del evaluador). Datos versionados con DVC.

---

## EXP-001 — Prophet con la configuración del evaluador (primera ejecución)

> **Tipo:** Experimento de modelado. Primera prueba de Prophet, sin ajuste de hiperparámetros.

- **Fecha:** 29/10/2026
- **Responsable:** Equipo HALO (ejecución con asistencia de Claude Code)
- **Fase CRISP-ML(Q):** Modelado (Paso 4) y Evaluación (Paso 5)

### Hipótesis
> "Prophet con sus hiperparámetros por defecto logrará un MAPE ≤ 15 % y una reducción de RMSE ≥ 20 % frente al mejor baseline en el holdout."

### Configuración ejecutada
Código: `run_prophet_isolated` en `src/models/evaluator.py`.

```yaml
modelo: Prophet
hiperparámetros:          # valores efectivos
  yearly_seasonality: false
  daily_seasonality: false
  weekly_seasonality: true      # valor por defecto de Prophet
  changepoint_prior_scale: 0.05 # valor por defecto
  seasonality_prior_scale: 10.0 # valor por defecto
  seasonality_mode: additive    # valor por defecto
dataset: synthetic_lapaz_v1.csv
split: temporal (73 días y 14 días), sin shuffle
```

> ⚠️ **Discrepancia con la versión 1.0 de este documento:** la configuración original tenía `yearly_seasonality: true`. `src/models/prophet_model.py` usa `yearly`, `weekly` y `daily` en `true`. Se documenta la configuración que realmente ejecutó el evaluador. El equipo debe decidir cuál es la configuración de producción y que sea la misma en ambos archivos.

### Resultado

Holdout de 73 días (promedio de 7 zonas):

| Modelo | MAE | RMSE | MAPE (%) | R² | Δ RMSE vs. B_best |
|---|:---:|:---:|:---:|:---:|:---:|
| Media estacional (B_best) | 0.8374 | 1.0315 | 52.47 | 0.0390 | — |
| **Prophet (EXP-001)** | 0.8427 | 1.0382 | 53.87 | 0.0304 | **+0.6 % (empeora)** |

Holdout de 14 días (control): Prophet RMSE 0.9972 frente a 0.9995 de B_best (−0.2 %); MAPE 54.49 %; R² 0.0116.

### Resultado: ❌ Rechazada

No cumple MAPE ≤ 15 %, ni reducción de RMSE ≥ 20 %, ni R² ≥ 0.65.

### Hallazgo clave
- Prophet no supera a la media estacional. Con este dataset, la estacionalidad semanal es el único patrón fuerte, y el baseline estacional ya la captura.
- El MAPE es alto por la naturaleza de los datos, no solo por el modelo: el 34 % de los zona-días tiene cero incidentes (MAPE los excluye) y la mayoría de los días restantes tienen 1 a 3 incidentes. Un error de un incidente equivale a un MAPE de 33 % a 100 %.

### Decisión tomada como consecuencia
Según el protocolo de este documento, se ejecuta EXP-002. Además, se propone EXP-004 (feriados como regresor) y la revisión de la métrica de MAPE (ver `baseline.md`, sección 5).

### Commit de referencia
`86f01e6`

---

## EXP-002 — Prophet con hiperparámetros ajustados

> **Tipo:** Experimento de optimización. Se ejecutó porque EXP-001 no cumplió el umbral.

- **Fecha:** 29/10/2026
- **Responsable:** Equipo HALO (ejecución con asistencia de Claude Code)
- **Fase CRISP-ML(Q):** Modelado — iteración (Paso 4)

### Hipótesis
> "Reduciendo `changepoint_prior_scale` a 0.01 y usando `seasonality_mode='multiplicative'`, el MAPE bajará al menos 5 puntos porcentuales respecto a EXP-001."

### Configuración
```yaml
modelo: Prophet
hiperparámetros:
  changepoint_prior_scale: 0.01
  seasonality_prior_scale: 5.0
  seasonality_mode: multiplicative
  yearly_seasonality: true
  weekly_seasonality: true
  daily_seasonality: false
cambios_respecto_EXP001:
  - changepoint_prior_scale: 0.05 → 0.01
  - seasonality_prior_scale: 10 → 5
  - seasonality_mode: additive → multiplicative
  - yearly_seasonality: false → true
```

Nota: esta corrida se ejecutó con un script propio que ajusta un modelo por zona, con el mismo split que el evaluador. No usa `run_prophet_isolated`, porque esa función tiene la configuración fija de EXP-001.

### Resultado

| Holdout | MAE | RMSE | MAPE (%) | R² |
|---|:---:|:---:|:---:|:---:|
| 73 días | 0.8641 | 1.0613 | 54.35 | -0.0084 |
| 14 días | 0.8654 | 1.0477 | 57.44 | -0.0933 |

### Resultado: ❌ Rechazada

El MAPE de 73 días subió de 53.87 % (EXP-001) a 54.35 %. La hipótesis pedía una baja de al menos 5 pp.

### Hallazgo clave
Hacer el modelo menos flexible y multiplicativo no ayudó. Hipótesis no probada: con solo tres años de datos (unos tres ciclos anuales), la estacionalidad anual añade varianza sin información nueva.

### Decisión tomada como consecuencia
No seguir afinando hiperparámetros con este dataset. La siguiente hipótesis (EXP-004) apunta a información que el modelo no tiene todavía: los feriados.

### Commit de referencia
`86f01e6` (script de la corrida no está versionado todavía; ver `prediction-service/output/exp002_results_2026-10-29.json`).

---

## EXP-003 — ARIMA vs. Prophet: comparación formal

> **Tipo:** Experimento comparativo. Verifica el ADR-002 del design.md (Prophet elegido sobre ARIMA).

- **Fecha:** 29/10/2026
- **Responsable:** Equipo HALO (ejecución con asistencia de Claude Code)
- **Fase CRISP-ML(Q):** Evaluación (Paso 5)

### Hipótesis
> "Prophet (EXP-001) tendrá un RMSE al menos 20 % menor que ARIMA en el holdout, justificando el ADR-002."

### Configuración
- ARIMA(1,1,1) con orden fijo (`pmdarima` no está activo en `requirements.txt`). No es la comparación ARIMA auto que pedía el protocolo original.
- Prophet: configuración de EXP-001.

### Resultado

| Holdout | Modelo | RMSE | MAPE (%) | R² | Δ RMSE Prophet vs. ARIMA |
|---|---|:---:|:---:|:---:|:---:|
| 73 días | ARIMA(1,1,1) | 1.0731 | 53.39 | -0.0231 | — |
| 73 días | Prophet (EXP-001) | 1.0382 | 53.87 | 0.0304 | **−3.3 %** |
| 14 días | ARIMA(1,1,1) | 1.0855 | 58.72 | -0.0951 | — |
| 14 días | Prophet (EXP-001) | 0.9972 | 54.49 | 0.0116 | **−8.1 %** |

### ADR validado o revisado
**ADR-002 revisado.** Prophet es mejor que ARIMA(1,1,1) fijo, pero la mejora es de 3 % a 8 %, no de 20 %. Además, ninguno de los dos supera a la media estacional (ver EXP-000). Para una comparación justa, falta ARIMA con búsqueda automática de orden (auto_arima), que requiere resolver la instalación de `pmdarima`.

### Commit de referencia
`86f01e6`

---

## EXP-004 — Regresor de feriados en Prophet (propuesto, no ejecutado)

- **Hipótesis:** Agregar `is_holiday` como regresor (o como `holidays`) mejora el RMSE en el holdout, porque el generador sintético aplica un multiplicador de 1.7 en feriados (`GENERATION_RULES` en `data_ecosystem.md`, sección 5.2) y ese patrón no está en el baseline estacional.
- **Estado:** Pendiente. Requiere decisión del equipo sobre qué feriados usar para Bolivia.

---

## Hallazgos de integridad y reproducibilidad

### H-1 (crítico) — El evaluador rellena las métricas de Prophet cuando falla

- **Dónde:** `prediction-service/src/models/evaluator.py`.
  - `run_prophet_isolated` usa `sys.executable`, pero el archivo no importa `sys`. El `NameError` se captura en silencio (`logger.debug`) y la función devuelve `None`.
  - En `evaluate_zone`, cuando la función devuelve `None`, el código genera métricas sintéticas para Prophet: MAE × 0.82, RMSE × 0.79, MAPE × 0.85 y R² = clamp(R² del baseline + 0.22, 0.68, 0.88).
- **Efecto:** las métricas de Prophet del archivo `prediction-service/output/evaluation_report_2026-10-25.json` son de relleno. Lo mismo aplica a la tabla de Prophet que existía antes en este documento (R² de 0.68 idéntico en todas las zonas). Esos valores **no son evidencia**.
- **Verificación:** con `sys` importado en memoria, las 7 llamadas a Prophet en cada corrida devolvieron predicciones reales (0 fallos). Ver los archivos `evaluation_report_2026-10-29_holdout*.json`.
- **Estado de la corrección:** Corregida en el working tree; aplicada en prediction-service/src/models/evaluator.py (importación de sys, remoción del fallback sintético e informes con errores explícitos). El archivo JSON del 25/10 ha sido marcado con nota de advertencia/invalidez.

### H-2 (entorno) — Python 3.13 en Windows no instala ni ejecuta el pipeline

- Con Python 3.13, `pandas==2.2.2` no tiene wheel y su compilación falla por falta de Visual Studio Build Tools. Con pandas 2.2.x y numpy 2.5 en el Python global, `pd.date_range` provoca un access violation.
- **Solución verificada:** Python 3.11 (igual que el `Dockerfile`) con `requirements.txt` sin cambios.

### H-3 (datos) — La descripción previa del dataset no coincidía con el dataset versionado

- El texto de la versión 1.0 de `data_ecosystem.md` describía ZONA-1 a ZONA-5, 365 días y `synthetic_data_v1.csv`. El dataset versionado tiene 7 macrodistritos, 1,096 días y el archivo `synthetic_lapaz_v1.csv`. Ver `data_ecosystem.md`, secciones 4 y 7, ya actualizadas.
- Además, el 33.8 % de los zona-días no aparece en el CSV diario (días sin incidentes). `transform.py` los rellena con cero.

### H-4 (resultados previos) — `baseline_comparison.json` no es reproducible con el código actual

- `prediction-service/output/baseline_comparison.json` (17/09/2026) tiene zonas y valores que no coinciden con la corrida de hoy, y no sé con qué parámetros se generó. Se conserva sin cambios y **no se usa como evidencia**.

---

## Evidencia de la corrida del 29/10/2026

| Archivo | Contenido |
|---|---|
| `prediction-service/output/evaluation_report_2026-10-29_holdout73.json` | Baselines, ARIMA y Prophet (EXP-001) por zona, holdout de 73 días |
| `prediction-service/output/evaluation_report_2026-10-29_holdout14.json` | Lo mismo, holdout de 14 días |
| `prediction-service/output/exp002_results_2026-10-29.json` | EXP-002 por zona, holdouts de 73 y 14 días |

---

## Plantilla para Nuevos Experimentos

Copiar y pegar al agregar un nuevo experimento:

```markdown
## EXP-XXX — Título del Experimento

- **Fecha:** YYYY-MM-DD
- **Responsable:** Nombre
- **Fase CRISP-ML(Q):** [Comprensión datos / Preparación / Modelado / Evaluación]

### Hipótesis
> "..."

### Configuración
(yaml con modelo, hiperparámetros, dataset, cambios respecto al anterior)

### Resultado
| Zona | MAE | RMSE | MAPE (%) | R² | vs. Baseline |
|---|---|---|---|---|---|

### Resultado: ✅ Confirmada / ❌ Rechazada

### Hallazgo clave
...

### Decisión tomada como consecuencia
...

### Commit de referencia
`hash`
```

---

*Última actualización: 29/10/2026 — EXP-000 a EXP-003 con resultados; H-1 a H-4 documentados*
*Autores: Equipo HALO | Asistencia de IA: Antigravity (Google DeepMind) y Claude Code*
