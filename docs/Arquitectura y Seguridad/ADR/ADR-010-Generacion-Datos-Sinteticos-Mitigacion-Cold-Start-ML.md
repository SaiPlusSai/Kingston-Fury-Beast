# ADR-010 — Generacion de Datos Sinteticos Realistas para Mitigacion de Cold-Start en Modelos de IA

## Estado
**Aceptado**

## Contexto
Los modelos de series de tiempo como Meta Prophet requieren un minimo de 90 a 365 dias de observaciones continuas para capturar adecuadamente componentes estacionales semanales, mensuales y de fin de semana. En la etapa inicial de UrbanShield o en nuevas ciudades donde se despliegue el sistema, la base de datos ReportsTable contiene un volumen insuficiente de reportes reales.

## Problema
Como entrenar, validar y demostrar el funcionamiento del pipeline de Inteligencia Artificial (Prophet y ARIMA) sin contar con anos de historial de incidentes reales acumulados en DynamoDB?

## Decisión
Desarrollar un Modulo de Generacion de Datos Sinteticos Parametrico y Deterministico (generate_synthetic_data.py, seed=42) capaz de sintetizar 365 dias de incidentes urbanos realistas con distribuciones temporales circadianas, estacionalidad semanal y agrupamientos espaciales gaussianos alrededor de puntos neuralgicos urbanos.

## Justificación técnica
1. Validez Cientifica y Reproducibilidad: Cumple rigurosamente con la metodologia CRISP-ML(Q) y la documentacion de Kingston-Fury-Beast-. Fijar una semilla pseudoaleatoria (seed=42) garantiza que los experimentos sean reproducibles por cualquier evaluador.
2. Patrones Urbanos Verosimiles: El generador no inyecta ruido blanco uniforme; simula concentraciones de robos nocturnos en zonas comerciales, picos de accidentes viales en horarios de transito matutino/vespertino y fallas de infraestructura en dias laborales.
3. Habilitador del Pipeline Completo: Permite probar de punta a punta el ETL, calculo de baselines estadisticos, metricas MAE/RMSE/MAPE y la renderizacion de mapas de calor sin esperar meses de recoleccion de datos en campo.
4. Trazabilidad Etica: Los datos sinteticos quedan etiquetados y aislados, garantizando que nunca se confundan con reportes legales reales de la ciudadania.

## Alternativas consideradas
- Alternativa 1: Esperar a recolectar datos reales durante meses antes de implementar los modelos. Descartada por inviable en el marco temporal academico y comercial del proyecto.
- Alternativa 2: Usar datasets genericos abiertos (ej. delitos de Chicago o Nueva York). Descartada por no ajustarse a la estructura de categorias, coordenadas geograficas ni dinamicas urbanas locales del proyecto HALO.

## Consecuencias positivas
- Disponibilidad inmediata de un banco de pruebas exhaustivo para el modulo de IA.
- Posibilidad de realizar pruebas de estres de volumen en DynamoDB y S3.
- Base solida para benchmarking cuantitativo de Prophet vs ARIMA.

## Consecuencias negativas
- Los modelos entrenados con datos sinteticos reflejan las suposiciones del generador y deberan ser reentrenados gradualmente a medida que ingresen reportes reales.

## Riesgos
- Sobreajuste (overfitting) a los patrones matematicos artificiales del generador.

## Mitigaciones
- Incorporar ruido estocastico mediante distribuciones de Poisson y disenar el extractor de datos (extract.py) con una logica de transicion hibrida: usar datos reales prioritariamente y completar con sinteticos solo cuando los registros reales por zona sean inferiores al umbral minimo de 90 dias.

## Componentes afectados
prediction-service/scripts/generate_synthetic_data.py, prediction-service/src/pipeline/extract.py.
