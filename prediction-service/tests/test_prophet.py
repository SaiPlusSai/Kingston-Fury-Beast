"""
test_prophet.py
===============
Pruebas unitarias para el modelo Meta Prophet (prediction-service/src/models/prophet_model.py).
Cumple con la tarea T-2.4 de OpenSpec y el requisito funcional RF-PRED-003:
1. Validación de la configuración explícita de estacionalidades (diaria, semanal, anual).
2. Validación del entrenamiento multizona iterando sin errores para 3 o más zonas.
3. Validación de pronóstico de exactamente 30 días con columnas obligatorias (yhat, yhat_lower, yhat_upper).
4. Validación del manejo de riesgo de convergencia (filtro de tamaño mínimo de muestra y captura de excepciones).
5. Validación de la generación y guardado de gráficas de pronóstico y componentes estacionales.
"""

import logging
import os
import shutil
import sys
import tempfile
import unittest
from unittest.mock import MagicMock, patch
import numpy as np
import pandas as pd

# Asegurar que prediction-service esté en el PYTHONPATH
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if SERVICE_ROOT not in sys.path:
    sys.path.insert(0, SERVICE_ROOT)

from src.models.prophet_model import (
    save_prophet_plots,
    train_multiple_zones,
    train_prophet,
    validate_prophet_input,
)


def _create_synthetic_zone_df(days: int = 60, base_val: float = 5.0) -> pd.DataFrame:
    """Helper para crear una serie temporal realista para pruebas rápidas."""
    dates = pd.date_range(start="2026-01-01", periods=days, freq="D").strftime("%Y-%m-%d")
    np.random.seed(42)
    # Tendencia leve + ciclo semanal
    y = [base_val + (i % 7) * 0.5 + np.random.normal(0, 0.2) for i in range(days)]
    return pd.DataFrame({"ds": dates, "y": y})


class TestProphetModel(unittest.TestCase):
    """Conjunto de pruebas para el entrenamiento y pronóstico con Prophet."""

    def setUp(self):
        """Configuración de directorio temporal y datos base."""
        self.test_dir = tempfile.mkdtemp()
        self.df_train = _create_synthetic_zone_df(days=45, base_val=4.0)

    def tearDown(self):
        """Limpieza de directorios temporales."""
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)

    # ──────────────────────────────────────────────────────────────────────────
    # 1. PRUEBA DE CONFIGURACIÓN DE ESTACIONALIDAD Y ENTRENAMIENTO BÁSICO
    # ──────────────────────────────────────────────────────────────────────────

    def test_prophet_seasonalities_explicitly_configured(self):
        """
        Valida que el modelo configure explícitamente las tres estacionalidades:
        diaria, semanal y anual.
        """
        result = train_prophet(
            df=self.df_train,
            zone_id="centro",
            periods=30,
            min_samples=14,
        )

        self.assertIsNotNone(result)
        model = result["model"]

        # Verificar configuración explícita de estacionalidades
        self.assertTrue(model.daily_seasonality, "daily_seasonality debe estar configurada en True")
        self.assertTrue(model.weekly_seasonality, "weekly_seasonality debe estar configurada en True")
        self.assertTrue(model.yearly_seasonality, "yearly_seasonality debe estar configurada en True")

    # ──────────────────────────────────────────────────────────────────────────
    # 2. PRUEBA DE PRONÓSTICO DE 30 DÍAS Y COLUMNAS OBLIGATORIAS
    # ──────────────────────────────────────────────────────────────────────────

    def test_forecast_exactly_30_days_with_required_columns(self):
        """
        Valida que el pronóstico a futuro contenga exactamente 30 filas y las
        columnas obligatorias: ds, yhat, yhat_lower, yhat_upper.
        """
        result = train_prophet(
            df=self.df_train,
            zone_id="max_paredes",
            periods=30,
            min_samples=14,
        )

        self.assertIsNotNone(result)
        forecast_df = result["forecast"]

        # 30 filas exactas para los 30 días proyectados
        self.assertEqual(len(forecast_df), 30, "El pronóstico a futuro debe tener exactamente 30 filas")

        # Columnas obligatorias presentes
        required_cols = ["ds", "yhat", "yhat_lower", "yhat_upper"]
        for col in required_cols:
            self.assertIn(col, forecast_df.columns, f"Columna requerida '{col}' no encontrada en el pronóstico")

        # Verificar consistencia de los intervalos de confianza
        self.assertTrue(
            (forecast_df["yhat_lower"] <= forecast_df["yhat_upper"]).all(),
            "yhat_lower debe ser menor o igual a yhat_upper para todos los días",
        )

        # Componentes estacionales accesibles
        components = result["components"]
        self.assertIn("trend", components)
        self.assertIn("weekly", components)

    # ──────────────────────────────────────────────────────────────────────────
    # 3. PRUEBA DE ENTRENAMIENTO MULTIZONA (3 O MÁS ZONAS)
    # ──────────────────────────────────────────────────────────────────────────

    def test_train_multiple_zones_for_3_or_more_zones(self):
        """
        Valida que train_multiple_zones itere y complete el entrenamiento
        para al menos 3 zonas diferentes sin producir errores.
        """
        zone_data = {
            "centro": _create_synthetic_zone_df(days=40, base_val=6.0),
            "max_paredes": _create_synthetic_zone_df(days=40, base_val=5.0),
            "sur": _create_synthetic_zone_df(days=40, base_val=2.5),
        }

        self.assertGreaterEqual(len(zone_data), 3)

        results = train_multiple_zones(
            zone_dataframes=zone_data,
            periods=30,
            min_samples=14,
            output_plots_dir=None,
        )

        # Las 3 zonas deben haberse procesado con éxito
        self.assertEqual(len(results), 3)
        for zone_id in ["centro", "max_paredes", "sur"]:
            self.assertIn(zone_id, results)
            self.assertEqual(len(results[zone_id]["forecast"]), 30)
            self.assertIn("yhat", results[zone_id]["forecast"].columns)

    # ──────────────────────────────────────────────────────────────────────────
    # 4. PRUEBA DE MANEJO DE RIESGOS: CONVERGENCIA Y TAMAÑO DE MUESTRA
    # ──────────────────────────────────────────────────────────────────────────

    def test_insufficient_sample_size_skips_training_with_warning(self):
        """
        Valida que si una zona tiene menos observaciones que min_samples,
        se registre un warning y se omita el entrenamiento devolviendo None.
        """
        # Solo 5 días de datos (insuficiente para min_samples=14)
        short_df = _create_synthetic_zone_df(days=5)

        logger = logging.getLogger("halo.prediction.prophet")
        with self.assertLogs(logger, level="WARNING") as log_context:
            result = train_prophet(
                df=short_df,
                zone_id="zona_pequena",
                min_samples=14,
            )

            self.assertIsNone(result)
            self.assertTrue(any("insuficiente" in msg for msg in log_context.output))

    def test_fitting_exception_is_caught_and_does_not_halt_other_zones(self):
        """
        Valida que si el ajuste (fitting) falla para una zona, se capture la excepción,
        se registre el error con logging y las demás zonas continúen normalmente.
        """
        zone_data = {
            "zona_valida_1": _create_synthetic_zone_df(days=35, base_val=4.0),
            "zona_con_fallo": _create_synthetic_zone_df(days=35, base_val=3.0),
            "zona_valida_2": _create_synthetic_zone_df(days=35, base_val=5.0),
        }

        # Simular fallo en fitting únicamente para "zona_con_fallo"
        original_fit = train_prophet

        def mock_train_prophet(df, zone_id, **kwargs):
            if zone_id == "zona_con_fallo":
                raise RuntimeError("Simulación de error Stan optimizer no convergió")
            return original_fit(df, zone_id, **kwargs)

        with patch("src.models.prophet_model.train_prophet", side_effect=mock_train_prophet):
            logger = logging.getLogger("halo.prediction.prophet")
            with self.assertLogs(logger, level="ERROR") as log_context:
                results = train_multiple_zones(zone_data, periods=30, output_plots_dir=None)

                # Las dos zonas válidas deben haberse procesado exitosamente
                self.assertIn("zona_valida_1", results)
                self.assertIn("zona_valida_2", results)
                self.assertNotIn("zona_con_fallo", results)

                # Se debió registrar el error en log sin detener la ejecución
                self.assertTrue(any("zona_con_fallo" in msg for msg in log_context.output))

    # ──────────────────────────────────────────────────────────────────────────
    # 5. PRUEBA DE GENERACIÓN Y GUARDADO DE GRÁFICAS DE EVIDENCIA
    # ──────────────────────────────────────────────────────────────────────────

    def test_save_prophet_plots_generates_valid_png_files(self):
        """
        Valida que se generen y guarden en disco la gráfica principal de predicción
        y la gráfica de componentes estacionales.
        """
        result = train_prophet(
            df=self.df_train,
            zone_id="centro_test",
            periods=30,
            output_plots_dir=self.test_dir,
        )

        self.assertIsNotNone(result)
        plot_paths = result["plot_paths"]

        forecast_path = plot_paths.get("forecast_plot")
        components_path = plot_paths.get("components_plot")

        self.assertIsNotNone(forecast_path)
        self.assertIsNotNone(components_path)

        # Los archivos deben existir y tener un tamaño mayor a 0 bytes
        self.assertTrue(os.path.isfile(forecast_path), f"El archivo {forecast_path} no fue creado")
        self.assertGreater(os.path.getsize(forecast_path), 0, "El archivo de pronóstico está vacío")

        self.assertTrue(os.path.isfile(components_path), f"El archivo {components_path} no fue creado")
        self.assertGreater(os.path.getsize(components_path), 0, "El archivo de componentes está vacío")


if __name__ == "__main__":
    unittest.main()
