# ADR-009 — Carga Directa de Evidencias Fotograficas a S3 mediante URLs Pre-firmadas

## Estado
**Aceptado**

## Contexto
Los reportes de incidentes ciudadanos requieren evidencias fotograficas de alta resolucion (hasta 3 fotos por reporte). Transmitir archivos binarios a traves de API Gateway y AWS Lambda degrada el rendimiento y eleva significativamente los costos operativos.

## Problema
Como permitir la carga de imagenes pesadas desde aplicaciones web y moviles minimizando la latencia, el consumo de memoria de la Lambda y los costos de transferencia en API Gateway?

## Decisión
Implementar el patron de Carga Directa a Amazon S3 mediante URLs Pre-firmadas (Pre-signed PUT URLs) emitidas por el endpoint GET /api/uploads/presigned-url con un TTL estricto de 300 segundos (5 minutos) y validacion de tipos MIME autorizados (image/jpeg, image/png, image/webp).

## Justificación técnica
1. Ahorro Masivo de Recursos en Computo: La funcion Lambda nunca recibe los bytes binarios de la imagen. Solo procesa una solicitud JSON ultraligera para generar la URL firmada criptograficamente con AWS SDK.
2. Eliminacion de Limites de Payload: API Gateway tiene un limite duro de 10 MB por payload. Al subir directamente al bucket S3, el cliente envia la foto directo al almacenamiento sin saturar el gateway.
3. Menor Latencia para el Usuario: La transferencia ocurre punto a punto entre el cliente y S3 aprovechando la aceleracion de red perimetral de AWS.
4. Seguridad sin Credenciales Publicas: El cliente movil o web no requiere credenciales IAM de AWS; la URL prefirmada otorga permiso temporal de escritura exclusivamente para una clave de objeto especifica.

## Alternativas consideradas
- Alternativa 1: Subida multipart convencional a traves de Lambda con multer. Descartada por encarecer la memoria requerida de la Lambda (requeriria 1024MB en vez de 256MB), aumentar el tiempo de ejecucion y consumir cuota de payload de API Gateway.
- Alternativa 2: Bucket S3 con permisos de escritura publicos. Descartada taxativamente por constituir una vulnerabilidad critica inaceptable de seguridad.

## Consecuencias positivas
- Reduccion drastica del tiempo de computo en Lambda y costos de red asociados.
- Aislamiento de la carga de archivos respecto a la disponibilidad de la API transaccional.

## Consecuencias negativas
- El flujo en el frontend requiere dos pasos: solicitar la URL pre-firmada y luego ejecutar el HTTP PUT binario a S3.

## Riesgos
- Que un usuario suba un archivo malicioso o ejecutable renombrado a .jpg aprovechando la URL prefirmada.

## Mitigaciones
- Validar Content-Type estricto en la firma de la URL y configurar politicas de bucket con restriccion de cabeceras.
- Configurar lifecycle rules en S3 para borrar uploads huerfanos que no se hayan vinculado a ningun reporte en 24 horas.

## Componentes afectados
src/controllers/upload.controller.js, src/services/upload.service.js, S3UploadsBucket.
