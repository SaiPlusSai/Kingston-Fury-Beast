"""
arima_model.py
==============
Module for training and forecasting urban incidents using ARIMA models (statsmodels).
Implements task BUILD-08 and fulfills baseline comparison requirements against Prophet.

Key features:
1. Automated ARIMA(p, d, q) fitting over numeric time-series vectors.
2. Out-of-sample forecasting with confidence intervals.
3. Exception isolation per zone to ensure multi-zone reliability.
4. Export of visual forecast plots for model evaluation and reporting.
5. Strict type hints and structured logging.
6. Robust datetime handling using Python standard library to ensure compatibility with Python 3.13 / NumPy 2.x.
"""

import datetime
import logging
import os
import warnings
from typing import Any, Dict, Optional, Tuple
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

warnings.filterwarnings("ignore")

logger = logging.getLogger("halo.prediction.arima")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [arima_model.py]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

DEFAULT_FORECAST_PERIODS = 30
DEFAULT_MIN_SAMPLES = 14
DEFAULT_ORDER = (1, 1, 1)
DEFAULT_PLOTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "output", "plots")
)


def validate_arima_input(df: pd.DataFrame, zone_id: str, min_samples: int) -> bool:
    """Validate DataFrame structure and sample count for ARIMA modeling."""
    if df is None or not isinstance(df, pd.DataFrame):
        logger.warning("Zone '%s': Invalid input (not a pandas DataFrame).", zone_id)
        return False

    required_columns = {"ds", "y"}
    if not required_columns.issubset(df.columns):
        logger.warning(
            "Zone '%s': DataFrame missing required columns %s.",
            zone_id,
            required_columns - set(df.columns),
        )
        return False

    if len(df) < min_samples:
        logger.warning(
            "Zone '%s': Insufficient observations (%d < %d required).",
            zone_id,
            len(df),
            min_samples,
        )
        return False

    return True


def train_arima(
    df: pd.DataFrame,
    zone_id: str,
    periods: int = DEFAULT_FORECAST_PERIODS,
    order: Tuple[int, int, int] = DEFAULT_ORDER,
    min_samples: int = DEFAULT_MIN_SAMPLES,
    output_plots_dir: Optional[str] = DEFAULT_PLOTS_DIR,
) -> Optional[Dict[str, Any]]:
    """
    Fit an ARIMA model for a given zone and produce a forecast dataframe.
    """
    if not validate_arima_input(df, zone_id, min_samples):
        return None

    try:
        clean_df = df.copy()
        clean_df["ds_str"] = clean_df["ds"].astype(str).str.slice(0, 10)
        daily_counts = clean_df.groupby("ds_str")["y"].sum().to_dict()

        sorted_dates_str = sorted(daily_counts.keys())
        first_dt = datetime.datetime.strptime(sorted_dates_str[0], "%Y-%m-%d").date()
        last_dt = datetime.datetime.strptime(sorted_dates_str[-1], "%Y-%m-%d").date()

        num_days = (last_dt - first_dt).days + 1
        all_dates = [first_dt + datetime.timedelta(days=i) for i in range(num_days)]
        y_values = np.array([float(daily_counts.get(d.isoformat(), 0.0)) for d in all_dates], dtype=float)

        logger.info("Fitting ARIMA %s for zone '%s' (%d observations)...", order, zone_id, len(y_values))
        try:
            model = ARIMA(y_values, order=order)
            fitted_model = model.fit()
        except Exception as fit_err:
            logger.warning("ARIMA %s fit failed for zone '%s': %s. Falling back to ARIMA(1,0,0)", order, zone_id, fit_err)
            model = ARIMA(y_values, order=(1, 0, 0))
            fitted_model = model.fit()

        future_dates = [last_dt + datetime.timedelta(days=i) for i in range(1, periods + 1)]
        future_dates_str = [d.isoformat() for d in future_dates]

        forecast_res = fitted_model.get_forecast(steps=periods)
        pred_mean = np.array(forecast_res.predicted_mean)
        conf_int = np.array(forecast_res.conf_int(alpha=0.05))

        forecast_df = pd.DataFrame({
            "ds": future_dates_str,
            "yhat": np.maximum(0.0, pred_mean),
            "yhat_lower": np.maximum(0.0, conf_int[:, 0]),
            "yhat_upper": np.maximum(0.0, conf_int[:, 1]),
        })

        if output_plots_dir:
            os.makedirs(output_plots_dir, exist_ok=True)
            safe_name = zone_id.lower().replace(" ", "_")
            plot_path = os.path.join(output_plots_dir, f"arima_{safe_name}_forecast.png")
            fig, ax = plt.subplots(figsize=(10, 5))
            
            recent_slice = min(60, len(all_dates))
            recent_dates_str = [d.isoformat() for d in all_dates[-recent_slice:]]
            recent_y = y_values[-recent_slice:]
            
            ax.plot(recent_dates_str, recent_y, label="Historical (last 60d)", color="#2b5c8f")
            ax.plot(forecast_df["ds"], forecast_df["yhat"], label="ARIMA Forecast", color="#e65100", linestyle="--")
            ax.fill_between(
                forecast_df["ds"],
                forecast_df["yhat_lower"],
                forecast_df["yhat_upper"],
                color="#ffe0b2",
                alpha=0.5,
                label="95% CI",
            )
            ax.set_title(f"ARIMA Forecast (30 Days) — Zone: {zone_id}")
            ax.set_xlabel("Date")
            ax.set_ylabel("Predicted Incidents")
            ax.legend()
            ax.grid(True, linestyle=":", alpha=0.6)
            # Reduce tick clutter
            ax.xaxis.set_major_locator(plt.MaxNLocator(8))
            plt.xticks(rotation=30)
            plt.tight_layout()
            fig.savefig(plot_path, dpi=120)
            plt.close(fig)
            logger.info("Saved ARIMA forecast plot to %s", plot_path)

        return {
            "zone_id": zone_id,
            "model": fitted_model,
            "forecast": forecast_df,
            "aic": float(fitted_model.aic),
            "bic": float(fitted_model.bic),
        }

    except Exception as e:
        logger.error("Failed to fit ARIMA model for zone '%s': %s", zone_id, e, exc_info=True)
        return None


def train_multiple_zones(
    zone_dataframes: Dict[str, pd.DataFrame],
    periods: int = DEFAULT_FORECAST_PERIODS,
    order: Tuple[int, int, int] = DEFAULT_ORDER,
    min_samples: int = DEFAULT_MIN_SAMPLES,
    output_plots_dir: Optional[str] = DEFAULT_PLOTS_DIR,
) -> Dict[str, Dict[str, Any]]:
    """Train ARIMA models across all provided zones."""
    results: Dict[str, Dict[str, Any]] = {}
    logger.info("Starting multi-zone ARIMA training for %d zones...", len(zone_dataframes))

    for zone_id, df_zone in zone_dataframes.items():
        res = train_arima(
            df=df_zone,
            zone_id=zone_id,
            periods=periods,
            order=order,
            min_samples=min_samples,
            output_plots_dir=output_plots_dir,
        )
        if res is not None:
            results[zone_id] = res

    return results
