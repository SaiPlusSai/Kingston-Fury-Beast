# transform.py

> 38 nodes

## Key Concepts

- **transform.py** (20 connections) — `prediction-service/src/pipeline/transform.py`
- **transform_data()** (17 connections) — `prediction-service/src/pipeline/transform.py`
- **pandas** (17 connections)
- **test_transform.py** (13 connections) — `prediction-service/tests/test_transform.py`
- **assign_zone()** (10 connections) — `prediction-service/src/pipeline/transform.py`
- **TestTransformPipeline** (9 connections) — `prediction-service/tests/test_transform.py`
- **pipeline/__init__.py** (9 connections) — `prediction-service/src/pipeline/__init__.py`
- **load_zones_config()** (8 connections) — `prediction-service/src/pipeline/transform.py`
- **extract_bounding_box()** (6 connections) — `prediction-service/src/pipeline/transform.py`
- **_extract_date_str()** (5 connections) — `prediction-service/src/pipeline/transform.py`
- **Any** (5 connections)
- **is_inside_bounding_box()** (4 connections) — `prediction-service/src/pipeline/transform.py`
- **.setUp()** (3 connections) — `prediction-service/tests/test_transform.py`
- **.test_assign_zone_by_macrodistrito_fallback()** (3 connections) — `prediction-service/tests/test_transform.py`
- **.test_assign_zone_correctly_by_coordinates()** (3 connections) — `prediction-service/tests/test_transform.py`
- **.test_daily_grouping_format_and_columns()** (3 connections) — `prediction-service/tests/test_transform.py`
- **.test_fill_missing_dates_with_zeros()** (3 connections) — `prediction-service/tests/test_transform.py`
- **.test_no_nan_values_in_final_dataframes()** (3 connections) — `prediction-service/tests/test_transform.py`
- **.test_warning_logged_for_coordinates_outside_bounding_box()** (3 connections) — `prediction-service/tests/test_transform.py`
- **math** (3 connections)
- **DataFrame** (1 connections)
- **HALO Prediction Service - Pipeline Package (ETL & Extraction)** (1 connections) — `prediction-service/src/pipeline/__init__.py`
- **transform.py ============ Módulo de transformación y agregación de datos para…** (1 connections) — `prediction-service/src/pipeline/transform.py`
- **Valida si un punto (lat, lon) cae estrictamente dentro del bounding box.** (1 connections) — `prediction-service/src/pipeline/transform.py`
- **Asigna un incidente a una zona definida en config/zones.json. Mitigación de…** (1 connections) — `prediction-service/src/pipeline/transform.py`
- *... and 13 more nodes in this community*

## Relationships

- [extract.py](extract.py.md) (11 shared connections)
- [evaluator.py](evaluator.py.md) (10 shared connections)
- [prophet_model.py](prophet_model.py.md) (7 shared connections)
- [synthetic_data.py](synthetic_data.py.md) (3 shared connections)
- [arima_model.py](arima_model.py.md) (2 shared connections)
- [generate](generate.md) (1 shared connections)
- [generate_synthetic_data.py](generate_synthetic_data.py.md) (1 shared connections)

## Source Files

- `prediction-service/src/pipeline/__init__.py`
- `prediction-service/src/pipeline/transform.py`
- `prediction-service/tests/test_transform.py`

## Audit Trail

- EXTRACTED: 99 (99%)
- INFERRED: 1 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*