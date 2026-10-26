"""
transform.py
============
Módulo de transformación y agregación de datos para el pipeline de predicción HALO v2.
Cumple con la tarea T-2.3 de OpenSpec y el requisito funcional RF-PRED-001.

Responsabilidades principales:
1. Lectura y validación de la configuración de zonas desde config/zones.json.
2. Mitigación de riesgos: Registro explícito con logging.warning de incidentes con
   coordenadas fuera del bounding box antes de ser descartados (evita pérdida silenciosa de datos).
3. Asignación espacial de incidentes a su correspondiente zona geográfica.
4. Agregación temporal por zona en frecuencia diaria con columnas normalizadas obligatorias: ['ds', 'y'].
5. Limpieza de datos: Relleno completo de fechas faltantes con 0 y garantía total de 0 valores NaN.
"""

import json
import logging
import math
import os
from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd

# Configuración de logging
logger = logging.getLogger("halo.prediction.transform")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [transform.py]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Rutas estándar de configuración
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DEFAULT_ZONES_CONFIG = os.path.join(BASE_DIR, "config", "zones.json")


def load_zones_config(config_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Carga la configuración de zonas geográficas y bounding box desde archivo JSON.
    """
    candidate_paths = []
    if config_path:
        candidate_paths.append(config_path)
    env_path = os.getenv("ZONES_CONFIG_PATH")
    if env_path:
        candidate_paths.append(env_path)
    candidate_paths.append(DEFAULT_ZONES_CONFIG)
    candidate_paths.append(os.path.join(os.getcwd(), "config", "zones.json"))

    for path in candidate_paths:
        if path and os.path.isfile(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    config = json.load(f)
                    logger.info("Configuración de zonas cargada exitosamente desde: %s", path)
                    return config
            except Exception as e:
                logger.error("Error al leer archivo de configuración de zonas en %s: %s", path, e)

    raise FileNotFoundError(
        f"No se pudo encontrar el archivo de configuración zones.json. "
        f"Rutas verificadas: {candidate_paths}"
    )


def extract_bounding_box(config: Dict[str, Any]) -> Tuple[float, float, float, float]:
    """
    Extrae los límites del bounding box (lat_min, lat_max, lon_min, lon_max)
    desde el diccionario de configuración de zones.json.
    """
    bbox = config.get("boundingBox") or config.get("bounding_box") or config.get("bounds") or {}

    # Soporte para formato lat_min/lat_max/lon_min/lon_max
    if "lat_min" in bbox and "lat_max" in bbox and "lon_min" in bbox and "lon_max" in bbox:
        return (
            float(bbox["lat_min"]),
            float(bbox["lat_max"]),
            float(bbox["lon_min"]),
            float(bbox["lon_max"]),
        )

    # Soporte para formato cardinal (north, south, east, west)
    if "north" in bbox and "south" in bbox and "east" in bbox and "west" in bbox:
        return (
            float(bbox["south"]),  # lat_min
            float(bbox["north"]),  # lat_max
            float(bbox["west"]),   # lon_min
            float(bbox["east"]),   # lon_max
        )

    # Si no hay bounding box global explícito, calcular unión de los bounds de las zonas
    zones = config.get("zones", [])
    if zones:
        lats_min, lats_max, lons_min, lons_max = [], [], [], []
        for z in zones:
            b = z.get("bounds", {})
            if "south" in b and "north" in b and "west" in b and "east" in b:
                lats_min.append(float(b["south"]))
                lats_max.append(float(b["north"]))
                lons_min.append(float(b["west"]))
                lons_max.append(float(b["east"]))
            elif "centerLatitude" in z and "centerLongitude" in z:
                c_lat = float(z["centerLatitude"])
                c_lon = float(z["centerLongitude"])
                r = float(z.get("radiusKm", 3.0)) * 0.01  # aproximación en grados
                lats_min.append(c_lat - r)
                lats_max.append(c_lat + r)
                lons_min.append(c_lon - r)
                lons_max.append(c_lon + r)
        if lats_min:
            return min(lats_min), max(lats_max), min(lons_min), max(lons_max)

    # Fallback por defecto para La Paz
    return -16.65, -16.40, -68.25, -68.00


def is_inside_bounding_box(lat: float, lon: float, bbox: Tuple[float, float, float, float]) -> bool:
    """Valida si un punto (lat, lon) cae estrictamente dentro del bounding box."""
    lat_min, lat_max, lon_min, lon_max = bbox
    return (lat_min <= lat <= lat_max) and (lon_min <= lon <= lon_max)


def assign_zone(
    incident: Dict[str, Any],
    zones: List[Dict[str, Any]],
    bbox: Tuple[float, float, float, float],
) -> Optional[str]:
    """
    Asigna un incidente a una zona definida en config/zones.json.
    
    Mitigación de riesgo:
    - Si las coordenadas caen fuera del bounding box, emite un WARNING y descarta el incidente.
    - Si no posee coordenadas válidas, evalúa si ya posee macrodistrito/district mapeable.
    - Si posee coordenadas dentro del bounding box, evalúa bounds de cada zona o distancia euclidiana
      al centroide de la zona más cercana.
    """
    incident_id = (
        incident.get("reportId")
        or incident.get("report_id")
        or incident.get("id")
        or "SIN_ID"
    )

    lat_raw = incident.get("latitude")
    lon_raw = incident.get("longitude")

    has_valid_coords = False
    lat, lon = 0.0, 0.0
    if lat_raw is not None and lon_raw is not None:
        try:
            lat = float(lat_raw)
            lon = float(lon_raw)
            if not (math.isnan(lat) or math.isnan(lon)):
                has_valid_coords = True
        except (ValueError, TypeError):
            has_valid_coords = False

    # Validar bounding box si hay coordenadas
    if has_valid_coords:
        if not is_inside_bounding_box(lat, lon, bbox):
            logger.warning(
                "Incidente descartado: coordenadas fuera del bounding box. "
                "ID: %s, latitud: %s, longitud: %s, BBOX: [lat: %.4f..%.4f, lon: %.4f..%.4f]",
                incident_id,
                lat,
                lon,
                bbox[0],
                bbox[1],
                bbox[2],
                bbox[3],
            )
            return None

        # 1. Asignación por bounds de zona específica
        for z in zones:
            b = z.get("bounds", {})
            if "north" in b and "south" in b and "east" in b and "west" in b:
                if (float(b["south"]) <= lat <= float(b["north"])) and (float(b["west"]) <= lon <= float(b["east"])):
                    return z.get("zoneId") or z.get("zoneName")

        # 2. Asignación por cercanía al centroide de la zona más próxima
        best_zone = None
        min_distance = float("inf")
        for z in zones:
            c_lat = z.get("centerLatitude")
            c_lon = z.get("centerLongitude")
            if c_lat is not None and c_lon is not None:
                dist = math.hypot(lat - float(c_lat), lon - float(c_lon))
                if dist < min_distance:
                    min_distance = dist
                    best_zone = z.get("zoneId") or z.get("zoneName")

        if best_zone is not None:
            return best_zone

    # 3. Fallback: mapeo por nombre de distrito/macrodistrito si el incidente lo incluye
    text_zone = (
        incident.get("macrodistrito")
        or incident.get("district")
        or incident.get("zone_id")
        or incident.get("zoneName")
    )
    if text_zone:
        text_zone_norm = str(text_zone).strip().lower()
        for z in zones:
            z_id = str(z.get("zoneId", "")).strip().lower()
            z_name = str(z.get("zoneName", "")).strip().lower()
            if text_zone_norm in {z_id, z_name} or z_id in text_zone_norm or z_name in text_zone_norm:
                return z.get("zoneId") or z.get("zoneName")

    logger.warning(
        "Incidente descartado: no se pudo asociar a ninguna zona geográfica válida. ID: %s",
        incident_id,
    )
    return None


def _extract_date_str(val: Any) -> Optional[str]:
    """Extrae una cadena de fecha normalizada en formato YYYY-MM-DD."""
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return None
    s = str(val).strip()
    if len(s) >= 10:
        return s[:10]
    return None


def transform_data(
    incidents: Union[List[Dict[str, Any]], pd.DataFrame],
    config_path: Optional[str] = None,
    zones_config: Optional[Dict[str, Any]] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> Dict[str, pd.DataFrame]:
    """
    Transforma la lista o DataFrame de incidentes crudos en DataFrames agrupados por zona.

    Parámetros:
    -----------
    incidents : Union[List[Dict[str, Any]], pd.DataFrame]
        Incidentes crudos extraídos de DynamoDB o datos sintéticos.
    config_path : Optional[str]
        Ruta personalizada a zones.json.
    zones_config : Optional[Dict[str, Any]]
        Diccionario de configuración de zonas inyectado directamente (útil para tests).
    start_date : Optional[str]
        Fecha de inicio forzada para la serie temporal ('YYYY-MM-DD').
    end_date : Optional[str]
        Fecha de fin forzada para la serie temporal ('YYYY-MM-DD').

    Retorna:
    --------
    Dict[str, pd.DataFrame]
        Diccionario donde cada clave es el ID de la zona y el valor es un DataFrame
        con exactamente las columnas ['ds', 'y'], sin fechas faltantes y con 0 NaNs.
    """
    # 1. Cargar configuración de zonas y bounding box
    config = zones_config if zones_config is not None else load_zones_config(config_path)
    zones = config.get("zones", [])
    if not zones:
        raise ValueError("La configuración no contiene ninguna zona definida en 'zones'.")

    bbox = extract_bounding_box(config)
    logger.info(
        "Bounding box de trabajo: lat [%.4f, %.4f], lon [%.4f, %.4f] | Total zonas: %d",
        bbox[0],
        bbox[1],
        bbox[2],
        bbox[3],
        len(zones),
    )

    # 2. Normalizar incidentes a lista de diccionarios
    if isinstance(incidents, pd.DataFrame):
        records = incidents.to_dict(orient="records")
    elif isinstance(incidents, list):
        records = incidents
    else:
        raise TypeError(f"Formato no soportado para 'incidents': {type(incidents)}")

    logger.info("Iniciando transformación de %d incidentes crudos...", len(records))

    # 3. Asignación de zona y extracción de fecha
    assigned_records: List[Dict[str, Any]] = []
    all_dates: List[str] = []

    for item in records:
        if not isinstance(item, dict):
            continue

        assigned_zone = assign_zone(item, zones, bbox)
        if not assigned_zone:
            continue  # Ya se emitió warning en assign_zone

        # Extraer fecha
        date_str = (
            _extract_date_str(item.get("ds"))
            or _extract_date_str(item.get("createdAt"))
            or _extract_date_str(item.get("timestamp"))
            or _extract_date_str(item.get("date"))
        )
        if not date_str:
            logger.warning("Incidente descartado por no contener fecha válida: %s", item)
            continue

        assigned_records.append({
            "zone_id": assigned_zone,
            "ds": date_str,
        })
        all_dates.append(date_str)

    if not assigned_records:
        logger.warning("No se asignaron incidentes a ninguna zona válida.")
        # Retornar DataFrames vacíos estructurados para cada zona
        return {
            z.get("zoneId") or z.get("zoneName"): pd.DataFrame(columns=["ds", "y"])
            for z in zones
        }

    # 4. Determinar rango continuo de fechas para la serie temporal
    min_date = start_date or min(all_dates)
    max_date = end_date or max(all_dates)

    full_date_range = pd.date_range(start=min_date, end=max_date, freq="D").strftime("%Y-%m-%d")
    df_timeline = pd.DataFrame({"ds": full_date_range})

    df_assigned = pd.DataFrame(assigned_records)

    # 5. Generar DataFrames diarios por cada zona garantizando 0 NaNs y relleno de 0
    result_dataframes: Dict[str, pd.DataFrame] = {}

    for z in zones:
        zone_id = z.get("zoneId") or z.get("zoneName")
        if not zone_id:
            continue

        # Filtrar incidentes de esta zona
        zone_subset = df_assigned[df_assigned["zone_id"] == zone_id]

        if not zone_subset.empty:
            # Conteo de frecuencia diaria
            daily_counts = (
                zone_subset.groupby("ds")
                .size()
                .reset_index(name="y")
            )
        else:
            daily_counts = pd.DataFrame(columns=["ds", "y"])

        # Unir con el timeline completo para rellenar fechas faltantes con 0
        df_zone = pd.merge(df_timeline, daily_counts, on="ds", how="left")

        # Relleno estricto de ceros y conversión a entero
        df_zone["y"] = df_zone["y"].fillna(0).astype(int)

        # Ordenar cronológicamente y resetear índice
        df_zone.sort_values("ds", inplace=True)
        df_zone.reset_index(drop=True, inplace=True)

        # Verificación estricta: ninguna columna puede contener NaN
        if df_zone.isna().any().any():
            raise ValueError(f"El DataFrame resultante para la zona '{zone_id}' contiene valores NaN.")

        # Garantizar que las únicas columnas finales sean ['ds', 'y']
        df_zone = df_zone[["ds", "y"]]

        result_dataframes[zone_id] = df_zone
        logger.info(
            "Zona '%s' procesada: %d días cubiertos (fechas: %s a %s), incidentes totales: %d",
            zone_id,
            len(df_zone),
            min_date,
            max_date,
            df_zone["y"].sum(),
        )

    return result_dataframes


# Alias para compatibilidad con nomenclatura de pipeline
transform_incidents = transform_data


if __name__ == "__main__":
    from src.pipeline.extract import extract_reports
    print("=" * 60)
    print("HALO v2 — Pipeline de Transformación (T-2.3)")
    print("=" * 60)
    raw_data = extract_reports()
    zone_dfs = transform_data(raw_data)
    print(f"Total zonas generadas: {len(zone_dfs)}")
    for z_name, df_z in zone_dfs.items():
        print(f"\n--- Zona: {z_name} ---")
        print(df_z.head(3))
        print(f"Total días: {len(df_z)} | NaNs: {df_z.isna().sum().sum()} | Incidentes: {df_z['y'].sum()}")
    print("=" * 60)
