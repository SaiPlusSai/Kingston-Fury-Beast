"""
test_transform.py
=================
Pruebas unitarias para el módulo de transformación (prediction-service/src/pipeline/transform.py).
Cumple estrictamente con los requerimientos de la tarea T-2.3 de OpenSpec:
1. Validación de la correcta asignación de zonas espaciales.
2. Validación de la agrupación diaria con formato obligatorio ['ds', 'y'].
3. Validación del relleno estricto de fechas intermedias faltantes con 0.
4. Validación de la ausencia total de valores NaN en los DataFrames finales.
5. Validación de la emisión de log (WARNING) ante coordenadas fuera del bounding box sin descartar silenciosamente.
"""

import logging
import os
import sys
import unittest
import pandas as pd

# Asegurar que prediction-service esté en el sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if SERVICE_ROOT not in sys.path:
    sys.path.insert(0, SERVICE_ROOT)

from src.pipeline.transform import (
    assign_zone,
    extract_bounding_box,
    is_inside_bounding_box,
    load_zones_config,
    transform_data,
)


class TestTransformPipeline(unittest.TestCase):
    """Conjunto de pruebas para el pipeline de transformación y agregación."""

    def setUp(self):
        """Configuración de fixtures y datos de prueba controlados."""
        self.sample_config = {
            "boundingBox": {
                "north": -16.4500,
                "south": -16.6000,
                "east": -68.0500,
                "west": -68.2000,
                "lat_min": -16.6000,
                "lat_max": -16.4500,
                "lon_min": -68.2000,
                "lon_max": -68.0500,
            },
            "zones": [
                {
                    "zoneId": "centro",
                    "zoneName": "Centro",
                    "centerLatitude": -16.5000,
                    "centerLongitude": -68.1193,
                    "radiusKm": 2.5,
                    "bounds": {
                        "north": -16.4850,
                        "south": -16.5150,
                        "east": -68.1050,
                        "west": -68.1350,
                    },
                },
                {
                    "zoneId": "sur",
                    "zoneName": "Sur",
                    "centerLatitude": -16.5500,
                    "centerLongitude": -68.0800,
                    "radiusKm": 4.0,
                    "bounds": {
                        "north": -16.5300,
                        "south": -16.5700,
                        "east": -68.0650,
                        "west": -68.0950,
                    },
                },
            ],
        }
        self.bbox = extract_bounding_box(self.sample_config)

    # ──────────────────────────────────────────────────────────────────────────
    # 1. PRUEBA DE ASIGNACIÓN CORRECTA DE ZONAS
    # ──────────────────────────────────────────────────────────────────────────

    def test_assign_zone_correctly_by_coordinates(self):
        """
        Valida que un incidente dentro de los límites de una zona específica
        sea correctamente asignado a dicha zona.
        """
        incident_centro = {
            "reportId": "RPT-001",
            "latitude": -16.5000,
            "longitude": -68.1193,
            "createdAt": "2026-03-01T10:00:00",
        }
        incident_sur = {
            "reportId": "RPT-002",
            "latitude": -16.5500,
            "longitude": -68.0800,
            "createdAt": "2026-03-01T11:00:00",
        }

        zone_1 = assign_zone(incident_centro, self.sample_config["zones"], self.bbox)
        zone_2 = assign_zone(incident_sur, self.sample_config["zones"], self.bbox)

        self.assertEqual(zone_1, "centro")
        self.assertEqual(zone_2, "sur")

    def test_assign_zone_by_macrodistrito_fallback(self):
        """
        Valida que si no hay coordenadas pero sí el campo macrodistrito/district,
        el incidente se asocie adecuadamente a la zona.
        """
        incident = {
            "reportId": "RPT-003",
            "macrodistrito": "Centro",
            "createdAt": "2026-03-01T12:00:00",
        }
        zone = assign_zone(incident, self.sample_config["zones"], self.bbox)
        self.assertEqual(zone, "centro")

    # ──────────────────────────────────────────────────────────────────────────
    # 2. PRUEBA DE AGRUPACIÓN DIARIA Y FORMATO OBLIGATORIO (ds, y)
    # ──────────────────────────────────────────────────────────────────────────

    def test_daily_grouping_format_and_columns(self):
        """
        Valida que cada DataFrame resultante tenga obligatoriamente las columnas
        'ds' (fecha) e 'y' (frecuencia diaria), y calcule los conteos correctamente.
        """
        incidents = [
            # 2 incidentes el 2026-03-01 en Centro
            {"reportId": "R-1", "latitude": -16.5000, "longitude": -68.1193, "createdAt": "2026-03-01T08:00:00"},
            {"reportId": "R-2", "latitude": -16.5000, "longitude": -68.1193, "createdAt": "2026-03-01T18:00:00"},
            # 1 incidente el 2026-03-02 en Centro
            {"reportId": "R-3", "latitude": -16.5000, "longitude": -68.1193, "createdAt": "2026-03-02T12:00:00"},
            # 1 incidente el 2026-03-01 en Sur
            {"reportId": "R-4", "latitude": -16.5500, "longitude": -68.0800, "createdAt": "2026-03-01T14:00:00"},
        ]

        dfs = transform_data(incidents, zones_config=self.sample_config)

        self.assertIn("centro", dfs)
        self.assertIn("sur", dfs)

        df_centro = dfs["centro"]
        # Columnas obligatorias
        self.assertListEqual(list(df_centro.columns), ["ds", "y"])

        # Verificación del conteo por día
        conteo_dia1 = df_centro.loc[df_centro["ds"] == "2026-03-01", "y"].values[0]
        conteo_dia2 = df_centro.loc[df_centro["ds"] == "2026-03-02", "y"].values[0]

        self.assertEqual(conteo_dia1, 2)
        self.assertEqual(conteo_dia2, 1)

    # ──────────────────────────────────────────────────────────────────────────
    # 3. PRUEBA DE RELLENO DE FECHAS FALTANTES CON 0
    # ──────────────────────────────────────────────────────────────────────────

    def test_fill_missing_dates_with_zeros(self):
        """
        Valida que todas las fechas faltantes dentro del rango temporal sean
        rellenadas automáticamente con 0, garantizando continuidad diaria.
        """
        incidents = [
            # Día 1
            {"reportId": "R-10", "latitude": -16.5000, "longitude": -68.1193, "createdAt": "2026-03-01T10:00:00"},
            # Día 4 (días 2 y 3 no tienen incidentes)
            {"reportId": "R-11", "latitude": -16.5000, "longitude": -68.1193, "createdAt": "2026-03-04T10:00:00"},
        ]

        dfs = transform_data(incidents, zones_config=self.sample_config)
        df_centro = dfs["centro"]

        # Debe tener 4 filas consecutivas: 2026-03-01, 2026-03-02, 2026-03-03, 2026-03-04
        self.assertEqual(len(df_centro), 4)
        fechas_esperadas = ["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04"]
        self.assertListEqual(list(df_centro["ds"]), fechas_esperadas)

        # Frecuencias esperadas: [1, 0, 0, 1]
        self.assertListEqual(list(df_centro["y"]), [1, 0, 0, 1])

        # En la zona Sur (sin incidentes), todos los 4 días deben tener frecuencia 0
        df_sur = dfs["sur"]
        self.assertEqual(len(df_sur), 4)
        self.assertListEqual(list(df_sur["y"]), [0, 0, 0, 0])

    # ──────────────────────────────────────────────────────────────────────────
    # 4. PRUEBA DE AUSENCIA TOTAL DE VALORES NaN
    # ──────────────────────────────────────────────────────────────────────────

    def test_no_nan_values_in_final_dataframes(self):
        """
        Valida rigurosamente que ninguno de los DataFrames resultantes contenga NaNs
        en ninguna celda, incluso en zonas con series totalmente vacías.
        """
        incidents = [
            {"reportId": "R-20", "latitude": -16.5000, "longitude": -68.1193, "createdAt": "2026-03-01T10:00:00"},
            {"reportId": "R-21", "latitude": -16.5000, "longitude": -68.1193, "createdAt": "2026-03-05T10:00:00"},
        ]

        dfs = transform_data(incidents, zones_config=self.sample_config)

        for zone_id, df_zone in dfs.items():
            nan_count = df_zone.isna().sum().sum()
            null_count = df_zone.isnull().sum().sum()
            self.assertEqual(nan_count, 0, f"La zona {zone_id} contiene valores NaN")
            self.assertEqual(null_count, 0, f"La zona {zone_id} contiene valores Null")
            # Los tipos deben ser str para ds e int para y
            self.assertTrue(pd.api.types.is_integer_dtype(df_zone["y"]))

    # ──────────────────────────────────────────────────────────────────────────
    # 5. PRUEBA DE MANEJO DE RIESGO: WARNING POR COORDENADAS FUERA DEL BBOX
    # ──────────────────────────────────────────────────────────────────────────

    def test_warning_logged_for_coordinates_outside_bounding_box(self):
        """
        Valida que cuando un incidente tiene coordenadas fuera del bounding box,
        se emita un log de nivel WARNING y el incidente sea descartado para no
        corromper la delimitación geográfica de la ciudad.
        """
        # BBOX: lat [-16.60, -16.45], lon [-68.20, -68.05]
        # Coordenadas intencionalmente fuera de rango (ej. Santa Cruz: -17.78, -63.18)
        incident_fuera = {
            "reportId": "RPT-OUT-OF-BOUNDS-99",
            "latitude": -17.7833,
            "longitude": -63.1821,
            "createdAt": "2026-03-01T15:00:00",
        }
        incident_dentro = {
            "reportId": "RPT-VALID-01",
            "latitude": -16.5000,
            "longitude": -68.1193,
            "createdAt": "2026-03-01T15:00:00",
        }

        logger = logging.getLogger("halo.prediction.transform")

        with self.assertLogs(logger, level="WARNING") as log_context:
            dfs = transform_data([incident_fuera, incident_dentro], zones_config=self.sample_config)

            # Verificar que el log contenga el ID del reporte y mencione el bounding box
            warning_messages = [msg for msg in log_context.output if "WARNING" in msg]
            self.assertTrue(any("RPT-OUT-OF-BOUNDS-99" in m for m in warning_messages))
            self.assertTrue(any("bounding box" in m for m in warning_messages))

        # Verificar que el incidente fuera del bounding box fue descartado y no sumó en Centro
        df_centro = dfs["centro"]
        self.assertEqual(df_centro["y"].sum(), 1)  # Solo RPT-VALID-01 sumó


if __name__ == "__main__":
    unittest.main()
