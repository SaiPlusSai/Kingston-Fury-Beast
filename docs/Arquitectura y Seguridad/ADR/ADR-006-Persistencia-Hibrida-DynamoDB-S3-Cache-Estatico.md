# ADR-006 — Persistencia Hibrida: DynamoDB para Transaccional y S3 como Cache de Predicciones

## Estado
**Aceptado**

## Contexto
El sistema genera pronosticos diarios de series de tiempo para multiples cuadriculas urbanas con arrays de predicciones a 30 dias, intervalos de confianza superior/inferior, componentes estacionales y matrices de metricas. Al mismo tiempo, maneja miles de reportes ciudadanos individuales, usuarios y notificaciones.

## Problema
Como almacenar y servir grandes volumenes de datos jerarquicos de prediccion a los clientes del dashboard sin sobrecargar DynamoDB con lecturas costosas de documentos grandes ni incurrir en costos de clusteres Redis en memoria?

## Decisión
Implementar una estrategia de persistencia hibrida: utilizar Amazon DynamoDB exclusivamente para el estado transaccional estructurado de baja latencia (reportes, usuarios, sesiones de chat), y utilizar Amazon S3 como almacenamiento de objetos y Cache Estatico de Predicciones en formato JSON (predictions/YYYY-MM-DD/zone_{id}_forecast.json).

## Justificación técnica
1. Patron Write-Once, Read-Many (WORM): Las predicciones se generan una unica vez en la madrugada (03:00 AM) y son consumidas miles de veces durante el dia por los dashboards. S3 es el medio mas economico y escalable para este patron.\n2. Estructura Jerarquica Compleja: Los pronosticos de series de tiempo contienen arrays anidados de fechas y flotantes que superan las buenas practicas de tamano de item plano en DynamoDB (evitando el limite de 400 KB de DynamoDB).\n3. Eliminacion de Cluster de Cache: Despachar archivos JSON desde S3 a traves del backend Node.js elimina la necesidad de aprovisionar un cluster de Amazon ElastiCache (Redis), ahorrando ~ USD/mes.\n4. Costo Practicamente Nulo: S3 Standard cuesta ~.023 USD por GB; almacenar los JSONs de un ano entero cuesta centavos de dolar.

## Alternativas consideradas
- Alternativa 1: Almacenar predicciones directamente en DynamoDB en una tabla PredictionsTable. Descartada porque serializar arrays de miles de puntos en DynamoDB genera alto consumo de WCUs/RCUs y riesgo de saturar el limite de 400 KB por item.\n- Alternativa 2: Amazon ElastiCache (Redis / Memcached). Descartada por requerir instancias encendidas permanentemente dentro de una VPC con costo minimo prohibitivo.

## Consecuencias positivas
- Lecturas ultra-rapidas de reportes analiticos desde el backend.\n- Preservacion del historico de pronosticos diarios como archivos inmutables en S3 para auditoria cientifica.\n- Maxima simplicidad en la integracion del Frontend.

## Consecuencias negativas
- Si la generacion nocturna de predicciones falla, el backend debe gestionar el fallback hacia el JSON del dia anterior.

## Riesgos
- Inconsistencia temporal si el cliente consulta el dashboard mientras el pipeline de las 3:00 AM esta en pleno proceso de escritura.

## Mitigaciones
- Escribir en una carpeta temporal y realizar el cambio atomico del puntero de fecha latest.json unicamente al finalizar exitosamente la validacion de metricas.

## Componentes afectados
prediction-service/src/pipeline/load.py, backend_urbanshield/src/services/prediction.service.js, S3PredictionsBucket.
