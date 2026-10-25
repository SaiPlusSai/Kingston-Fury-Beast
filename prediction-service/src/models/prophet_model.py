"""
prophet_model.py
================
Módulo de entrenamiento y pronóstico de incidentes urbanos utilizando Meta Prophet.
Cumple con la tarea T-2.4 de OpenSpec y el requisito funcional RF-PRED-003.

Características principales:
1. Configuración explícita de estacionalidades: diaria, semanal y anual.
2. Generación de pronóstico a 30 días con intervalos de incertidumbre (yhat, yhat_lower, yhat_upper).
3. Mitigación de riesgos de convergencia:
   - Validación del tamaño mínimo de la muestra antes del ajuste.
   - Manejo de excepciones en fitting sin interrumpir la ejecución de otras zonas.
4. Exportación y almacenamiento de evidencias gráficas:
   - Gráfica de pronóstico (plot nativo de Prophet).
   - Gráfica de descomposición de componentes estacionales (plot_components nativo de Prophet).
5. Calidad de código: Type hints estrictos y docstrings explicativos.
"""

import logging
import os
from typing import Any, Dict, List, Optional
import matplotlib
# Configurar backend no interactivo para entornos headless / Lambda / CI
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

try:
    from prophet import Prophet
except ImportError:
    try:
        from fbprophet import Prophet  # type: ignore
    except ImportError:
        Prophet = None  # type: ignore

# Configuración de logging
logger = logging.getLogger("halo.prediction.prophet")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [prophet_model.py]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Configuración por defecto
DEFAULT_FORECAST_PERIODS = 30
DEFAULT_MIN_SAMPLES = 14
DEFAULT_PLOTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "output", "plots")
)


def validate_prophet_input(df: pd.DataFrame, zone_id: str, min_samples: int) -> bool:
    """
    Valida que el DataFrame de entrada cumpla con la estructura y volumen mínimos
    requeridos para asegurar la convergencia de Prophet.

    Parámetros:
    -----------
    df : pd.DataFrame
        DataFrame con datos históricos de la zona.
    zone_id : str
        Identificador de la zona geográfica.
    min_samples : int
        Número mínimo de observaciones requeridas.

    Retorna:
    --------
    bool
        True si los datos son válidos y suficientes; False en caso contrario.
    """
    if df is None or not isinstance(df, pd.DataFrame):
        logger.warning("Zona '%s': Entrada inválida (no es un DataFrame de pandas).", zone_id)
        return False

    required_columns = {"ds", "y"}
    if not required_columns.issubset(df.columns):
        logger.warning(
            "Zona '%s': Columnas requeridas no encontradas. Esperadas: %s, Recibidas: %s",
            zone_id,
            required_columns,
            list(df.columns),
        )
        return False

    if len(df) < min_samples:
        logger.warning(
            "Zona '%s': Tamaño de muestra insuficiente (%d observaciones, mínimo requerido: %d). "
            "Omitiendo entrenamiento para evitar errores de convergencia.",
            zone_id,
            len(df),
            min_samples,
        )
        return False

    return True


def save_prophet_plots(
    model: Any,
    forecast: pd.DataFrame,
    zone_id: str,
    output_dir: str = DEFAULT_PLOTS_DIR,
) -> Dict[str, str]:
    """
    Genera y guarda en disco las gráficas de evidencia del modelo:
    1. Pronóstico general (observaciones históricas + predicción + bandas de incertidumbre).
    2. Componentes estacionales descompuestos (tendencia, semanal, anual, diaria).

    Parámetros:
    -----------
    model : Prophet
        Modelo Prophet previamente ajustado.
    forecast : pd.DataFrame
        DataFrame de predicción generado por model.predict().
    zone_id : str
        Identificador de la zona geográfica (utilizado para el nombre del archivo).
    output_dir : str
        Directorio donde se guardarán los archivos PNG.

    Retorna:
    --------
    Dict[str, str]
        Diccionario con las rutas de las gráficas generadas.
    """
    os.makedirs(output_dir, exist_ok=True)
    clean_zone = zone_id.lower().replace(" ", "_")

    forecast_plot_path = os.path.join(output_dir, f"prophet_{clean_zone}_forecast.png")
    components_plot_path = os.path.join(output_dir, f"prophet_{clean_zone}_components.png")

    # 1. Gráfica principal de predicción
    try:
        fig_forecast = model.plot(forecast)
        plt.title(f"HALO v2 — Pronóstico Prophet (30 días): {zone_id}", fontsize=12)
        fig_forecast.savefig(forecast_plot_path, dpi=150, bbox_inches="tight")
        plt.close(fig_forecast)
        logger.info("Gráfica de pronóstico guardada en: %s", forecast_plot_path)
    except Exception as e:
        logger.error("Error al generar gráfica de pronóstico para zona '%s': %s", zone_id, e)

    # 2. Gráfica de componentes estacionales
    try:
        fig_components = model.plot_components(forecast)
        fig_components.savefig(components_plot_path, dpi=150, bbox_inches="tight")
        plt.close(fig_components)
        logger.info("Gráfica de componentes guardada en: %s", components_plot_path)
    except Exception as e:
        logger.error("Error al generar gráfica de componentes para zona '%s': %s", zone_id, e)

    return {
        "forecast_plot": forecast_plot_path,
        "components_plot": components_plot_path,
    }


def train_prophet(
    df: pd.DataFrame,
    zone_id: str,
    periods: int = DEFAULT_FORECAST_PERIODS,
    min_samples: int = DEFAULT_MIN_SAMPLES,
    output_plots_dir: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """
    Entrena un modelo Prophet para una zona geográfica específica y genera un
    pronóstico a futuro de exactamente `periods` días (por defecto 30).

    Parámetros:
    -----------
    df : pd.DataFrame
        DataFrame con columnas ['ds', 'y'] para la zona.
    zone_id : str
        Identificador de la zona geográfica.
    periods : int
        Días a predecir hacia el futuro (por defecto 30).
    min_samples : int
        Umbral mínimo de datos para proceder con el entrenamiento.
    output_plots_dir : Optional[str]
        Directorio opcional para guardar las gráficas de evidencia.

    Retorna:
    --------
    Optional[Dict[str, Any]]
        Diccionario con:
        - 'zone_id': Identificador de la zona
        - 'model': Objeto Prophet entrenado
        - 'forecast': DataFrame con exactamente `periods` filas a futuro y columnas
                      ['ds', 'yhat', 'yhat_lower', 'yhat_upper']
        - 'full_forecast': DataFrame completo (histórico + futuro)
        - 'components': Resumen de componentes estacionales extraídos
        - 'plot_paths': Rutas de las gráficas guardadas (si aplica)
        Retorna None si la validación o el fitting fallan.
    """
    if Prophet is None:
        raise ImportError("La librería 'prophet' no se encuentra instalada en el entorno.")

    # 1. Validación de tamaño de muestra y calidad de entrada
    if not validate_prophet_input(df, zone_id, min_samples=min_samples):
        return None

    # Normalizar DataFrame de entrenamiento
    train_df = df[["ds", "y"]].copy()
    train_df["ds"] = pd.to_datetime(train_df["ds"])
    train_df["y"] = pd.to_numeric(train_df["y"], errors="coerce").fillna(0.0)

    # 2. Configuración explícita del modelo con estacionalidades
    logger.info("Configurando e inicializando modelo Prophet para zona '%s'...", zone_id)
    model = Prophet(
        yearly_seasonality=True,   # Estacionalidad anual explícita
        weekly_seasonality=True,   # Estacionalidad semanal explícita
        daily_seasonality=True,    # Estacionalidad diaria explícita
        interval_width=0.95,       # Intervalo de incertidumbre al 95%
        growth="linear",           # Tendencia lineal
        changepoint_prior_scale=0.05,
        seasonality_prior_scale=10.0,
    )

    # 3. Entrenamiento protegido con try/except (Manejo de Riesgo de Convergencia)
    try:
        logger.info("Ajustando modelo Prophet para zona '%s' con %d observaciones...", zone_id, len(train_df))
        model.fit(train_df)
    except Exception as fit_error:
        logger.error(
            "Fallo de convergencia o ajuste en Prophet para zona '%s': %s. "
            "Se continúa la ejecución de las demás zonas.",
            zone_id,
            fit_error,
            exc_info=True,
        )
        return None

    # 4. Generación de predicción a futuro (exactamente 30 días)
    future = model.make_future_dataframe(periods=periods, freq="D")
    full_forecast = model.predict(future)

    # Extraer exactamente los últimos `periods` días correspondientes a la proyección futura
    future_forecast = full_forecast.tail(periods).copy().reset_index(drop=True)

    # Asegurar la presencia estricta de las columnas obligatorias
    required_cols = ["ds", "yhat", "yhat_lower", "yhat_upper"]
    for col in required_cols:
        if col not in future_forecast.columns:
            raise KeyError(f"La columna requerida '{col}' no está en la salida del pronóstico.")

    logger.info(
        "Pronóstico generado con éxito para zona '%s': %d días proyectados (yhat promedio: %.2f)",
        zone_id,
        len(future_forecast),
        future_forecast["yhat"].mean(),
    )

    # 5. Interpretación de componentes estacionales
    components_summary: Dict[str, Any] = {}
    for comp in ["trend", "weekly", "yearly", "daily"]:
        if comp in full_forecast.columns:
            components_summary[comp] = {
                "mean": float(full_forecast[comp].mean()),
                "min": float(full_forecast[comp].min()),
                "max": float(full_forecast[comp].max()),
                "std": float(full_forecast[comp].std()),
            }

    # 6. Generar y guardar gráficas si se especifica directorio
    plot_paths: Dict[str, str] = {}
    if output_plots_dir:
        plot_paths = save_prophet_plots(
            model=model,
            forecast=full_forecast,
            zone_id=zone_id,
            output_dir=output_plots_dir,
        )

    return {
        "zone_id": zone_id,
        "model": model,
        "forecast": future_forecast,       # Exactamente 30 filas con yhat, yhat_lower, yhat_upper
        "full_forecast": full_forecast,   # Histórico completo + 30 días
        "components": components_summary, # Componentes estacionales interpretables
        "plot_paths": plot_paths,
    }


def train_multiple_zones(
    zone_dataframes: Dict[str, pd.DataFrame],
    periods: int = DEFAULT_FORECAST_PERIODS,
    min_samples: int = DEFAULT_MIN_SAMPLES,
    output_plots_dir: Optional[str] = DEFAULT_PLOTS_DIR,
) -> Dict[str, Dict[str, Any]]:
    """
    Itera y entrena modelos Prophet para 3 o más zonas geográficas distintas.
    Garantiza aislamiento de fallos: Si una zona no converge o falla, se registra
    en el log y las demás zonas continúan su procesamiento normalmente.

    Parámetros:
    -----------
    zone_dataframes : Dict[str, pd.DataFrame]
        Mapeo de zone_id a DataFrame con columnas ['ds', 'y'].
    periods : int
        Días de predicción futura (por defecto 30).
    min_samples : int
        Mínimo de registros para entrenar.
    output_plots_dir : Optional[str]
        Carpeta donde almacenar las gráficas resultantes.

    Retorna:
    --------
    Dict[str, Dict[str, Any]]
        Diccionario con los resultados de entrenamiento de cada zona exitosa.
    """
    results: Dict[str, Dict[str, Any]] = {}
    total_zones = len(zone_dataframes)
    logger.info("Iniciando entrenamiento multizona Prophet para %d zonas...", total_zones)

    for idx, (zone_id, df_zone) in enumerate(zone_dataframes.items(), start=1):
        logger.info("[%d/%d] Procesando entrenamiento para zona: '%s'", idx, total_zones, zone_id)
        try:
            zone_result = train_prophet(
                df=df_zone,
                zone_id=zone_id,
                periods=periods,
                min_samples=min_samples,
                output_plots_dir=output_plots_dir,
            )
            if zone_result is not None:
                results[zone_id] = zone_result
                logger.info("Zona '%s' entrenada exitosamente.", zone_id)
            else:
                logger.warning("Zona '%s' no pudo ser entrenada (resultado None).", zone_id)
        except Exception as e:
            # Aislamiento de excepciones: no detener el ciclo de las demás zonas
            logger.error("Excepción inesperada en entrenamiento de zona '%s': %s", zone_id, e, exc_info=True)

    logger.info(
        "Entrenamiento multizona finalizado: %d de %d zonas procesadas con éxito.",
        len(results),
        total_zones,
    )
    return results


# Aliases para compatibilidad
train_prophet_model = train_prophet
train_zones = train_multiple_zones


if __name__ == "__main__":
    import sys
    _service_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    if _service_root not in sys.path:
        sys.path.insert(0, _service_root)

    from src.pipeline.extract import extract_reports
    from src.pipeline.transform import transform_data

    print("=" * 65)
    print("  HALO v2 — Entrenamiento y Pronóstico Prophet (T-2.4)")
    print("=" * 65)

    raw_data = extract_reports()
    zone_dfs = transform_data(raw_data)

    print(f"Total zonas disponibles: {len(zone_dfs)}")

    # Seleccionar al menos 3 zonas para demostración
    selected_zones = {k: zone_dfs[k] for k in list(zone_dfs.keys())[:3]}
    multi_results = train_multiple_zones(selected_zones, output_plots_dir=DEFAULT_PLOTS_DIR)

    for z_name, res in multi_results.items():
        fc = res["forecast"]
        print(f"\n--- Zona: {z_name} ---")
        print(f"Filas de pronóstico futuro: {len(fc)}")
        print(fc[["ds", "yhat", "yhat_lower", "yhat_upper"]].head(3))

    print("=" * 65)
