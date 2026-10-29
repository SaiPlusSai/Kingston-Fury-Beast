"""
exp002_runner.py
================
Script reproducible para ejecutar el experimento EXP-002:
Prophet con hiperparámetros ajustados (changepoint_prior_scale=0.01, seasonality_mode='multiplicative').
Evalúa en holdouts de 73 y 14 días y exporta resultados a JSON.
"""

import os
import sys
import json
import logging
from typing import Dict, Any

import pandas as pd
import numpy as np

# Asegurar path al módulo prediction-service
current_dir = os.path.dirname(os.path.abspath(__file__))
pred_service_dir = os.path.abspath(os.path.join(current_dir, ".."))
if pred_service_dir not in sys.path:
    sys.path.insert(0, pred_service_dir)

from src.models.evaluator import run_prophet_isolated, calculate_metrics

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s: %(message)s")
logger = logging.getLogger("exp002")

DATA_PATH = os.path.join(pred_service_dir, "data", "raw", "synthetic_lapaz_v1.csv")
OUTPUT_DIR = os.path.join(pred_service_dir, "output")

ZONES = [
    "Centro",
    "Max Paredes",
    "Periférica",
    "Cotahuma",
    "San Antonio",
    "Sur",
    "Mallasa"
]

def load_daily_series(csv_path: str) -> Dict[str, pd.DataFrame]:
    """Carga y procesa series diarias por macrodistrito."""
    df = pd.read_csv(csv_path)
    df["fecha"] = pd.to_datetime(df["fecha"])
    
    # Rango de fechas completo para evitar huecos en días sin incidentes
    full_range = pd.date_range(df["fecha"].min(), df["fecha"].max(), freq="D")
    zones_data = {}

    for zone in ZONES:
        z_df = df[df["macrodistrito"] == zone].copy()
        daily_counts = z_df.groupby("fecha").size().reindex(full_range, fill_value=0).reset_index()
        daily_counts.columns = ["ds", "y"]
        zones_data[zone] = daily_counts

    return zones_data

def run_exp002():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    logger.info("Cargando dataset desde: %s", DATA_PATH)
    zones_data = load_daily_series(DATA_PATH)
    
    holdouts = [73, 14]
    results = {}

    for h in holdouts:
        logger.info("--- Ejecutando EXP-002 con Holdout = %d días ---", h)
        results[str(h)] = {"global": {}, "per_zone": {}}
        zone_metrics_list = []

        for zone in ZONES:
            df_zone = zones_data[zone]
            train_df = df_zone.iloc[:-h].copy()
            test_df = df_zone.iloc[-h:].copy()
            test_y = test_df["y"].values

            # Hiperparámetros de EXP-002
            preds = run_prophet_isolated(train_df, h)
            if preds is None or len(preds) != h:
                logger.warning("Fallo al predecir para zona %s en holdout %d", zone, h)
                continue

            mets = calculate_metrics(test_y, preds)
            zone_key = zone.lower().replace(" ", "_").replace("é", "e").replace("á", "a")
            results[str(h)]["per_zone"][zone_key] = mets
            zone_metrics_list.append(mets)
            logger.info("Zona %s -> RMSE: %.4f, MAE: %.4f, MAPE: %.2f%%", zone, mets["RMSE"], mets["MAE"], mets["MAPE"])

        # Promedios globales
        if zone_metrics_list:
            results[str(h)]["global"] = {
                "MAE": round(float(np.mean([m["MAE"] for m in zone_metrics_list])), 4),
                "RMSE": round(float(np.mean([m["RMSE"] for m in zone_metrics_list])), 4),
                "MAPE": round(float(np.mean([m["MAPE"] for m in zone_metrics_list])), 4),
                "R2": round(float(np.mean([m["R2"] for m in zone_metrics_list])), 4),
            }

    out_file = os.path.join(OUTPUT_DIR, "exp002_results_2026-10-29.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    logger.info("Resultados de EXP-002 exportados con éxito a %s", out_file)

if __name__ == "__main__":
    run_exp002()
