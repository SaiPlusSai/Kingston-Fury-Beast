"""
synthetic_data.py
=================
Generador de datos sintéticos calibrados de incidentes urbanos para la ciudad de La Paz (Bolivia).
Satisface el requerimiento RF-PRED-002 y la tarea T-2.1 de OpenSpec.
"""

from datetime import date, datetime, timedelta
import hashlib
import os
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

RANDOM_SEED = 42
N_INCIDENTS = 10_000
START_DATE = date(2023, 9, 1)
END_DATE = date(2026, 8, 31)

DEFAULT_RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw")
DEFAULT_CSV_PATH = os.path.join(DEFAULT_RAW_DIR, "synthetic_lapaz_v1.csv")

MACRODISTRITOS = {
    "Max Paredes": (0.24, -16.4950, -68.1400, 0.030),
    "Centro": (0.22, -16.5000, -68.1193, 0.020),
    "Periférica": (0.17, -16.4700, -68.1100, 0.040),
    "Cotahuma": (0.14, -16.5100, -68.1400, 0.035),
    "San Antonio": (0.12, -16.5300, -68.1000, 0.040),
    "Sur": (0.07, -16.5500, -68.0800, 0.045),
    "Mallasa": (0.04, -16.5800, -68.0500, 0.055),
}

CATEGORIAS = ["ROBO", "ACCIDENTE", "VANDALISMO", "INCENDIO", "EMERGENCIA", "OTRO"]
PESOS_CATEGORIA = [0.38, 0.28, 0.14, 0.08, 0.07, 0.05]

SEVERIDADES = [1, 2, 3]
PESOS_SEVERIDAD = [0.55, 0.33, 0.12]

CANALES = ["APP_MOVIL", "WEB", "LLAMADA", "DIRECTO"]
PESOS_CANAL = [0.50, 0.25, 0.15, 0.10]

ESTADOS = ["RESUELTO", "EN_PROCESO", "PENDIENTE"]
PESOS_ESTADO = [0.65, 0.20, 0.15]

PATRON_HORARIO = {
    0: 0.3, 1: 0.2, 2: 0.2, 3: 0.2, 4: 0.3, 5: 0.5,
    6: 0.8, 7: 1.1, 8: 1.4, 9: 1.3, 10: 1.2, 11: 1.1,
    12: 1.0, 13: 1.1, 14: 1.0, 15: 1.0, 16: 1.1, 17: 1.3,
    18: 1.5, 19: 1.7, 20: 1.9, 21: 2.0, 22: 1.8, 23: 1.0,
}
_hora_pesos = np.array([PATRON_HORARIO[h] for h in range(24)])
_hora_pesos = _hora_pesos / _hora_pesos.sum()

PATRON_SEMANAL = {0: 0.80, 1: 0.88, 2: 0.92, 3: 1.00, 4: 1.35, 5: 1.45, 6: 0.72}

FESTIVOS_BOLIVIA = {
    date(2023, 11, 2), date(2023, 12, 25),
    date(2024, 1, 1), date(2024, 1, 22), date(2024, 2, 11),
    date(2024, 2, 12), date(2024, 3, 29), date(2024, 5, 1),
    date(2024, 6, 21), date(2024, 7, 16), date(2024, 8, 6),
    date(2024, 11, 2), date(2024, 12, 25),
    date(2025, 1, 1), date(2025, 1, 22), date(2025, 2, 16),
    date(2025, 2, 17), date(2025, 3, 3), date(2025, 4, 3),
    date(2025, 5, 1), date(2025, 6, 21), date(2025, 7, 16),
    date(2025, 8, 6), date(2025, 11, 2), date(2025, 12, 25),
    date(2026, 1, 1), date(2026, 1, 22), date(2026, 2, 16),
    date(2026, 2, 17), date(2026, 3, 3), date(2026, 4, 3),
    date(2026, 5, 1), date(2026, 6, 21), date(2026, 7, 16),
    date(2026, 8, 6),
}

ID_PREFIX = {
    "Max Paredes": "MP", "Centro": "CE", "Periférica": "PE",
    "Cotahuma": "CO", "San Antonio": "SA", "Sur": "SU", "Mallasa": "MA",
}


def assign_zone(lat: float, lon: float, grid_size: float = 0.005) -> str:
    """Asigna coordenadas a una celda de cuadrícula de ~500m × 500m."""
    return f"GRID-{int(lat / grid_size)}-{int(lon / grid_size)}"


def generate_synthetic_incidents(
    start_date: date = START_DATE,
    end_date: date = END_DATE,
    n: int = N_INCIDENTS,
    seed: int = RANDOM_SEED,
) -> pd.DataFrame:
    """
    Genera un DataFrame con incidentes sintéticos calibrados según macrodistritos y estacionalidad.
    """
    rng = np.random.default_rng(seed)
    total_days = (end_date - start_date).days + 1
    all_dates = [start_date + timedelta(days=i) for i in range(total_days)]

    date_weights = np.array([
        PATRON_SEMANAL[d.weekday()] * (1.70 if d in FESTIVOS_BOLIVIA else 1.0)
        for d in all_dates
    ])
    date_weights = date_weights / date_weights.sum()

    sampled_days = rng.choice(len(all_dates), size=n, p=date_weights)
    md_names = list(MACRODISTRITOS.keys())
    md_weights = np.array([MACRODISTRITOS[m][0] for m in md_names])
    md_weights = md_weights / md_weights.sum()
    sampled_mds = rng.choice(len(md_names), size=n, p=md_weights)

    sampled_hours = rng.choice(24, size=n, p=_hora_pesos)
    sampled_minutes = rng.integers(0, 60, size=n)
    sampled_cats = rng.choice(CATEGORIAS, size=n, p=PESOS_CATEGORIA)
    sampled_sevs = rng.choice(SEVERIDADES, size=n, p=PESOS_SEVERIDAD)
    sampled_chans = rng.choice(CANALES, size=n, p=PESOS_CANAL)
    sampled_stats = rng.choice(ESTADOS, size=n, p=PESOS_ESTADO)

    records: List[Dict[str, Any]] = []
    for i in range(n):
        md_name = md_names[sampled_mds[i]]
        _, lat_c, lon_c, radius = MACRODISTRITOS[md_name]

        angle = rng.uniform(0, 2 * np.pi)
        distance = rng.uniform(0, radius)
        lat = lat_c + distance * np.cos(angle)
        lon = lon_c + distance * np.sin(angle)

        day_idx = sampled_days[i]
        cur_date = all_dates[day_idx]
        hour = int(sampled_hours[i])
        minute = int(sampled_minutes[i])
        ts = datetime(cur_date.year, cur_date.month, cur_date.day, hour, minute)

        prefix = ID_PREFIX[md_name]
        report_id = f"RPT-{prefix}-{ts.strftime('%Y%m%d')}-{i:05d}"

        records.append({
            "reportId": report_id,
            "report_id": report_id,
            "timestamp": ts.isoformat(),
            "createdAt": ts.isoformat(),
            "ds": cur_date.isoformat(),
            "hour": hour,
            "weekday": cur_date.weekday(),
            "macrodistrito": md_name,
            "district": md_name,
            "zone_id": assign_zone(lat, lon),
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "categoria": sampled_cats[i],
            "category": sampled_cats[i],
            "severidad": int(sampled_sevs[i]),
            "severity": "high" if sampled_sevs[i] == 3 else ("medium" if sampled_sevs[i] == 2 else "low"),
            "canal_reporte": sampled_chans[i],
            "estado": sampled_stats[i],
            "status": "resolved" if sampled_stats[i] == "RESUELTO" else ("in_progress" if sampled_stats[i] == "EN_PROCESO" else "pending"),
            "is_holiday": int(cur_date in FESTIVOS_BOLIVIA),
        })

    df = pd.DataFrame(records)
    df.sort_values("timestamp", inplace=True)
    df.reset_index(drop=True, inplace=True)
    return df


def generate(n: int = N_INCIDENTS, seed: int = RANDOM_SEED) -> pd.DataFrame:
    """Wrapper compatible con scripts de generación existentes."""
    return generate_synthetic_incidents(n=n, seed=seed)


def generate_synthetic_records(n: int = 1000, seed: int = RANDOM_SEED) -> List[Dict[str, Any]]:
    """Devuelve los incidentes generados como una lista de diccionarios Python."""
    df = generate_synthetic_incidents(n=n, seed=seed)
    return df.to_dict(orient="records")


if __name__ == "__main__":
    os.makedirs(DEFAULT_RAW_DIR, exist_ok=True)
    df_gen = generate_synthetic_incidents(n=5000)
    df_gen.to_csv(DEFAULT_CSV_PATH, index=False, encoding="utf-8")
    print(f"Generated {len(df_gen)} synthetic records at {DEFAULT_CSV_PATH}")
