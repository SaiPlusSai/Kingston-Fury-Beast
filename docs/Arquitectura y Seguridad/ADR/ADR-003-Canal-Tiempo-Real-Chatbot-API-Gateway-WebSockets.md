# ADR-003 — Canal en Tiempo Real para Chatbot mediante API Gateway WebSocket API

## Estado
**Aceptado**

## Contexto
El nuevo requerimiento de HALO v2 exige un asistente conversacional (Chatbot) en tiempo real para atender consultas ciudadanas, informar el estado de reportes y guiar la creacion de incidentes paso a paso tanto en web como en movil.

## Problema
Que tecnologia de comunicacion en tiempo real garantiza interactividad bidireccional inmediata sin romper la filosofia serverless ni requerir servidores dedicados encendidos permanentemente?

## Decisión
Utilizar AWS API Gateway WebSocket API (WSS) con rutas dedicadas (, , sendMessage) integradas a funciones AWS Lambda y persistencia de conexiones activas en la tabla DynamoDB WebSocketConnectionsTable.

## Justificación técnica
1. Cumplimiento Serverless Estricto: A diferencia de Socket.io sobre Node.js tradicional, API Gateway gestiona las conexiones TCP/TLS persistentes en el borde de AWS; la funcion Lambda solo se ejecuta durante milisegundos cuando entra un mensaje.\n2. Comunicacion Bidireccional Completa: Permite enviar respuestas del bot y notificaciones proactivas sin necesidad de que el cliente realice consultas repetidas.\n3. Costo Marginal Optimo: AWS cobra unicamente .00 USD por millon de minutos de conexion y .25 USD por millon de mensajes; para el volumen de UrbanShield el costo es inferior a  USD/mes.\n4. Desacoplamiento de la API REST: Opera en un endpoint WSS independiente, aislando la carga conversacional del trafico transaccional habitual.

## Alternativas consideradas
- Alternativa 1: Polling HTTP periodico cada 2-3 segundos. Descartada por alta latencia percibida, gasto innecesario de invocaciones Lambda y consumo excesivo de bateria en dispositivos moviles.\n- Alternativa 2: Server-Sent Events (SSE). Descartada porque SSE es unidireccional (servidor a cliente); requeriria peticiones POST paralelas para el envio de mensajes del usuario.\n- Alternativa 3: Servidor persistente Socket.io en EC2 / Fargate. Descartada por romper el modelo serverless e introducir costos fijos de ~- USD/mes.

## Consecuencias positivas
- Latencia conversacional P95 inferior a 500 ms.\n- Cero consumo de computo mientras el usuario lee o esta inactivo.\n- Soporte nativo para push de alertas de emergencia por el mismo socket.

## Consecuencias negativas
- API Gateway cierra sockets inactivos tras 10 minutos (limite duro de inactividad de AWS).\n- Se requiere gestionar el ciclo de vida de connectionId manualmente en DynamoDB.

## Riesgos
- Conexiones huerfanas si  no se ejecuta debido a caidas abruptas de red en clientes moviles.

## Mitigaciones
- Implementar heartbeat ping/pong desde el cliente cada 5 minutos.\n- Capturar excepciones GoneException (410) en ApiGatewayManagementApiClient para purgar conexiones obsoletas automaticamente de DynamoDB.

## Componentes afectados
AWS API Gateway WebSocket, serverless.yml, src/websocket/*, WebSocketConnectionsTable.
