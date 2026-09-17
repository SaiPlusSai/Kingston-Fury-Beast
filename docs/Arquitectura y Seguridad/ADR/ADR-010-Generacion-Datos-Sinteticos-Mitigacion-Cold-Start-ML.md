# ADR-010 — Generacion de Datos Sinteticos Realistas para Mitigacion de Cold-Start en Modelos de IA

## Estado
**Aceptado**

## Contexto
Los modelos de series de tiempo como Meta Prophet requieren un mínimo de 90 a 365 días de observaciones continuas para capturar adecuadamente componentes estacionales (épocas de lluvias, patrones semanales y eventos festivos). En la etapa inicial del sistema, la base de datos ReportsTable no cuenta con suficiente historial de reportes ciudadanos recolectados en tiempo real.

## Problema
¿Cómo entrenar, validar y demostrar el funcionamiento del pipeline de Inteligencia Artificial (Prophet y ARIMA) sin recurrir a datos sintéticos artificiales ni esperar meses a acumular reportes orgánicos en la plataforma?

## Decisión
Desarrollar un módulo de Curaduría e Ingestión de Datos (ingest_historical_data.py) encargado de procesar, limpiar y unificar datasets históricos reales de emergencias urbanas, desastres naturales (deslizamientos, riadas) y delitos reportados en La Paz y Bolivia, poblando directamente la base de datos ReportsTable.

## Justificación técnica
1. Validez Empírica y Relevancia Geográfica: La topografía y clima de La Paz (laderas, pendientes, cuencas y época de lluvias) presentan patrones espaciotemporales únicos que las fórmulas sintéticas no pueden replicar con fidelidad.
2. Captura de Estacionalidad Real: Los datos históricos permiten a Meta Prophet y ARIMA detectar ciclos anuales verdaderos, como el incremento de deslizamientos entre noviembre y marzo o picos de incidentes urbanos en fechas festivas locales.
3. Fundamento y Rigor Metodológico: Cumple con la metodología CRISP-ML(Q) garantizando que el entrenamiento del pipeline se sustente en evidencia empírica observada y fuentes de datos abiertos/públicos de la región.
4. Estandarización de Esquema: Transforma variables heterogéneas externas (coordenadas GPS, fechas, tipos de incidente) a una estructura unificada compatible con la canalización del extractor (extract.py).

## Alternativas consideradas
- Alternativa 1: Generación de datos sintéticos matemáticos. Descartada por ignorar la geografía de La Paz y restar credibilidad científica al comportamiento real de las emergencias locales.
- Alternativa 2: Esperar la recolección orgánica de datos en producción. Descartada por ser inviable en el marco temporal del proyecto e impedir el despliegue inmediato del módulo predictivo.

## Consecuencias positivas
- Alta precisión empírica en la identificación de zonas críticas (hotspots) desde el primer día.
- Capacidad de integración con iniciativas de Datos Abiertos (Open Data) locales y nacionales.
- Disponibilidad de un banco de pruebas verídico para la validación cuantitativa de métricas (MAE, RMSE, MAPE).

## Consecuencias negativas
- Requiere esfuerzo técnico inicial de limpieza, normalización y tratamiento de datos faltantes (Data Wrangling) previo al entrenamiento.

## Riesgos
- Disparidad de formatos, nomenclaturas y resolución geográfica entre los distintos datasets históricos recopilados.

## Mitigaciones
- Incorporar ruido estocastico mediante distribuciones de Poisson y disenar el extractor de datos (extract.py) con una logica de transicion hibrida: usar datos reales prioritariamente y completar con sinteticos solo cuando los registros reales por zona sean inferiores al umbral minimo de 90 dias.
- Construir una matriz de mapeo explícita (category_mapper.py) para traducir las taxonomías de las fuentes externas al esquema estandarizado de categorías del proyecto.

## Componentes afectados
prediction-service/scripts/ingest_historical_data.py, prediction-service/scripts/category_mapper.py, prediction-service/src/pipeline/extract.py, ReportsTable.
