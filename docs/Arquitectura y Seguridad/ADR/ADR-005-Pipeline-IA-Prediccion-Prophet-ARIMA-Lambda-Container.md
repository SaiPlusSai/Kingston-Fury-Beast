# ADR-005 — Pipeline de Prediccion de Hotspots con Meta Prophet, ARIMA y Lambda Container Image

## Estado
**Aceptado**

## Contexto
El modulo de Inteligencia Artificial para el Taller de Sistemas Inteligentes requiere anticipar zonas criticas de incidentes urbanos (hotspots) mediante modelos estadisticos propios de series de tiempo, demostrando rigor cientifico mediante la comparacion con baselines (Naive, Media Movil 7d, Media Estacional). Las librerias de Python requeridas (prophet, pystan, pmdarima, pandas, scipy) superan ampliamente el limite de 250 MB de las capas estandar de AWS Lambda.

## Problema
Como desplegar y ejecutar el pipeline de entrenamiento e inferencia batch de Python de forma 100% serverless, automatica y reproducible sin mantener instancias EC2 encendidas continuamente?

## Decisión
Empaquetar el servicio de prediccion en una AWS Lambda Container Image basada en Docker (python:3.11-slim), alojada en Amazon ECR y orquestada por una regla cron de Amazon EventBridge que se dispara diariamente a las 03:00 AM UTC. Los modelos principales implementados son Meta Prophet y ARIMA/SARIMA.

## Justificación técnica
1. Soporte para Imagenes Pesadas: Las Lambda Container Images admiten hasta 10 GB de tamano, permitiendo empaquetar compiladores C++ y dependencias cientificas pesadas sin restricciones.\n2. Filosofia Serverless Batch: El reentrenamiento e inferencia toma ~5 a 10 minutos una vez al dia. En Lambda solo se paga por esos minutos exactos (~.10 USD/dia), a diferencia de ECS o EC2 que cobrarian 24 horas al dia (~- USD/mes).\n3. Meta Prophet para Datos Urbanos: Prophet es excepcionalmente robusto ante datos faltantes, cambios estructurales de tendencia y modelado simultaneo de estacionalidades diarias, semanales y anuales.\n4. Auto-ARIMA como Benchmark Academico: Cumple con la exigencia metodologica CRISP-ML(Q) de validar mejoras relativas (RMSE reduccion >= 20%) frente a modelos autorregresivos y baselines estadisticos.

## Alternativas consideradas
- Alternativa 1: Amazon Forecast (SaaS gestionado de AWS). Descartada taxativamente porque las especificaciones academicas exigen modelos propios desarrollados por el equipo, no servicios de caja negra.\n- Alternativa 2: Tarea en ECS Fargate programada. Descartada por mayor complejidad operativa de VPCs, subnets y tiempo de aprovisionamiento frente a una invocacion directa de Lambda Container.\n- Alternativa 3: Instancia EC2 dedicada con Crontab. Descartada por romper el principio serverless, requerir mantenimiento de parches y costo fijo injustificado.

## Consecuencias positivas
- Ejecucion desatendida y predecible cada madrugada.\n- Entorno de ejecucion inmutable y reproducible garantizado por Docker.\n- Resultados precalculados y listos para consumo instantaneo por el dashboard a primera hora.

## Consecuencias negativas
- Cold start de ~15-25 segundos en la primera invocacion del contenedor (irrelevante para una tarea batch nocturna).\n- Limite de tiempo de ejecucion de Lambda de 15 minutos maximo.

## Riesgos
- Que el volumen de datos crezca hasta que el tiempo de ajuste de Prophet exceda los 15 minutos de timeout de Lambda.

## Mitigaciones
- Entrenar modelos por zona en paralelo o limitar la ventana historica a los ultimos 365 dias moviles.\n- Si en el futuro excede 12 minutos, migrar la definicion de tarea a AWS Step Functions o AWS Batch.

## Componentes afectados
prediction-service/*, Dockerfile, Amazon ECR, Amazon EventBridge, S3PredictionsBucket.
