# Definición de Línea Base (Baseline) — Módulo de Predicción
## Proyecto HALO v2 | Taller de Sistemas Inteligentes

> **Propósito:** Este documento establece los modelos de referencia (baseline) contra los cuales se medirá el desempeño del modelo Prophet. Sin una línea base definida, no es posible demostrar que el modelo de IA agrega valor medible.
>
> **Declaración de IA:** Documento generado con asistencia de Antigravity (Google DeepMind) el 16/09/2026. Las secciones 4 a 7 (resultados, criterios, procedimiento e historial) se completaron el 29/10/2026 con asistencia de Claude Code; ver `experiment_log.md`.

---

## 1. Justificación del Baseline

Un **modelo baseline** es el punto de referencia mínimo que cualquier modelo de IA debe superar para justificar su complejidad adicional. Si Prophet no mejora significativamente sobre un baseline simple (ej. "predecir el mismo valor de ayer"), entonces no tiene justificación técnica desplegarlo.

La pregunta que este documento responde es:

> *"¿Cuánto mejor es Prophet comparado con lo que haríamos sin ningún modelo de IA?"*

---

## 2. Modelos Baseline Definidos

### Baseline 1 — Naive (Persistencia)
**Descripción:** El modelo más simple posible. Predice que mañana ocurrirán la misma cantidad de incidentes que hoy.

```
ŷ(t+1) = y(t)
```

**Por qué incluirlo:** Es el límite inferior de utilidad. Si Prophet no supera este modelo, el proyecto no agrega valor predictivo.

---

### Baseline 2 — Media Móvil 7 días
**Descripción:** Predice el promedio de los últimos 7 días. Suaviza la variabilidad diaria.

```
ŷ(t+1) = mean(y(t-6), y(t-5), ..., y(t))
```

**Por qué incluirlo:** Captura la tendencia reciente sin modelar estacionalidad. Es un baseline razonable que cualquier analista de datos construiría en 5 minutos.

---

### Baseline 3 — Media Estacional (día de la semana)
**Descripción:** Para cada día de la semana (Lunes–Domingo), predice el promedio histórico de ese día de la semana específico.

```
ŷ(viernes_próximo) = mean(todos los viernes históricos de esa zona)
```

**Por qué incluirlo:** Captura la estacionalidad semanal, que es el patrón más fuerte en los datos. Si Prophet no supera esto, significa que no agrega valor más allá de la estacionalidad simple.

---

### Baseline 4 — ARIMA (statsmodels)
**Descripción:** Modelo ARIMA como baseline estadístico clásico para series de tiempo. En la implementación actual (`src/models/arima_model.py`, `DEFAULT_ORDER`) el orden es **fijo, ARIMA(1,1,1)**: `pmdarima` (auto_arima) está comentado en `requirements.txt` por incompatibilidad de build.

**Por qué incluirlo:** Es el modelo de referencia académica estándar para series temporales. Prophet debe superar a ARIMA para justificar su elección (ADR-002 del design.md).

---

## 3. Métricas de Evaluación

Todas las métricas se calculan **sobre el conjunto holdout** (últimos días de cada zona). Nunca sobre el training set.

| Métrica | Fórmula | Interpretación |
|---|---|---|
| **MAE** (Mean Absolute Error) | mean(\|y - ŷ\|) | Error promedio en unidades absolutas de incidentes |
| **RMSE** (Root Mean Square Error) | sqrt(mean((y - ŷ)²)) | Penaliza errores grandes; más sensible a outliers |
| **MAPE** (Mean Absolute Percentage Error) | mean(\|y - ŷ\| / y) × 100 | Error porcentual; solo cuenta días con y > 0 (`calculate_metrics`) |
| **R²** (Coeficiente de determinación) | 1 - SS_res/SS_tot | Qué % de la varianza explica el modelo. 1.0 = perfecto, 0 = igual que la media |

---

## 4. Resultados del Baseline (ejecutados el 29/10/2026)

> **Corrida:** `ModelEvaluator` de `prediction-service/src/models/evaluator.py` sobre `prediction-service/data/raw/synthetic_lapaz_v1.csv` (versionado con DVC, md5 `ffed625750ae8b223299ffb50d0ca499`). 7 macrodistritos, 1,096 días por zona (2023-09-01 a 2026-08-31). Código en el commit `86f01e6`. Las métricas son el promedio de las 7 zonas.
>
> ℹ️ **Prophet se evaluó con la corrección definitiva** que importa `sys` en `evaluator.py` (hallazgo H-1 en `experiment_log.md`). Sin ese parche, el evaluador rellena las métricas de Prophet con valores sintéticos y estos resultados no serían válidos.
>
> Archivos de evidencia: `prediction-service/output/evaluation_report_2026-10-29_holdout73.json`, `prediction-service/output/evaluation_report_2026-10-29_holdout14.json` y `prediction-service/output/exp002_results_2026-10-29.json`.

### 4.1 Holdout principal: últimos 73 días (20 %)

Periodo de prueba: 2026-06-20 a 2026-08-31.

| Modelo | MAE | RMSE | MAPE (%) | R² |
|---|:---:|:---:|:---:|:---:|
| Baseline 1: Naive | 1.4423 | 1.7208 | 82.28 | -1.6111 |
| Baseline 2: Media móvil 7d | 0.9164 | 1.1180 | 51.81 | -0.1304 |
| **Baseline 3: Media estacional (B_best)** | 0.8374 | **1.0315** | 52.47 | 0.0390 |
| Baseline 4: ARIMA(1,1,1) | 0.8743 | 1.0731 | 53.39 | -0.0231 |
| Prophet — configuración del evaluador (EXP-001) | 0.8427 | 1.0382 | 53.87 | 0.0304 |
| Prophet — configuración de hipótesis (EXP-002) | 0.8641 | 1.0613 | 54.35 | -0.0084 |
| **Prophet (objetivo)** | < B_best | ≤ 0.8252 | ≤ 15 % | ≥ 0.65 |

### 4.2 Holdout de control: últimos 14 días (`test_size=14`, valor por defecto del evaluador)

Periodo de prueba: 2026-08-18 a 2026-08-31.

| Modelo | MAE | RMSE | MAPE (%) | R² |
|---|:---:|:---:|:---:|:---:|
| Baseline 1: Naive | 1.2347 | 1.4892 | 67.72 | -1.5278 |
| Baseline 2: Media móvil 7d | 0.9548 | 1.1559 | 54.88 | -0.2466 |
| **Baseline 3: Media estacional (B_best)** | 0.8130 | **0.9995** | 54.10 | 0.0034 |
| Baseline 4: ARIMA(1,1,1) | 0.8981 | 1.0855 | 58.72 | -0.0951 |
| Prophet — configuración del evaluador (EXP-001) | 0.8060 | 0.9972 | 54.49 | 0.0116 |
| Prophet — configuración de hipótesis (EXP-002) | 0.8654 | 1.0477 | 57.44 | -0.0933 |

### 4.3 Por zona (holdout de 73 días, RMSE)

| Zona | Mejor baseline | RMSE del mejor baseline | ARIMA(1,1,1) | Prophet EXP-001 | Prophet EXP-002 |
|---|---|:---:|:---:|:---:|:---:|
| Centro | Estacional | 1.5880 | 1.7937 | 1.6052 | 1.6460 |
| Max Paredes | Media móvil 7d | 1.3447 | 1.4012 | 1.4076 | 1.4430 |
| Periférica | Media móvil 7d | 1.2282 | 1.2326 | 1.2690 | 1.3080 |
| Cotahuma | Estacional | 0.6911 | 0.7430 | **0.6890** | 0.7090 |
| San Antonio | Estacional | 1.0291 | 1.0273 | 1.0312 | 1.0370 |
| Sur | Estacional | 0.7942 | 0.8452 | 0.7956 | 0.8180 |
| Mallasa | Estacional | 0.4714 | 0.4687 | 0.4700 | 0.4680 |

**Lectura:** Prophet solo supera al mejor baseline en Cotahuma, y por 0.3 %. En las demás zonas empata o pierde.

---

## 5. Umbral de Aceptación del Proyecto

El modelo Prophet se considera **aceptado** si cumple **todos** los siguientes criterios. Resultado con la configuración del evaluador (EXP-001), holdout de 73 días:

| Criterio | Umbral | Resultado | Estado |
|---|---|---|:---:|
| MAPE en holdout | ≤ 15 % en promedio de todas las zonas | 53.87 % | ❌ No cumple |
| Mejora de RMSE vs. mejor baseline | ≥ 20 % de reducción (RMSE ≤ 0.8252) | 1.0382 (−0.6 %, empeora) | ❌ No cumple |
| R² en holdout | ≥ 0.65 en promedio | 0.0304 | ❌ No cumple |
| Tiempo de ejecución del pipeline | ≤ 10 minutos | ≈ 5 s (carga, transformación, ARIMA y Prophet en 7 zonas) | ✅ Cumple |

Con el holdout de 14 días la conclusión es la misma: la mejora de RMSE frente al mejor baseline es de −0.2 %.

**Decisión:** Prophet **no se acepta** con la configuración actual. EXP-002 también se rechaza (ver `experiment_log.md`). Según el protocolo de este documento, el siguiente paso es proponer una hipótesis nueva (EXP-004).

**Nota sobre el umbral de MAPE:** la mayoría de las zonas tienen entre 1 y 3 incidentes por día, y el 34 % de los zona-días tienen cero incidentes. Con esos conteos, un error de un incidente equivale a un MAPE de 33 % a 100 %, aunque el modelo sea razonable. Cambiar la métrica (por ejemplo, sMAPE o MAE relativo a la media) o el umbral es una decisión del equipo; no se cambió en este documento.

---

## 6. Procedimiento de Cálculo (Reproducible)

```bash
# Entorno: Python 3.11 (igual que prediction-service/Dockerfile)
cd prediction-service
pip install -r requirements.txt

# 1. Datos sintéticos (solo si se regeneran; los CSV ya están versionados con DVC)
python scripts/generate_synthetic_data.py

# 2. Evaluar baselines, ARIMA y Prophet (test_size=14 por defecto)
python -m src.models.evaluator

# 3. Ver resultados
#    output/evaluation_report_YYYY-MM-DD.json
```

- El comando que decía este documento en la versión 1.0 (`handler.py --mode local --compute-baselines`) **no existe**: `handler.py` es el placeholder de la función Lambda.
- Para el holdout de 73 días, usar `ModelEvaluator(test_size=73)`.
- **Antes de usar los resultados de Prophet**, aplicar la corrección H-1 de `experiment_log.md` (importar `sys` en `evaluator.py`).

---

## 7. Historial de Actualizaciones

| Fecha | Versión | Cambios | Autor |
|---|---|---|---|
| 16/09/2026 | v1.0 | Definición inicial de 4 baselines y umbrales | Kael Lopez |
| 29/10/2026 | v1.1 | Resultados reales en holdouts de 73 y 14 días; EXP-001 y EXP-002 rechazados; comando de reproducción corregido; hallazgo H-1 documentado | Equipo HALO (asistencia de IA: Claude Code) |

---

*Última actualización: 29/10/2026 — v1.1 (resultados reales)*
*Autores: Kael Lopez + Christhian Coronel | Asistencia de IA: Antigravity (Google DeepMind) y Claude Code*
