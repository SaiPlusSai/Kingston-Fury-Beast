"""
test_extract.py
===============
Pruebas unitarias para el módulo de extracción (prediction-service/src/pipeline/extract.py).
Cumple con los requerimientos de la tarea T-2.2 de OpenSpec:
1. Validación rigurosa de la paginación nativa de DynamoDB (ExclusiveStartKey / LastEvaluatedKey).
2. Validación del fallback a datos sintéticos ante error de permisos IAM (AccessDeniedException).
3. Validación del fallback a datos sintéticos cuando la cantidad de datos es insuficiente.
4. Validación del filtrado de registros inválidos/cancelados/duplicados y conversión de tipos.
"""

from decimal import Decimal
import os
import sys
import unittest
from unittest.mock import MagicMock, patch

# Asegurar que el directorio raíz de prediction-service y src estén en el PYTHONPATH
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if SERVICE_ROOT not in sys.path:
    sys.path.insert(0, SERVICE_ROOT)

try:
    from botocore.exceptions import ClientError
except ImportError:
    class ClientError(Exception):  # type: ignore
        def __init__(self, response, operation_name):
            super().__init__(str(response))
            self.response = response
            self.operation_name = operation_name

from src.pipeline.extract import (
    _convert_decimals,
    extract_reports,
    filter_valid_records,
    is_valid_record,
    load_synthetic_data,
    scan_dynamodb_table,
)


def _make_client_error(code: str, message: str = "Test AWS Error") -> ClientError:
    """Helper para crear una excepción ClientError de botocore con estructura realista."""
    return ClientError(
        {"Error": {"Code": code, "Message": message}},
        operation_name="Scan",
    )


class TestExtractPipeline(unittest.TestCase):
    """Conjunto de pruebas para el pipeline de extracción de reportes."""

    def setUp(self):
        """Configuración inicial para cada prueba."""
        self.mock_table = MagicMock()

    # ──────────────────────────────────────────────────────────────────────────
    # 1. PRUEBAS DE PAGINACIÓN NATIVA DE DYNAMODB
    # ──────────────────────────────────────────────────────────────────────────

    def test_scan_dynamodb_table_handles_pagination_correctly(self):
        """
        Valida que scan_dynamodb_table procese múltiples páginas consecutivas
        usando ExclusiveStartKey cuando la respuesta contiene LastEvaluatedKey.
        Simula el comportamiento real de DynamoDB al superar el límite de 1MB por Scan.
        """
        # Página 1: Devuelve 2 items y LastEvaluatedKey
        page1 = {
            "Items": [
                {"reportId": "RPT-001", "createdAt": "2026-01-01T10:00:00", "status": "resolved"},
                {"reportId": "RPT-002", "createdAt": "2026-01-01T11:00:00", "status": "resolved"},
            ],
            "LastEvaluatedKey": {"reportId": "RPT-002"},
        }
        # Página 2: Devuelve 2 items y otro LastEvaluatedKey
        page2 = {
            "Items": [
                {"reportId": "RPT-003", "createdAt": "2026-01-01T12:00:00", "status": "resolved"},
                {"reportId": "RPT-004", "createdAt": "2026-01-01T13:00:00", "status": "resolved"},
            ],
            "LastEvaluatedKey": {"reportId": "RPT-004"},
        }
        # Página 3: Última página, sin LastEvaluatedKey
        page3 = {
            "Items": [
                {"reportId": "RPT-005", "createdAt": "2026-01-01T14:00:00", "status": "resolved"},
            ],
        }

        self.mock_table.scan.side_effect = [page1, page2, page3]

        items = scan_dynamodb_table(self.mock_table)

        # Verificaciones
        self.assertEqual(len(items), 5)
        self.assertEqual(self.mock_table.scan.call_count, 3)

        # Verificar llamadas y paso de ExclusiveStartKey
        calls = self.mock_table.scan.call_args_list
        # Primera llamada no debe tener ExclusiveStartKey
        self.assertNotIn("ExclusiveStartKey", calls[0].kwargs)
        # Segunda llamada debe usar LastEvaluatedKey de la página 1
        self.assertEqual(calls[1].kwargs.get("ExclusiveStartKey"), {"reportId": "RPT-002"})
        # Tercera llamada debe usar LastEvaluatedKey de la página 2
        self.assertEqual(calls[2].kwargs.get("ExclusiveStartKey"), {"reportId": "RPT-004"})

    def test_scan_single_page_without_pagination(self):
        """Valida que un escaneo de una sola página sin LastEvaluatedKey termine inmediatamente."""
        single_page = {
            "Items": [
                {"reportId": "RPT-100", "createdAt": "2026-02-01T10:00:00", "status": "pending"},
            ]
        }
        self.mock_table.scan.return_value = single_page

        items = scan_dynamodb_table(self.mock_table)

        self.assertEqual(len(items), 1)
        self.assertEqual(self.mock_table.scan.call_count, 1)

    # ──────────────────────────────────────────────────────────────────────────
    # 2. PRUEBAS DE MANEJO DE RIESGO Y FALLBACK ANTE ERRORES IAM
    # ──────────────────────────────────────────────────────────────────────────

    def test_fallback_on_iam_access_denied_exception(self):
        """
        Valida que si la llamada a DynamoDB falla por permisos IAM insuficientes
        (AccessDeniedException), se capture el error, se registre en el log
        y se active el fallback a datos sintéticos sin bloquear el pipeline.
        """
        self.mock_table.scan.side_effect = _make_client_error(
            code="AccessDeniedException",
            message="User is not authorized to perform: dynamodb:Scan on resource ReportsTable",
        )

        mock_synthetic_data = [
            {"reportId": "SYNTH-001", "createdAt": "2026-01-01", "status": "resolved"},
            {"reportId": "SYNTH-002", "createdAt": "2026-01-02", "status": "resolved"},
        ]

        with patch("src.pipeline.extract.load_synthetic_data", return_value=mock_synthetic_data) as mock_load:
            result = extract_reports(dynamodb_table=self.mock_table, min_records=1)

            # Debe haber llamado al fallback de datos sintéticos
            mock_load.assert_called_once()
            self.assertEqual(result, mock_synthetic_data)

    def test_fallback_on_iam_unauthorized_operation(self):
        """Valida fallback ante códigos alternativos de error IAM como UnauthorizedOperation."""
        self.mock_table.scan.side_effect = _make_client_error(
            code="UnauthorizedOperation",
            message="You are not authorized to perform this operation.",
        )

        with patch("src.pipeline.extract.load_synthetic_data") as mock_load:
            mock_load.return_value = [{"reportId": "SYNTH-UNAUTH", "createdAt": "2026-01-01"}]
            result = extract_reports(dynamodb_table=self.mock_table)

            mock_load.assert_called_once()
            self.assertEqual(len(result), 1)
            self.assertEqual(result[0]["reportId"], "SYNTH-UNAUTH")

    def test_fallback_on_connection_error_or_resource_not_found(self):
        """Valida fallback si la tabla no existe o hay error de conexión a DynamoDB."""
        self.mock_table.scan.side_effect = _make_client_error(
            code="ResourceNotFoundException",
            message="Cannot do operations on a non-existent table.",
        )

        with patch("src.pipeline.extract.load_synthetic_data") as mock_load:
            mock_load.return_value = [{"reportId": "SYNTH-NO-TABLE", "createdAt": "2026-01-01"}]
            result = extract_reports(dynamodb_table=self.mock_table)

            mock_load.assert_called_once()
            self.assertEqual(result[0]["reportId"], "SYNTH-NO-TABLE")

    # ──────────────────────────────────────────────────────────────────────────
    # 3. PRUEBAS DE FALLBACK ANTE DATOS INSUFICIENTES
    # ──────────────────────────────────────────────────────────────────────────

    def test_fallback_on_insufficient_data(self):
        """
        Valida que si se extraen menos registros válidos que el umbral mínimo (min_records),
        el sistema descarte la muestra incompleta y active el fallback a datos sintéticos.
        """
        # Solo 3 registros válidos en la tabla
        few_items = [
            {"reportId": f"RPT-{i}", "createdAt": "2026-01-01", "status": "resolved"}
            for i in range(3)
        ]
        self.mock_table.scan.return_value = {"Items": few_items}

        mock_synthetic_data = [
            {"reportId": f"SYNTH-{i}", "createdAt": "2026-01-01", "status": "resolved"}
            for i in range(100)
        ]

        with patch("src.pipeline.extract.load_synthetic_data", return_value=mock_synthetic_data) as mock_load:
            # Requerimos mínimo 50 registros
            result = extract_reports(dynamodb_table=self.mock_table, min_records=50)

            mock_load.assert_called_once()
            self.assertEqual(len(result), 100)
            self.assertEqual(result[0]["reportId"], "SYNTH-0")

    def test_success_without_fallback_when_data_is_sufficient(self):
        """
        Valida el flujo normal (Happy Path): cuando hay suficientes registros válidos,
        se devuelven directamente y NO se activa el fallback a datos sintéticos.
        """
        # 60 registros válidos (superando el umbral de 50)
        abundant_items = [
            {
                "reportId": f"RPT-REAL-{i:03d}",
                "createdAt": "2026-01-01T12:00:00",
                "latitude": Decimal("-16.500000"),
                "longitude": Decimal("-68.119300"),
                "status": "resolved",
                "category": "ROBO",
            }
            for i in range(60)
        ]
        self.mock_table.scan.return_value = {"Items": abundant_items}

        with patch("src.pipeline.extract.load_synthetic_data") as mock_load:
            result = extract_reports(dynamodb_table=self.mock_table, min_records=50)

            # load_synthetic_data NO debió ser llamado
            mock_load.assert_not_called()
            self.assertEqual(len(result), 60)
            self.assertEqual(result[0]["reportId"], "RPT-REAL-000")
            # Verificar conversión de Decimal a float
            self.assertIsInstance(result[0]["latitude"], float)

    # ──────────────────────────────────────────────────────────────────────────
    # 4. PRUEBAS DE VALIDACIÓN Y FILTRADO DE REGISTROS
    # ──────────────────────────────────────────────────────────────────────────

    def test_filter_valid_records_excludes_cancelled_and_duplicates(self):
        """
        Valida que se excluyan del entrenamiento los reportes con estado
        'cancelled', 'duplicate' o sin datos mínimos.
        """
        raw_items = [
            {"reportId": "RPT-OK", "createdAt": "2026-01-01", "status": "resolved"},
            {"reportId": "RPT-CANC", "createdAt": "2026-01-01", "status": "cancelled"},
            {"reportId": "RPT-DUP", "createdAt": "2026-01-01", "status": "duplicate"},
            {"reportId": "RPT-NO-DATE", "status": "resolved"},  # Sin fecha
            {"createdAt": "2026-01-01", "status": "resolved"},  # Sin ID
            {"reportId": "RPT-BAD-COORDS", "createdAt": "2026-01-01", "latitude": 999.0, "longitude": 0.0},
        ]

        valid = filter_valid_records(raw_items)

        self.assertEqual(len(valid), 1)
        self.assertEqual(valid[0]["reportId"], "RPT-OK")

    def test_decimal_conversion(self):
        """Valida que los tipos Decimal de DynamoDB se conviertan a int o float nativos."""
        data = {
            "integer_dec": Decimal("10"),
            "float_dec": Decimal("3.14159"),
            "nested": {"val": Decimal("42.0")},
            "list": [Decimal("1"), Decimal("2.5")],
        }
        converted = _convert_decimals(data)

        self.assertIsInstance(converted["integer_dec"], int)
        self.assertEqual(converted["integer_dec"], 10)
        self.assertIsInstance(converted["float_dec"], float)
        self.assertAlmostEqual(converted["float_dec"], 3.14159)
        self.assertIsInstance(converted["nested"]["val"], int)
        self.assertIsInstance(converted["list"][1], float)

    # ──────────────────────────────────────────────────────────────────────────
    # 5. PRUEBAS DE CARGA DE DATOS SINTÉTICOS
    # ──────────────────────────────────────────────────────────────────────────

    def test_load_synthetic_data_generates_valid_records(self):
        """
        Valida que load_synthetic_data devuelva una lista de diccionarios válidos
        incluso si no existe ningún archivo CSV físico en disco.
        """
        non_existent_csv = os.path.join(SERVICE_ROOT, "data", "raw", "does_not_exist_9999.csv")
        records = load_synthetic_data(fallback_csv_path=non_existent_csv, n_fallback=20)

        self.assertIsInstance(records, list)
        self.assertGreater(len(records), 0)
        # Todos los registros deben ser válidos
        for r in records:
            self.assertTrue(is_valid_record(r))


if __name__ == "__main__":
    unittest.main()
