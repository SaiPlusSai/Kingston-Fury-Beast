# extract.py

> 50 nodes

## Key Concepts

- **extract.py** (21 connections) — `prediction-service/src/pipeline/extract.py`
- **extract_reports()** (17 connections) — `prediction-service/src/pipeline/extract.py`
- **test_extract.py** (17 connections) — `prediction-service/tests/test_extract.py`
- **os** (17 connections)
- **TestExtractPipeline** (13 connections) — `prediction-service/tests/test_extract.py`
- **load_synthetic_data()** (12 connections) — `prediction-service/src/pipeline/extract.py`
- **filter_valid_records()** (9 connections) — `prediction-service/src/pipeline/extract.py`
- **_convert_decimals()** (8 connections) — `prediction-service/src/pipeline/extract.py`
- **is_valid_record()** (7 connections) — `prediction-service/src/pipeline/extract.py`
- **scan_dynamodb_table()** (7 connections) — `prediction-service/src/pipeline/extract.py`
- **_make_client_error()** (6 connections) — `prediction-service/tests/test_extract.py`
- **Any** (6 connections)
- **ClientError** (4 connections) — `prediction-service/tests/test_extract.py`
- **.test_fallback_on_connection_error_or_resource_not_found()** (4 connections) — `prediction-service/tests/test_extract.py`
- **.test_fallback_on_iam_access_denied_exception()** (4 connections) — `prediction-service/tests/test_extract.py`
- **.test_fallback_on_iam_unauthorized_operation()** (4 connections) — `prediction-service/tests/test_extract.py`
- **.test_load_synthetic_data_generates_valid_records()** (4 connections) — `prediction-service/tests/test_extract.py`
- **.test_decimal_conversion()** (3 connections) — `prediction-service/tests/test_extract.py`
- **.test_fallback_on_insufficient_data()** (3 connections) — `prediction-service/tests/test_extract.py`
- **.test_filter_valid_records_excludes_cancelled_and_duplicates()** (3 connections) — `prediction-service/tests/test_extract.py`
- **.test_scan_dynamodb_table_handles_pagination_correctly()** (3 connections) — `prediction-service/tests/test_extract.py`
- **.test_scan_single_page_without_pagination()** (3 connections) — `prediction-service/tests/test_extract.py`
- **.test_success_without_fallback_when_data_is_sufficient()** (3 connections) — `prediction-service/tests/test_extract.py`
- **.setUp()** (2 connections) — `prediction-service/tests/test_extract.py`
- **botocore_exceptions** (2 connections)
- *... and 25 more nodes in this community*

## Relationships

- [transform.py](transform.py.md) (11 shared connections)
- [prophet_model.py](prophet_model.py.md) (7 shared connections)
- [evaluator.py](evaluator.py.md) (6 shared connections)
- [synthetic_data.py](synthetic_data.py.md) (4 shared connections)
- [generate](generate.md) (3 shared connections)
- [arima_model.py](arima_model.py.md) (2 shared connections)
- [generate_synthetic_data.py](generate_synthetic_data.py.md) (1 shared connections)

## Source Files

- `prediction-service/src/pipeline/extract.py`
- `prediction-service/tests/test_extract.py`

## Audit Trail

- EXTRACTED: 120 (99%)
- INFERRED: 1 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*