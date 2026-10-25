"""
extract.py
==========
Módulo de extracción de datos para el pipeline de predicción de incidentes urbanos HALO v2.
Cumple con la tarea T-2.2 de OpenSpec y el requisito funcional RF-PRED-001 / RF-PRED-002.

Características principales:
1. Conexión y escaneo a la tabla DynamoDB 'ReportsTable' mediante boto3.
2. Manejo obligatorio y nativo de paginación de DynamoDB (ExclusiveStartKey / LastEvaluatedKey)
   para procesar múltiples páginas de resultados superando el límite de 1MB por petición.
3. Filtrado de registros válidos (excluyendo cancelados, duplicados o registros corruptos).
4. Gestión de riesgos y fallback a datos sintéticos:
   - Maneja el riesgo de "Permisos IAM insuficientes" (AccessDeniedException, ClientError).
   - Maneja el riesgo de escasez de datos (menos del umbral mínimo requerido).
   - Garantiza que el flujo del pipeline predictivo nunca quede bloqueado.
"""

from decimal import Decimal
import logging
import os
from typing import Any, Dict, List, Optional
import pandas as pd

try:
    import boto3
    from botocore.exceptions import BotoCoreError, ClientError
except ImportError:  # pragma: no cover
    boto3 = None  # type: ignore
    BotoCoreError = Exception  # type: ignore
    ClientError = Exception  # type: ignore

# Configuración de logging
logger = logging.getLogger("halo.prediction.extract")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [extract.py]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Configuración por defecto
DEFAULT_TABLE_NAME = os.getenv("DYNAMODB_TABLE_REPORTS", "ReportsTable")
DEFAULT_REGION = os.getenv("AWS_REGION", "us-east-1")
DEFAULT_MIN_RECORDS = int(os.getenv("MIN_REPORTS_THRESHOLD", "50"))

# Rutas estándar para datos sintéticos de fallback
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "raw")
DEFAULT_SYNTHETIC_CSV = os.path.join(RAW_DATA_DIR, "synthetic_lapaz_v1.csv")


def _convert_decimals(obj: Any) -> Any:
    """Convierte tipos Decimal de DynamoDB y escalares de NumPy a tipos estándar de Python (float/int/str)."""
    if isinstance(obj, list):
        return [_convert_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: _convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    elif hasattr(obj, "item"):  # Maneja escalares de numpy como np.str_, np.int64, np.float64
        return obj.item()
    return obj


def is_valid_record(record: Dict[str, Any]) -> bool:
    """
    Valida si un registro de DynamoDB es apto para el pipeline predictivo.
    Excluye reportes cancelados, duplicados o sin información mínima esencial.
    """
    if not isinstance(record, dict) or not record:
        return False

    status = str(record.get("status") or record.get("estado") or "").strip().lower()
    if status in {"cancelled", "cancelado", "duplicate", "duplicado", "rejected", "rechazado"}:
        return False

    has_id = bool(record.get("reportId") or record.get("report_id") or record.get("id"))
    has_date = bool(record.get("createdAt") or record.get("timestamp") or record.get("ds"))

    lat = record.get("latitude")
    lon = record.get("longitude")
    if lat is not None and lon is not None:
        try:
            lat_f = float(lat)
            lon_f = float(lon)
            if not (-90.0 <= lat_f <= 90.0 and -180.0 <= lon_f <= 180.0):
                return False
        except (ValueError, TypeError):
            return False

    return has_id and has_date


def filter_valid_records(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Filtra una lista de registros, manteniendo solo los válidos y normalizando tipos."""
    valid_items = []
    for raw in records:
        cleaned = _convert_decimals(raw)
        if is_valid_record(cleaned):
            valid_items.append(cleaned)
    return valid_items


def load_synthetic_data(
    fallback_csv_path: Optional[str] = None,
    n_fallback: int = 1000,
) -> List[Dict[str, Any]]:
    """
    Carga datos sintéticos calibrados desde CSV o mediante el generador.
    Se utiliza como mecanismo de contingencia (fallback) ante fallas en DynamoDB
    o cantidad insuficiente de registros históricos.
    """
    candidate_paths = []
    if fallback_csv_path:
        candidate_paths.append(fallback_csv_path)
    env_path = os.getenv("SYNTHETIC_DATA_PATH")
    if env_path:
        candidate_paths.append(env_path)
    candidate_paths.append(DEFAULT_SYNTHETIC_CSV)

    for path in candidate_paths:
        if path and os.path.isfile(path):
            try:
                df = pd.read_csv(path)
                if not df.empty:
                    logger.info("Datos sintéticos cargados con éxito desde archivo CSV: %s (%d filas)", path, len(df))
                    records = df.to_dict(orient="records")
                    return filter_valid_records(records)
            except Exception as e:
                logger.warning("Error al leer CSV sintético en %s: %s. Intentando siguiente alternativa.", path, e)

    # Si no existe archivo físico, generar datos sintéticos en memoria
    logger.info("No se encontró archivo CSV preexistente. Generando %d registros sintéticos en memoria...", n_fallback)
    try:
        from src.generators.synthetic_data import generate_synthetic_incidents
        df_gen = generate_synthetic_incidents(n=n_fallback)
    except Exception:
        # Respaldo seguro si no se puede importar el generador del paquete
        try:
            from scripts.generate_synthetic_data import generate
            df_gen = generate(n=n_fallback)
        except Exception as e:
            logger.error("Error al importar generadores externos: %s. Creando dataset de emergencia.", e)
            df_gen = pd.DataFrame([
                {
                    "reportId": f"RPT-EMERGENCY-{i:04d}",
                    "createdAt": "2026-01-01T12:00:00",
                    "ds": "2026-01-01",
                    "macrodistrito": "Centro",
                    "latitude": -16.5000,
                    "longitude": -68.1193,
                    "category": "ROBO",
                    "status": "resolved",
                }
                for i in range(n_fallback)
            ])

    records = df_gen.to_dict(orient="records")
    return filter_valid_records(records)


def scan_dynamodb_table(
    table: Any,
    limit_per_page: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """
    Ejecuta un Scan completo con paginación nativa de DynamoDB utilizando
    ExclusiveStartKey / LastEvaluatedKey para manejar respuestas superiores a 1MB.
    """
    items: List[Dict[str, Any]] = []
    scan_kwargs: Dict[str, Any] = {}
    if limit_per_page is not None and limit_per_page > 0:
        scan_kwargs["Limit"] = limit_per_page

    page_number = 1
    while True:
        logger.debug("Escaneando página %d de DynamoDB...", page_number)
        response = table.scan(**scan_kwargs)

        page_items = response.get("Items", [])
        items.extend(page_items)
        logger.debug("Página %d recibida con %d registros.", page_number, len(page_items))

        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            logger.info("Escaneo completado. Total de páginas procesadas: %d, items leídos: %d", page_number, len(items))
            break

        # Paginación nativa: pasar el LastEvaluatedKey como ExclusiveStartKey
        scan_kwargs["ExclusiveStartKey"] = last_evaluated_key
        page_number += 1

    return items


def extract_reports(
    table_name: Optional[str] = None,
    min_records: Optional[int] = None,
    dynamodb_resource: Optional[Any] = None,
    dynamodb_table: Optional[Any] = None,
    fallback_csv_path: Optional[str] = None,
    endpoint_url: Optional[str] = None,
    region_name: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Función principal de extracción de reportes desde DynamoDB con tolerancia a fallas.

    Flujo de ejecución:
    1. Conecta con la tabla ReportsTable en DynamoDB.
    2. Realiza un Scan con paginación completa.
    3. Filtra registros válidos y descarta duplicados/cancelados.
    4. Mitiga riesgos:
       - Si ocurre un error de permisos IAM (AccessDeniedException, ClientError),
         activa el fallback a datos sintéticos sin detener el pipeline.
       - Si la cantidad de registros válidos es inferior a `min_records`,
         activa el fallback a datos sintéticos para evitar cold-start en modelos.
    """
    target_table_name = table_name or DEFAULT_TABLE_NAME
    threshold = DEFAULT_MIN_RECORDS if min_records is None else min_records

    logger.info("Iniciando extracción de reportes para la tabla: '%s'", target_table_name)

    # 1. Obtener objeto Table de DynamoDB
    table = dynamodb_table
    if table is None:
        try:
            if dynamodb_resource is None:
                if boto3 is None:
                    raise RuntimeError("El paquete 'boto3' no está instalado en el entorno.")
                region = region_name or DEFAULT_REGION
                endpoint = endpoint_url or os.getenv("DYNAMODB_ENDPOINT")
                dynamodb_resource = boto3.resource("dynamodb", region_name=region, endpoint_url=endpoint)
            table = dynamodb_resource.Table(target_table_name)
        except Exception as e:
            logger.warning(
                "[FALLBACK ACTIVADO] No fue posible inicializar el recurso DynamoDB para '%s': %s. "
                "Cargando datos sintéticos de respaldo.",
                target_table_name,
                e,
            )
            return load_synthetic_data(fallback_csv_path=fallback_csv_path)

    # 2. Escanear con paginación nativa y manejo de excepciones (IAM / Conexión)
    raw_records: List[Dict[str, Any]] = []
    try:
        raw_records = scan_dynamodb_table(table)
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code", "UnknownClientError")
        error_msg = e.response.get("Error", {}).get("Message", str(e))
        if error_code in {"AccessDeniedException", "UnauthorizedOperation", "AccessDenied", "AuthFailure"}:
            logger.error(
                "[RIESGO DETECTADO - FALLBACK ACTIVADO] Permisos IAM insuficientes para hacer Scan en '%s' "
                "(Código: %s, Detalle: %s). Activando fallback a datos sintéticos para no bloquear el flujo.",
                target_table_name,
                error_code,
                error_msg,
            )
        else:
            logger.warning(
                "[FALLBACK ACTIVADO] Error de cliente AWS al escanear '%s' (%s: %s). "
                "Activando fallback a datos sintéticos.",
                target_table_name,
                error_code,
                error_msg,
            )
        return load_synthetic_data(fallback_csv_path=fallback_csv_path)
    except (BotoCoreError, Exception) as e:
        logger.warning(
            "[FALLBACK ACTIVADO] Error inesperado o de conectividad al escanear '%s': %s. "
            "Activando fallback a datos sintéticos.",
            target_table_name,
            e,
        )
        return load_synthetic_data(fallback_csv_path=fallback_csv_path)

    # 3. Filtrar registros válidos
    valid_records = filter_valid_records(raw_records)
    logger.info("Registros brutos extraídos: %d | Registros válidos: %d", len(raw_records), len(valid_records))

    # 4. Verificar umbral de datos suficientes
    if len(valid_records) < threshold:
        logger.warning(
            "[FALLBACK ACTIVADO] Datos insuficientes en DynamoDB (%d registros válidos encontrados, "
            "mínimo requerido: %d). Activando fallback a datos sintéticos.",
            len(valid_records),
            threshold,
        )
        return load_synthetic_data(fallback_csv_path=fallback_csv_path)

    logger.info("Extracción completada satisfactoriamente desde DynamoDB con %d registros.", len(valid_records))
    return valid_records


# Alias para compatibilidad con diferentes nomenclaturas de pipeline
extract_data = extract_reports


if __name__ == "__main__":
    print("=" * 60)
    print("HALO v2 — Pipeline de Extracción (T-2.2)")
    print("=" * 60)
    dataset = extract_reports()
    print(f"Total registros obtenidos: {len(dataset)}")
    if dataset:
        print("Muestra del primer registro:")
        print(dataset[0])
    print("=" * 60)
