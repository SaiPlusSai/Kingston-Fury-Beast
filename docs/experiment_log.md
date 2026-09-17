# Log de Experimentos — Módulo de Predicción HALO v2
## Proyecto Integrador | Taller de Sistemas Inteligentes

> **Propósito:** Registro cronológico de todos los experimentos ejecutados durante el desarrollo del modelo predictivo. Los experimentos fallidos tienen el mismo valor académico que los exitosos — documentar un fracaso demuestra rigor científico y guía las decisiones siguientes.
>
> **Regla de oro:** Nunca eliminar un experimento de este log. Marcar como ❌ Rechazada y documentar la causa.
>
> **Declaración de IA:** Plantilla generada con asistencia de Antigravity (Google DeepMind) el 16/09/2026.

---

## Índice de Experimentos

| ID | Hipótesis (resumen) | Resultado | Fecha |
|---|---|:---:|---|
| EXP-000 | Definición de baseline — sin modelo vs. naive | ✅ Referencia | 16/09/2026 |
| EXP-001 | *(Completar al ejecutar el pipeline)* | ⏳ Pendiente | — |
| EXP-002 | *(Completar al ejecutar el pipeline)* | ⏳ Pendiente | — |

---

## EXP-000 — Definición de Baseline (Referencia)

> **Tipo:** Experimento de referencia. No es un experimento de IA, sino el punto de partida obligatorio.

- **Fecha:** 16/09/2026
- **Responsable:** Kael Lopez + Christhian Coronel
- **Fase CRISP-ML(Q):** Evaluación (Paso 5)

### Hipótesis
> "Los modelos baseline (Naive, Media Móvil, Media Estacional, ARIMA auto) establecen el límite mínimo de desempeño que Prophet debe superar para justificar su complejidad."

### Configuración
- **Dataset:** Datos sintéticos v1.0 (365 días × 5 zonas, andom_seed=42)
- **Split:** 80% training (292 días) / 20% holdout (73 días)
- **Modelos evaluados:** Naive, Media móvil 7d, Media estacional semanal, ARIMA auto

### Resultado
> ⏳ **Pendiente de ejecución.** Completar al correr python prediction-service/handler.py --mode local --compute-baselines

| Modelo | MAE | RMSE | MAPE (%) | R² |
|---|:---:|:---:|:---:|:---:|
| Naive | TBD | TBD | TBD | TBD |
| Media móvil 7d | TBD | TBD | TBD | TBD |
| Media estacional | TBD | TBD | TBD | TBD |
| ARIMA auto | TBD | TBD | TBD | TBD |

### Decisión tomada
Los resultados de este experimento fijan los valores de B_best en aseline.md y se convierten en el umbral de comparación para todos los experimentos siguientes.

### Commit de referencia
git-hash — completar

---

## EXP-001 — Prophet con configuración por defecto (Primera ejecución)

> **Tipo:** Experimento de modelado. Primera prueba de Prophet sin ajuste de hiperparámetros.

- **Fecha:** *(Completar al ejecutar)*
- **Responsable:** Christhian Coronel
- **Fase CRISP-ML(Q):** Modelado (Paso 4)

### Hipótesis
> "Prophet con sus hiperparámetros por defecto (changepoint_prior_scale=0.05, seasonality_mode='additive') logrará un MAPE ≤ 15% en el holdout del dataset sintético."

### Configuración
`yaml
modelo: Prophet
hiperparámetros:
  changepoint_prior_scale: 0.05
  seasonality_prior_scale: 10
  seasonality_mode: additive
  yearly_seasonality: true
  weekly_seasonality: true
  daily_seasonality: false
dataset: synthetic_data_v1.csv
split: 80/20 temporal
random_seed: 42
`

### Resultado
> ⏳ **Pendiente de ejecución.**

| Zona | MAE | RMSE | MAPE (%) | R² | vs. Baseline |
|---|:---:|:---:|:---:|:---:|:---:|
| ZONA-1 | TBD | TBD | TBD | TBD | TBD |
| ZONA-2 | TBD | TBD | TBD | TBD | TBD |
| ZONA-3 | TBD | TBD | TBD | TBD | TBD |
| ZONA-4 | TBD | TBD | TBD | TBD | TBD |
| ZONA-5 | TBD | TBD | TBD | TBD | TBD |
| **Promedio** | **TBD** | **TBD** | **TBD** | **TBD** | **TBD** |

### Resultado: ✅ Confirmada / ❌ Rechazada
*(Completar tras ejecutar)*

### Hallazgo clave
*(Completar: ej. "Prophet capturó la estacionalidad semanal pero sobreajustó en ZONA-1" o "MAPE de 22%, hipótesis rechazada")*

### Decisión tomada como consecuencia
*(Completar: ej. "Proceder a EXP-002 con tuning de changepoint_prior_scale" o "Validar que los datos sintéticos tienen suficiente variabilidad")*

### Commit de referencia
git-hash — completar

---

## EXP-002 — Prophet con hiperparámetros ajustados (si EXP-001 falla)

> **Tipo:** Experimento de optimización. Solo se ejecuta si EXP-001 no cumple el umbral MAPE ≤ 15%.

- **Fecha:** *(Completar al ejecutar)*
- **Responsable:** Christhian Coronel + Kael Lopez
- **Fase CRISP-ML(Q):** Modelado — iteración (Paso 4)

### Hipótesis
> "Reduciendo changepoint_prior_scale a 0.01 (menos flexible) y usando seasonality_mode='multiplicative', se reducirá el MAPE en ≥ 5 puntos porcentuales respecto a EXP-001."

### Configuración (candidata)
`yaml
modelo: Prophet
hiperparámetros:
  changepoint_prior_scale: 0.01
  seasonality_prior_scale: 5
  seasonality_mode: multiplicative
  yearly_seasonality: true
  weekly_seasonality: true
  daily_seasonality: false
cambios_respecto_EXP001:
  - changepoint_prior_scale: 0.05 → 0.01
  - seasonality_mode: additive → multiplicative
`

### Resultado
> ⏳ **Pendiente — ejecutar solo si EXP-001 no cumple el umbral.**

### Resultado: ✅ Confirmada / ❌ Rechazada
*(Completar tras ejecutar)*

### Hallazgo clave
*(Completar)*

### Commit de referencia
git-hash — completar

---

## EXP-003 — ARIMA vs. Prophet: comparación formal (Experimento de referencia académica)

> **Tipo:** Experimento comparativo. Verifica el ADR-002 del design.md (Prophet elegido sobre ARIMA).

- **Fecha:** *(Completar al ejecutar)*
- **Responsable:** Christhian Coronel
- **Fase CRISP-ML(Q):** Evaluación (Paso 5)

### Hipótesis
> "Prophet con el mejor ajuste de hiperparámetros (resultado de EXP-001 o EXP-002) tendrá RMSE ≥ 20% menor que ARIMA auto en el holdout, justificando la decisión ADR-002."

### Resultado
> ⏳ **Pendiente.**

| Modelo | RMSE | MAPE (%) | R² | Tiempo entrenamiento |
|---|:---:|:---:|:---:|:---:|
| ARIMA auto | TBD | TBD | TBD | TBD seg |
| Prophet (mejor config) | TBD | TBD | TBD | TBD seg |
| **Δ Mejora Prophet** | **TBD%** | **TBD pp** | **TBD** | — |

### ADR validado o revisado
*(Completar: "ADR-002 validado — Prophet es superior en X%" o "ADR-002 revisado — ARIMA es competitivo, documentar como hallazgo")*

### Commit de referencia
git-hash — completar

---

## Plantilla para Nuevos Experimentos

Copiar y pegar al agregar un nuevo experimento:

`markdown
## EXP-XXX — Título del Experimento

- **Fecha:** YYYY-MM-DD
- **Responsable:** Nombre
- **Fase CRISP-ML(Q):** [Comprensión datos / Preparación / Modelado / Evaluación]

### Hipótesis
> "..."

### Configuración
\\\yaml
modelo:
hiperparámetros:
dataset:
cambios_respecto_anterior:
\\\

### Resultado

| Zona | MAE | RMSE | MAPE (%) | R² | vs. Baseline |
|---|---|---|---|---|---|

### Resultado: ✅ Confirmada / ❌ Rechazada

### Hallazgo clave
...

### Decisión tomada como consecuencia
...

### Commit de referencia
git-hash
`

---

*Última actualización: 16/09/2026 — Estructura inicial con EXP-000 a EXP-003 predefinidos*
*Autores: Equipo HALO | Asistencia de IA: Antigravity (Google DeepMind)*
