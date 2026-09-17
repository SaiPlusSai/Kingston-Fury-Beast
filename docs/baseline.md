# Definición de Línea Base (Baseline) — Módulo de Predicción
## Proyecto HALO v2 | Taller de Sistemas Inteligentes

> **Propósito:** Este documento establece los modelos de referencia (baseline) contra los cuales se medirá el desempeño del modelo Prophet. Sin una línea base definida, no es posible demostrar que el modelo de IA agrega valor medible.
>
> **Declaración de IA:** Documento generado con asistencia de Antigravity (Google DeepMind) el 16/09/2026.

---

## 1. Justificación del Baseline

Un **modelo baseline** es el punto de referencia mínimo que cualquier modelo de IA debe superar para justificar su complejidad adicional. Si Prophet no mejora significativamente sobre un baseline simple (ej. "predecir el mismo valor de ayer"), entonces no tiene justificación técnica desplegarlo.

La pregunta que este documento responde es:

> *"¿Cuánto mejor es Prophet comparado con lo que haríamos sin ningún modelo de IA?"*

---

## 2. Modelos Baseline Definidos

### Baseline 1 — Naive (Persistencia)
**Descripción:** El modelo más simple posible. Predice que mañana ocurrirán la misma cantidad de incidentes que hoy.

`
ŷ(t+1) = y(t)
`

**Por qué incluirlo:** Es el límite inferior de utilidad. Si Prophet no supera este modelo, el proyecto no agrega valor predictivo.

---

### Baseline 2 — Media Móvil 7 días
**Descripción:** Predice el promedio de los últimos 7 días. Suaviza la variabilidad diaria.

`
ŷ(t+1) = mean(y(t-6), y(t-5), ..., y(t))
`

**Por qué incluirlo:** Captura la tendencia reciente sin modelar estacionalidad. Es un baseline razonable que cualquier analista de datos construiría en 5 minutos.

---

### Baseline 3 — Media Estacional (día de la semana)
**Descripción:** Para cada día de la semana (Lunes–Domingo), predice el promedio histórico de ese día de la semana específico.

`
ŷ(viernes_próximo) = mean(todos los viernes históricos de esa zona)
`

**Por qué incluirlo:** Captura la estacionalidad semanal, que es el patrón más fuerte en los datos. Si Prophet no supera esto, significa que no agrega valor más allá de la estacionalidad simple.

---

### Baseline 4 — ARIMA auto (statsmodels)
**Descripción:** Modelo ARIMA con parámetros seleccionados automáticamente por uto_arima (pmdarima). Es el baseline estadístico clásico para series de tiempo.

**Por qué incluirlo:** Es el modelo de referencia académica estándar para series temporales. Prophet debe superar a ARIMA para justificar su elección (ADR-004 del design.md).

---

## 3. Métricas de Evaluación

Todas las métricas se calculan **sobre el conjunto holdout** (últimos 73 días = 20% del dataset). Nunca sobre el training set.

| Métrica | Fórmula | Interpretación |
|---|---|---|
| **MAE** (Mean Absolute Error) | mean(|y - ŷ|) | Error promedio en unidades absolutas de incidentes |
| **RMSE** (Root Mean Square Error) | sqrt(mean((y - ŷ)²)) | Penaliza errores grandes; más sensible a outliers |
| **MAPE** (Mean Absolute Percentage Error) | mean(|y - ŷ| / y) × 100 | Error porcentual; comparable entre zonas con distintos volúmenes |
| **R²** (Coeficiente de determinación) | 1 - SS_res/SS_tot | Qué % de la varianza explica el modelo. 1.0 = perfecto, 0 = igual que la media |

---

## 4. Resultados del Baseline (TBD — Completar al ejecutar el pipeline)

> ⚠️ **Esta tabla se completa al ejecutar prediction-service/handler.py --mode local.**
> Los valores a continuación son los **umbrales objetivo** que Prophet debe superar.

### Por zona: ZONA-1 (Alta densidad — referencia)

| Modelo | MAE | RMSE | MAPE (%) | R² | Estado |
|---|:---:|:---:|:---:|:---:|:---:|
| Baseline 1: Naive | TBD | TBD | TBD | TBD | ⏳ Pendiente |
| Baseline 2: Media móvil 7d | TBD | TBD | TBD | TBD | ⏳ Pendiente |
| Baseline 3: Media estacional | TBD | TBD | TBD | TBD | ⏳ Pendiente |
| Baseline 4: ARIMA auto | TBD | TBD | TBD | TBD | ⏳ Pendiente |
| **Prophet (objetivo)** | **< B_best** | **< B_best × 0.8** | **≤ 15%** | **≥ 0.65** | ⏳ Pendiente |

> B_best = la mejor métrica entre los 4 baselines.

### Resumen multi-zona (consolidado)

| Modelo | MAE promedio | RMSE promedio | MAPE promedio (%) | R² promedio |
|---|:---:|:---:|:---:|:---:|
| Mejor baseline | TBD | TBD | TBD | TBD |
| Prophet | TBD | TBD | TBD | TBD |
| **Δ Mejora Prophet** | TBD% | TBD% | TBD pp | TBD |

---

## 5. Umbral de Aceptación del Proyecto

El modelo Prophet se considera **aceptado** si cumple **todos** los siguientes criterios:

| Criterio | Umbral | Estado |
|---|---|:---:|
| MAPE en holdout | ≤ 15% en promedio de todas las zonas | ⏳ Pendiente |
| Mejora de RMSE vs. mejor baseline | ≥ 20% de reducción | ⏳ Pendiente |
| R² en holdout | ≥ 0.65 en promedio | ⏳ Pendiente |
| Tiempo de ejecución del pipeline | ≤ 10 minutos | ⏳ Pendiente |

Si el modelo **no cumple** algún criterio:
1. El resultado **se documenta como un experimento fallido** en experiment_log.md.
2. Se analizan las causas (sobreajuste, datos insuficientes, estacionalidad no capturada).
3. Se propone y ejecuta una hipótesis de mejora (EXP-002, EXP-003...).

---

## 6. Procedimiento de Cálculo (Reproducible)

`ash
# 1. Generar datos sintéticos
python prediction-service/scripts/generate_synthetic_data.py

# 2. Ejecutar pipeline con baselines y Prophet
python prediction-service/handler.py --mode local --compute-baselines

# 3. Ver resultados
cat prediction-service/output/baseline_comparison_YYYY-MM-DD.json
`

El script evaluator.py calcula automáticamente las métricas para todos los modelos
y genera el archivo aseline_comparison_YYYY-MM-DD.json con la tabla comparativa.

---

## 7. Historial de Actualizaciones

| Fecha | Versión | Cambios | Autor |
|---|---|---|---|
| 16/09/2026 | v1.0 | Definición inicial de 4 baselines y umbrales | Kael Lopez |
| — | v1.1 | Completar con métricas reales del pipeline | Por completar |

---

*Última actualización: 16/09/2026 — Definición inicial*
*Autores: Kael Lopez + Christhian Coronel | Asistencia de IA: Antigravity (Google DeepMind)*
