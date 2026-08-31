# Spec: Predicción de Hotspots con Modelos Estadísticos (Prophet / ARIMA)

## 1. Resumen de la Capacidad

Este documento especifica todos los requisitos funcionales y no funcionales para el módulo de Predicción de Hotspots de Incidentes Urbanos de la plataforma HALO. Este módulo constituye el componente principal de Inteligencia Artificial del proyecto, satisfaciendo los requerimientos académicos de la materia de Taller de Sistemas Inteligentes.

El objetivo es implementar modelos estadísticos de series de tiempo propios — sin depender de soluciones pre-empaquetadas como Amazon Forecast — que sean capaces de analizar el historial de incidentes reportados en la plataforma HALO, identificar patrones temporales y geográficos, y generar predicciones sobre cuándo y dónde es más probable que ocurran futuros incidentes.

Los modelos seleccionados son:
- **Prophet (Meta):** Como modelo principal, por su capacidad de manejar estacionalidades múltiples, datos faltantes y cambios de tendencia, con una API de Python extremadamente simple y resultados interpretables.
- **ARIMA / SARIMA:** Como modelo de comparación y validación cruzada, para demostrar versatilidad y permitir análisis de las diferencias en precisión entre ambos enfoques.

Las predicciones se visualizarán en el Dashboard de Administración mediante gráficas interactivas de "Predicción vs Realidad" y un mapa de calor predictivo, permitiendo a las autoridades tomar decisiones proactivas sobre asignación de recursos.

---

## 2. Requisitos Funcionales

### 2.1 Pipeline de Datos

#### RF-PRED-001: Extracción de Datos Históricos de Incidentes
- **Descripción:** El sistema debe ser capaz de extraer todos los registros históricos de incidentes desde la tabla `ReportsTable` de DynamoDB y transformarlos en un formato adecuado para el entrenamiento de modelos de series de tiempo.
- **Fuente de Datos:**
  - **Tabla:** `ReportsTable` (DynamoDB)
  - **Campos relevantes:**
    - `reportId` (String): Identificador único del reporte.
    - `category` (String): Categoría del incidente (robo, accidente, infraestructura, etc.).
    - `status` (String): Estado del reporte (pending, in_progress, resolved, closed).
    - `latitude` (Number): Latitud de la ubicación del incidente.
    - `longitude` (Number): Longitud de la ubicación del incidente.
    - `createdAt` (String, ISO 8601): Fecha y hora de creación del reporte.
    - `severity` (String): Nivel de urgencia (low, medium, high, critical).
    - `district` (String): Zona o distrito donde ocurrió el incidente.
- **Transformación (ETL):**
  1. **Scan completo** de `ReportsTable` (o query por índice de fecha si el volumen es muy grande).
  2. **Filtrado:** Excluir reportes con status `cancelled` o `duplicate`.
  3. **Asignación de zona:** Si el campo `district` no existe, calcular la zona asignando cada par `(latitude, longitude)` a un cuadrante de una cuadrícula predefinida de la ciudad (grid de NxN celdas sobre el bounding box geográfico, ej: 10x10 = 100 zonas).
  4. **Agregación temporal:** Contar la frecuencia de incidentes por zona y por intervalo temporal (hora, día, semana).
  5. **Generación del DataFrame:**
     ```python
     # Formato para Prophet
     df_zone_A = pd.DataFrame({
         'ds': ['2026-01-01', '2026-01-02', ...],  # Fechas
         'y': [3, 5, 2, 7, ...]                      # Frecuencia de incidentes
     })
     ```
  6. **Almacenamiento intermedio:** Guardar el DataFrame procesado como CSV en S3 (`s3://halo-predictions/data/processed/{zone_id}/{date}.csv`) para evitar re-procesar en cada entrenamiento.
- **Criterio de Aceptación:** El pipeline extrae correctamente todos los registros válidos de `ReportsTable`, los agrupa por zona y tiempo, y genera DataFrames válidos para Prophet y ARIMA.

#### RF-PRED-002: Generación de Datos Sintéticos (Dataset de Entrenamiento)
- **Descripción:** Si la cantidad de datos históricos reales en `ReportsTable` es insuficiente para entrenar un modelo confiable (menos de 90 días de datos con al menos 3 incidentes diarios promedio), el sistema debe generar datos sintéticos realistas que complementen o sustituyan los datos reales.
- **Características de los datos sintéticos:**
  1. **Distribución temporal realista:**
     - Mayor frecuencia de incidentes en horarios nocturnos (20:00 - 03:00) para robos y seguridad.
     - Mayor frecuencia de accidentes de tránsito en horas pico (07:00-09:00 y 17:00-19:00).
     - Mayor frecuencia de reportes de infraestructura en horarios laborales (08:00-17:00).
     - Componente estacional semanal: más incidentes viernes y sábados.
     - Componente estacional mensual: variaciones por época del año (lluvias = más inundaciones y baches).
  2. **Distribución geográfica realista:**
     - Zonas comerciales/centro: mayor concentración de robos.
     - Avenidas principales: mayor concentración de accidentes.
     - Zonas residenciales periféricas: mayor concentración de reportes de infraestructura.
     - Aplicar distribución gaussiana bidimensional alrededor de "centros de actividad" predefinidos.
  3. **Volumen:** Generar al menos 365 días de datos (1 año), con un promedio de 15-30 incidentes diarios distribuidos entre todas las zonas y categorías.
  4. **Ruido:** Incluir ruido aleatorio (distribución de Poisson) para simular la variabilidad natural de los eventos.
- **Script de generación:**
  ```python
  # generate_synthetic_data.py
  import numpy as np
  import pandas as pd
  from datetime import datetime, timedelta
  
  def generate_synthetic_incidents(
      start_date: str = '2025-09-01',
      end_date: str = '2026-08-31',
      num_zones: int = 10,
      avg_daily_incidents: int = 20,
      seed: int = 42
  ) -> pd.DataFrame:
      """
      Genera un dataset sintético de incidentes urbanos con patrones
      temporales y geográficos realistas.
      """
      np.random.seed(seed)
      # ... implementación ...
  ```
- **Criterio de Aceptación:** Los datos sintéticos generados presentan patrones estacionales claros (diarios, semanales, mensuales) que Prophet puede detectar y modelar; las gráficas de los datos sintéticos se ven realistas y no uniformes.

### 2.2 Entrenamiento de Modelos

#### RF-PRED-003: Entrenamiento con Prophet (Modelo Principal)
- **Descripción:** Implementar el entrenamiento de un modelo Prophet para cada zona geográfica, capaz de predecir la frecuencia de incidentes futuros.
- **Configuración del modelo:**
  ```python
  from prophet import Prophet
  
  def train_prophet_model(df: pd.DataFrame, zone_id: str) -> dict:
      """
      Entrena un modelo Prophet para una zona específica.
      
      Args:
          df: DataFrame con columnas 'ds' (datetime) y 'y' (frecuencia)
          zone_id: Identificador de la zona geográfica
      
      Returns:
          dict con el modelo serializado, métricas de evaluación,
          y predicciones generadas.
      """
      model = Prophet(
          # Estacionalidad
          yearly_seasonality=True,      # Patrones anuales (lluvias, etc.)
          weekly_seasonality=True,      # Patrones semanales (fines de semana)
          daily_seasonality=True,       # Patrones diarios (horas pico)
          
          # Hiperparámetros
          changepoint_prior_scale=0.05, # Sensibilidad a cambios de tendencia
          seasonality_prior_scale=10,    # Fuerza de la estacionalidad
          
          # Intervalos de incertidumbre
          interval_width=0.95,           # Intervalo de confianza del 95%
          
          # Manejo de outliers
          growth='linear',               # Crecimiento lineal (no logístico)
      )
      
      # Agregar estacionalidades personalizadas
      model.add_seasonality(
          name='hourly',
          period=1,            # 1 día
          fourier_order=8      # Complejidad de la forma
      )
      
      # Agregar regresores externos (si disponibles)
      # model.add_regressor('is_holiday')
      # model.add_regressor('is_rainy_season')
      
      # Entrenamiento
      model.fit(df)
      
      # Generación de predicciones futuras
      future = model.make_future_dataframe(
          periods=30,          # Predecir 30 días al futuro
          freq='D'             # Frecuencia diaria
      )
      forecast = model.predict(future)
      
      return {
          'model': model,
          'forecast': forecast,
          'zone_id': zone_id
      }
  ```
- **Datos de entrada:** DataFrame con columnas `ds` y `y` para cada zona, con al menos 90 días de datos históricos.
- **Salida del modelo (forecast DataFrame):**
  | Columna | Tipo | Descripción |
  |---|---|---|
  | `ds` | datetime | Fecha/hora de la predicción |
  | `yhat` | float | Valor predicho (frecuencia esperada de incidentes) |
  | `yhat_lower` | float | Límite inferior del intervalo de confianza (95%) |
  | `yhat_upper` | float | Límite superior del intervalo de confianza (95%) |
  | `trend` | float | Componente de tendencia a largo plazo |
  | `weekly` | float | Componente estacional semanal |
  | `daily` | float | Componente estacional diario |
  | `yearly` | float | Componente estacional anual |
- **Criterio de Aceptación:** El modelo se entrena sin errores para al menos 3 zonas diferentes; genera predicciones a 30 días con intervalos de confianza; los componentes estacionales son interpretables y razonables.

#### RF-PRED-004: Entrenamiento con ARIMA/SARIMA (Modelo Comparativo)
- **Descripción:** Implementar un modelo ARIMA o SARIMA como alternativa y punto de comparación contra Prophet, permitiendo evaluar cuál modelo se ajusta mejor a los datos de incidentes de HALO.
- **Implementación:**
  ```python
  from statsmodels.tsa.statespace.sarimax import SARIMAX
  from statsmodels.tsa.stattools import adfuller
  import pmdarima as pm  # auto_arima
  
  def train_arima_model(df: pd.DataFrame, zone_id: str) -> dict:
      """
      Entrena un modelo SARIMA para una zona específica.
      Utiliza auto_arima para seleccionar automáticamente los
      mejores hiperparámetros (p, d, q)(P, D, Q, s).
      """
      # Test de estacionaridad (Dickey-Fuller Aumentado)
      adf_result = adfuller(df['y'].dropna())
      is_stationary = adf_result[1] < 0.05  # p-value < 0.05
      
      # Auto ARIMA para selección de parámetros
      auto_model = pm.auto_arima(
          df['y'],
          start_p=0, max_p=5,
          start_q=0, max_q=5,
          d=None,                    # Determinado automáticamente
          seasonal=True,
          start_P=0, max_P=3,
          start_Q=0, max_Q=3,
          D=None,                    # Determinado automáticamente
          m=7,                       # Estacionalidad semanal (7 días)
          stepwise=True,             # Búsqueda eficiente
          suppress_warnings=True,
          error_action='ignore',
          trace=True                 # Mostrar progreso
      )
      
      # Entrenar SARIMAX con los parámetros óptimos
      order = auto_model.order           # (p, d, q)
      seasonal_order = auto_model.seasonal_order  # (P, D, Q, s)
      
      model = SARIMAX(
          df['y'],
          order=order,
          seasonal_order=seasonal_order,
          enforce_stationarity=False,
          enforce_invertibility=False
      )
      fitted_model = model.fit(disp=False)
      
      # Predicción a 30 días
      forecast = fitted_model.get_forecast(steps=30)
      forecast_df = pd.DataFrame({
          'ds': pd.date_range(start=df['ds'].iloc[-1] + pd.Timedelta(days=1), periods=30),
          'yhat': forecast.predicted_mean.values,
          'yhat_lower': forecast.conf_int().iloc[:, 0].values,
          'yhat_upper': forecast.conf_int().iloc[:, 1].values
      })
      
      return {
          'model': fitted_model,
          'forecast': forecast_df,
          'order': order,
          'seasonal_order': seasonal_order,
          'aic': fitted_model.aic,
          'bic': fitted_model.bic,
          'zone_id': zone_id
      }
  ```
- **Criterio de Aceptación:** El modelo SARIMA se entrena sin errores con parámetros seleccionados automáticamente; genera predicciones comparables a Prophet; se documentan los valores de AIC/BIC para cada zona.

#### RF-PRED-005: Evaluación y Comparación de Modelos
- **Descripción:** El sistema debe evaluar la precisión de ambos modelos (Prophet y ARIMA) utilizando métricas estándar de series de tiempo, y presentar una comparación visual.
- **Metodología de Evaluación:**
  1. **Train-Test Split:** Usar los últimos 20% de los datos como conjunto de prueba (holdout set).
  2. **Validación Cruzada Temporal (Time Series Cross-Validation):** Para Prophet, usar la función `cross_validation()` incorporada con horizonte de 14 días.
  3. **Métricas calculadas:**

     | Métrica | Fórmula | Interpretación |
     |---|---|---|
     | **MAE** (Mean Absolute Error) | `mean(abs(y - yhat))` | Error promedio absoluto en unidades de incidentes |
     | **RMSE** (Root Mean Squared Error) | `sqrt(mean((y - yhat)²))` | Error cuadrático medio; penaliza errores grandes |
     | **MAPE** (Mean Absolute Percentage Error) | `mean(abs((y - yhat) / y)) * 100` | Error porcentual promedio |
     | **R²** (Coeficiente de Determinación) | `1 - SS_res / SS_tot` | Proporción de varianza explicada por el modelo |
     | **AIC** (Akaike Information Criterion) | Solo para ARIMA | Calidad relativa del modelo (menor = mejor) |
     | **BIC** (Bayesian Information Criterion) | Solo para ARIMA | Similar a AIC con penalización por complejidad |

  4. **Tabla de comparación generada:**
     ```
     ╔══════════════════════════════════════════════════════════════╗
     ║          COMPARACIÓN DE MODELOS — Zona Centro              ║
     ╠══════════════╦════════════════╦════════════════╦════════════╣
     ║  Métrica     ║    Prophet     ║  SARIMA(1,1,1) ║  Ganador   ║
     ╠══════════════╬════════════════╬════════════════╬════════════╣
     ║  MAE         ║     2.34       ║     2.87       ║  Prophet   ║
     ║  RMSE        ║     3.12       ║     3.45       ║  Prophet   ║
     ║  MAPE        ║    18.5%       ║    22.1%       ║  Prophet   ║
     ║  R²          ║     0.78       ║     0.71       ║  Prophet   ║
     ╚══════════════╩════════════════╩════════════════╩════════════╝
     ```
- **Criterio de Aceptación:** Ambos modelos se evalúan con las mismas métricas en el mismo conjunto de prueba; se genera una tabla comparativa para cada zona; se selecciona automáticamente el modelo con menor RMSE como "ganador" para esa zona.

### 2.3 Despliegue del Modelo

#### RF-PRED-006: Empaquetado en Docker para AWS Lambda Container Image
- **Descripción:** Los modelos de predicción y el pipeline de entrenamiento deben empaquetarse en una imagen Docker compatible con AWS Lambda Container Images, ya que las librerías científicas de Python (Prophet, pandas, numpy, pystan) exceden el límite de 250MB de un Lambda Layer estándar.
- **Dockerfile:**
  ```dockerfile
  FROM public.ecr.aws/lambda/python:3.11
  
  # Instalar dependencias del sistema necesarias para Prophet/pystan
  RUN yum install -y gcc gcc-c++ make && \
      yum clean all
  
  # Copiar requirements e instalar dependencias de Python
  COPY requirements.txt ${LAMBDA_TASK_ROOT}/
  RUN pip install --no-cache-dir -r requirements.txt
  
  # Copiar código de la aplicación
  COPY src/ ${LAMBDA_TASK_ROOT}/
  
  # Comando de entrada para Lambda
  CMD ["handler.lambda_handler"]
  ```
- **requirements.txt:**
  ```
  prophet==1.1.5
  pandas==2.1.4
  numpy==1.26.2
  statsmodels==0.14.1
  pmdarima==2.0.4
  boto3==1.34.0
  matplotlib==3.8.2
  scikit-learn==1.3.2
  ```
- **Tamaño estimado de la imagen:** ~800MB - 1.2GB (comprimida ~400-600MB). Lambda soporta hasta 10GB de imagen.
- **Almacenamiento en ECR:**
  - Repositorio: `halo-prediction-model`
  - Tag: `latest` + tag con fecha (ej: `2026-09-01`)
- **Criterio de Aceptación:** La imagen Docker se construye exitosamente, se sube a ECR, y la función Lambda se invoca correctamente devolviendo predicciones en formato JSON.

#### RF-PRED-007: Ejecución Programada del Entrenamiento (Batch Job)
- **Descripción:** El entrenamiento y generación de predicciones no se ejecuta en tiempo real (sería demasiado lento por el cold start del contenedor), sino como un job batch programado.
- **Scheduler:** Amazon EventBridge con regla cron.
- **Frecuencia:** Una vez al día a las 03:00 AM (hora local), cuando el tráfico es mínimo.
- **Flujo del job:**
  1. EventBridge dispara la Lambda de predicción (`halo-prediction-runner`).
  2. La Lambda extrae los datos de `ReportsTable`.
  3. Ejecuta el pipeline ETL (RF-PRED-001).
  4. Entrena los modelos Prophet y ARIMA para cada zona (RF-PRED-003, RF-PRED-004).
  5. Evalúa y compara los modelos (RF-PRED-005).
  6. Serializa los resultados (predicciones, métricas, gráficas) en JSON y los sube a S3:
     ```
     s3://halo-predictions/
     ├── results/
     │   ├── latest.json                    # Último resultado completo
     │   ├── 2026-09-01/
     │   │   ├── predictions_all_zones.json  # Predicciones de todas las zonas
     │   │   ├── metrics_comparison.json     # Métricas de comparación
     │   │   ├── zone_centro.json            # Detalle zona centro
     │   │   ├── zone_norte.json             # Detalle zona norte
     │   │   └── zone_sur.json               # Detalle zona sur
     │   └── ...
     ├── models/
     │   ├── prophet_centro.pkl              # Modelo Prophet serializado
     │   ├── arima_centro.pkl                # Modelo ARIMA serializado
     │   └── ...
     └── data/
         └── processed/
             ├── centro/daily.csv
             └── ...
     ```
  7. Actualiza el registro `latest.json` con un puntero a los resultados más recientes.
  8. Envía una notificación SNS indicando que las predicciones fueron actualizadas exitosamente (o con error si falló).
- **Timeout de Lambda:** 15 minutos (máximo permitido por Lambda).
- **Memoria de Lambda:** 3008 MB (para operaciones de pandas/numpy en memoria).
- **Criterio de Aceptación:** El job se ejecuta diariamente sin intervención manual; los resultados se almacenan correctamente en S3; si el job falla, se envía una alerta por SNS.

#### RF-PRED-008: Endpoint de Consulta de Predicciones
- **Descripción:** El backend principal (Node.js) debe exponer endpoints REST para que el frontend del administrador pueda consultar las predicciones generadas.
- **Endpoints:**

  #### GET /api/admin/predictions
  Devuelve el resumen de predicciones más reciente para todas las zonas.
  
  **Query Parameters:**
  - `period` (optional): `7d` | `14d` | `30d` (default: `30d`)
  
  **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "generatedAt": "2026-09-01T03:00:00Z",
      "period": "30d",
      "zones": [
        {
          "zoneId": "centro",
          "zoneName": "Zona Centro",
          "bounds": {
            "north": 14.6500,
            "south": 14.6200,
            "east": -90.4900,
            "west": -90.5200
          },
          "bestModel": "prophet",
          "predictions": [
            {
              "date": "2026-09-02",
              "yhat": 7.3,
              "yhat_lower": 4.1,
              "yhat_upper": 10.5
            },
            {
              "date": "2026-09-03",
              "yhat": 8.1,
              "yhat_lower": 4.8,
              "yhat_upper": 11.4
            }
          ],
          "metrics": {
            "prophet": { "mae": 2.34, "rmse": 3.12, "mape": 18.5, "r2": 0.78 },
            "arima": { "mae": 2.87, "rmse": 3.45, "mape": 22.1, "r2": 0.71 }
          },
          "riskLevel": "high",
          "trend": "increasing"
        }
      ]
    }
  }
  ```

  #### GET /api/admin/predictions/:zoneId
  Devuelve las predicciones detalladas para una zona específica, incluyendo datos históricos para superponer.
  
  **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "zoneId": "centro",
      "zoneName": "Zona Centro",
      "generatedAt": "2026-09-01T03:00:00Z",
      "historical": [
        { "date": "2026-08-01", "actual": 5 },
        { "date": "2026-08-02", "actual": 7 },
        { "date": "2026-08-03", "actual": 3 }
      ],
      "prophet": {
        "predictions": [
          { "date": "2026-09-02", "yhat": 7.3, "yhat_lower": 4.1, "yhat_upper": 10.5 }
        ],
        "components": {
          "trend": [...],
          "weekly": [...],
          "daily": [...],
          "yearly": [...]
        },
        "metrics": { "mae": 2.34, "rmse": 3.12, "mape": 18.5, "r2": 0.78 }
      },
      "arima": {
        "order": [1, 1, 1],
        "seasonal_order": [1, 1, 1, 7],
        "predictions": [
          { "date": "2026-09-02", "yhat": 6.8, "yhat_lower": 3.5, "yhat_upper": 10.1 }
        ],
        "metrics": { "mae": 2.87, "rmse": 3.45, "mape": 22.1, "r2": 0.71 }
      }
    }
  }
  ```

  #### GET /api/admin/predictions/heatmap
  Devuelve los datos necesarios para renderizar el mapa de calor predictivo.
  
  **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "generatedAt": "2026-09-01T03:00:00Z",
      "heatmapData": [
        {
          "latitude": 14.6350,
          "longitude": -90.5069,
          "intensity": 0.85,
          "predictedIncidents": 7.3,
          "zoneId": "centro",
          "riskLevel": "high"
        },
        {
          "latitude": 14.6550,
          "longitude": -90.4850,
          "intensity": 0.45,
          "predictedIncidents": 3.2,
          "zoneId": "norte",
          "riskLevel": "medium"
        }
      ],
      "riskLevels": {
        "low": { "min": 0, "max": 0.3, "color": "#22c55e" },
        "medium": { "min": 0.3, "max": 0.6, "color": "#f59e0b" },
        "high": { "min": 0.6, "max": 0.85, "color": "#ef4444" },
        "critical": { "min": 0.85, "max": 1.0, "color": "#7f1d1d" }
      }
    }
  }
  ```

- **Implementación en el backend Node.js:** Los endpoints simplemente leen los archivos JSON desde S3 (generados por el job batch de Python) y los devuelven al frontend. No ejecutan ningún modelo en tiempo real.
- **Criterio de Aceptación:** Los endpoints devuelven datos válidos que el frontend puede consumir directamente para renderizar gráficas y mapas de calor; si no hay predicciones disponibles, devuelven un error 404 con mensaje amigable.

### 2.4 Visualización en el Dashboard de Administración

#### RF-PRED-009: Gráfica de Predicción vs Realidad (Series de Tiempo)
- **Descripción:** El Dashboard de Administración debe incluir una nueva sección/pestaña de "Predicciones" con una gráfica interactiva de series de tiempo que superpone los datos reales observados con las predicciones del modelo.
- **Componentes de la gráfica:**
  1. **Eje X:** Tiempo (días).
  2. **Eje Y:** Frecuencia de incidentes.
  3. **Línea azul sólida:** Datos históricos reales (observados).
  4. **Línea roja punteada:** Predicción del modelo (`yhat`).
  5. **Banda sombreada rosa:** Intervalo de confianza del 95% (`yhat_lower` a `yhat_upper`).
  6. **Línea vertical punteada gris:** Separación entre "histórico" y "predicción futura" (hoy).
  7. **Puntos verdes:** Últimos datos reales superpuestos sobre las predicciones pasadas (para visualizar el error).
- **Interactividad:**
  - Tooltip al pasar el mouse sobre cualquier punto mostrando: fecha, valor real, valor predicho, error absoluto.
  - Zoom con scroll del mouse.
  - Selector de rango temporal (últimos 7 días, 14 días, 30 días, 90 días).
  - Selector de zona geográfica (dropdown).
  - Toggle para mostrar/ocultar líneas de Prophet y ARIMA simultáneamente.
- **Librería de gráficas:** Recharts (ya utilizado en el frontend existente).
- **Criterio de Aceptación:** La gráfica se renderiza correctamente con datos reales y predicciones; el intervalo de confianza se visualiza como banda sombreada; la interactividad funciona sin lag.

#### RF-PRED-010: Gráfica de Componentes de Estacionalidad
- **Descripción:** Mostrar las componentes estacionales descompuestas del modelo Prophet, permitiendo entender qué patrones temporales son los más influyentes.
- **Subgráficas:**
  1. **Tendencia (Trend):** Gráfica lineal mostrando la dirección general a largo plazo (¿los incidentes van en aumento o en disminución?).
  2. **Estacionalidad Semanal:** Gráfica de barras mostrando qué días de la semana tienen más incidentes (ej: viernes y sábado = pico).
  3. **Estacionalidad Diaria:** Gráfica de línea mostrando qué horas del día tienen más incidentes (ej: 20:00-02:00 = pico de seguridad).
  4. **Estacionalidad Anual (si aplica):** Gráfica mostrando variaciones mensuales (ej: época de lluvias = más reportes de infraestructura).
- **Criterio de Aceptación:** Las 3-4 subgráficas se muestran en un layout de grid 2x2; cada componente es interpretable y coincide con la intuición del dominio.

#### RF-PRED-011: Mapa de Calor Predictivo (Heatmap)
- **Descripción:** El mapa principal del Dashboard de Administración debe poder alternar entre la vista de "Incidentes actuales" (marcadores) y la vista de "Predicción de hotspots" (mapa de calor).
- **Especificaciones del mapa de calor:**
  1. Renderizado con MapLibre GL JS usando la capa `heatmap` nativa.
  2. Cada punto de calor corresponde a una zona geográfica con su intensidad predicha.
  3. Gradiente de colores:
     - 🟢 Verde (0.0 - 0.3): Riesgo bajo.
     - 🟡 Amarillo (0.3 - 0.6): Riesgo medio.
     - 🔴 Rojo (0.6 - 0.85): Riesgo alto.
     - 🟤 Rojo oscuro (0.85 - 1.0): Riesgo crítico.
  4. Al hacer clic en una zona del mapa de calor, se muestra un popup con:
     - Nombre de la zona.
     - Nivel de riesgo con color.
     - Incidentes predichos para las próximas 24 horas.
     - Incidentes predichos para los próximos 7 días.
     - Modelo utilizado (Prophet o ARIMA).
     - Confianza del modelo (R²).
  5. Controles:
     - Toggle: "Mostrar predicciones" / "Mostrar incidentes actuales".
     - Slider temporal: "Predicción para hoy", "mañana", "próximos 7 días", etc.
- **Criterio de Aceptación:** El mapa de calor se renderiza correctamente sobre el mapa existente; los colores reflejan la intensidad de riesgo predicho; los popups muestran información relevante al clic.

#### RF-PRED-012: Panel de Métricas y Comparación de Modelos
- **Descripción:** Sección del dashboard que muestra las métricas de evaluación de los modelos y permite al administrador entender el nivel de confianza de las predicciones.
- **Contenido:**
  1. **Tarjetas de resumen (KPIs):**
     - "Precisión del modelo: X%" (basado en 100 - MAPE del mejor modelo).
     - "Zonas analizadas: N".
     - "Última actualización: DD/MM/YYYY HH:MM".
     - "Modelo preferido: Prophet" (el que ganó en más zonas).
  2. **Tabla comparativa de modelos por zona:** (ver RF-PRED-005).
  3. **Gráfica de barras:** Comparación visual de MAE por zona para Prophet vs ARIMA.
  4. **Explicación para no-técnicos:** Texto contextual que traduce las métricas a lenguaje comprensible:
     ```
     💡 ¿Qué significan estos números?
     
     El modelo Prophet predice la cantidad de incidentes con un error promedio 
     de ±2.3 incidentes por día. Esto significa que si predice 7 incidentes 
     para mañana en la Zona Centro, el rango real esperado es entre 5 y 10 
     incidentes. La confianza general del modelo es del 81.5%.
     ```
- **Criterio de Aceptación:** Las métricas se presentan de forma clara tanto para técnicos (tabla con MAE/RMSE/R²) como para no-técnicos (explicación en lenguaje natural); la tabla se actualiza automáticamente cuando hay nuevas predicciones.

---

## 3. Requisitos No Funcionales

### 3.1 Rendimiento
- **RNF-PRED-001:** El job batch de entrenamiento debe completarse en menos de 15 minutos (límite de Lambda) para el conjunto completo de zonas (hasta 10 zonas).
- **RNF-PRED-002:** Los endpoints de consulta de predicciones deben responder en menos de 2 segundos (lectura de S3 + transformación mínima).
- **RNF-PRED-003:** Las gráficas de series de tiempo deben renderizarse en el frontend en menos de 1 segundo con hasta 365 puntos de datos.
- **RNF-PRED-004:** El mapa de calor debe renderizarse en menos de 2 segundos con hasta 100 puntos de intensidad.

### 3.2 Escalabilidad
- **RNF-PRED-005:** La arquitectura debe soportar la adición de nuevas zonas geográficas sin cambios en el código; solo agregar configuración.
- **RNF-PRED-006:** Si en el futuro el volumen de datos crece significativamente, debe ser posible migrar el pipeline a AWS Step Functions + Batch sin reescribir la lógica de los modelos.

### 3.3 Mantenibilidad
- **RNF-PRED-007:** El código de Python debe incluir docstrings completos, type hints, y estar formateado con `black` y validado con `flake8`.
- **RNF-PRED-008:** Los hiperparámetros de los modelos deben estar externalizados en un archivo de configuración YAML o JSON, no hardcodeados.
- **RNF-PRED-009:** El pipeline debe generar logs estructurados (JSON) que se almacenen en CloudWatch para debugging y auditoría.

### 3.4 Confiabilidad
- **RNF-PRED-010:** Si el job de entrenamiento falla, las predicciones anteriores deben seguir siendo consultables (no se sobreescriben hasta que las nuevas estén listas — patrón blue/green).
- **RNF-PRED-011:** Se debe enviar una alerta por SNS si el job falla o si las métricas del modelo se degradan significativamente (MAE > 2x del promedio histórico).

---

## 4. Modelos de Datos Nuevos

### 4.1 Estructura de Resultados en S3

```
s3://halo-predictions/
├── config/
│   └── zones.json                    # Definición de zonas geográficas
├── data/
│   ├── raw/                          # Exportaciones crudas de DynamoDB
│   └── processed/                    # DataFrames procesados
│       ├── centro/daily.csv
│       ├── norte/daily.csv
│       └── sur/daily.csv
├── models/
│   ├── prophet/                      # Modelos Prophet serializados (.pkl)
│   └── arima/                        # Modelos ARIMA serializados (.pkl)
├── results/
│   ├── latest.json                   # Puntero al último resultado
│   └── YYYY-MM-DD/                   # Resultados por fecha
│       ├── predictions_all_zones.json
│       ├── metrics_comparison.json
│       └── heatmap_data.json
└── logs/
    └── YYYY-MM-DD/
        └── training_log.json         # Log del entrenamiento
```

### 4.2 zones.json (Configuración de Zonas)
```json
{
  "zones": [
    {
      "zoneId": "centro",
      "zoneName": "Zona Centro",
      "centerLatitude": 14.6350,
      "centerLongitude": -90.5069,
      "radiusKm": 2.5,
      "bounds": {
        "north": 14.6500,
        "south": 14.6200,
        "east": -90.4900,
        "west": -90.5200
      }
    },
    {
      "zoneId": "norte",
      "zoneName": "Zona Norte",
      "centerLatitude": 14.6550,
      "centerLongitude": -90.4850,
      "radiusKm": 3.0,
      "bounds": {
        "north": 14.6750,
        "south": 14.6350,
        "east": -90.4650,
        "west": -90.5050
      }
    }
  ]
}
```

---

## 5. Diagrama de Arquitectura del Pipeline

```
                    ┌──────────────────┐
                    │  Amazon          │
                    │  EventBridge     │
                    │  (cron diario)   │
                    └────────┬─────────┘
                             │ Invoca diariamente
                             ▼
              ┌──────────────────────────────┐
              │  AWS Lambda (Container Image) │
              │  Python 3.11 + Prophet        │
              │                                │
              │  1. Scan ReportsTable         │
              │  2. ETL → DataFrames          │
              │  3. Train Prophet por zona    │
              │  4. Train ARIMA por zona      │
              │  5. Evaluar métricas          │
              │  6. Generar predicciones      │
              │  7. Subir resultados a S3     │
              └──────┬───────────┬────────────┘
                     │           │
          ┌──────────▼──┐  ┌────▼────────────┐
          │  DynamoDB   │  │     Amazon S3    │
          │ ReportsTable│  │  (Predicciones   │
          │  (lectura)  │  │   + Modelos)     │
          └─────────────┘  └────────┬─────────┘
                                    │ Lectura
                                    ▼
                    ┌──────────────────────────┐
                    │  Backend Node.js (Lambda) │
                    │  GET /api/admin/predictions│
                    │  (Lee JSON de S3)          │
                    └──────────────┬─────────────┘
                                   │ API Response
                                   ▼
                    ┌──────────────────────────┐
                    │  Frontend React           │
                    │  Dashboard Admin           │
                    │  - Gráficas Recharts      │
                    │  - Mapa de Calor MapLibre │
                    │  - Tabla de Métricas      │
                    └───────────────────────────┘
```
