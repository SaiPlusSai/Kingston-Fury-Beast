---
name: ml-prediction-evaluator
description: Runs synthetic data generation, exploratory data analysis checks, baseline time-series models, and metric evaluations (MAE, RMSE, MAPE) for the prediction service. Use when working on Python models, datasets, or the prediction container.
---

# Machine Learning Prediction Evaluator — HALO

This skill governs the execution, data pipelines, and evaluation procedures for HALO's time-series incident hotspot prediction service (`prediction-service/`), structured according to the CRISP-ML(Q) lifecycle.

## Pipeline Components

- **Dataset Generator**: `prediction-service/scripts/generate_synthetic_data.py`
  Generates synthetic incident datasets following real-world urban distribution patterns (poisson arrival process, geographic clustering, diurnal and weekly seasonalities).
- **Notebooks**:
  - `prediction-service/notebooks/01_eda.ipynb`: Exploratory data analysis, stationarity tests (ADF), seasonality decomposition.
  - `prediction-service/notebooks/02_baseline.ipynb`: 4 baseline statistical models (Naive, Moving Average, ARIMA, SARIMA).
- **Outputs**:
  - `prediction-service/output/baseline_comparison.json`: Metrics registry (MAE, RMSE, R²).
  - `prediction-service/output/`: Exported forecast plots and CSV summaries.

## Running Synthetic Data Generation

To generate or refresh the synthetic incident dataset:
```powershell
python prediction-service/scripts/generate_synthetic_data.py
```

Outputs generated in `prediction-service/data/`:
- `incident_reports_synthetic_raw.csv` (individual report events with timestamps, coordinates, severity, categories)
- `incident_reports_daily_aggregated.csv` (aggregated daily time-series ready for Prophet and statsmodels)

## Model Evaluation Criteria

When evaluating forecasting models:
1. **MAE (Mean Absolute Error)**: Target < 3.0 incidents/day per zone.
2. **RMSE (Root Mean Squared Error)**: Penalizes large unexpected spikes.
3. **Execution Time**: The model fitting and forecasting job must complete in under 15 minutes to run within AWS Lambda Container maximum timeout limits.
4. **Output Format**: Predictions must emit `ds` (ISO date), `yhat` (forecast), `yhat_lower`, and `yhat_upper` (confidence intervals).
