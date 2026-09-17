# ADR-002 — Backend Monolitico Serverless con Express y serverless-http

## Estado
**Aceptado**

## Contexto
Al disenar el backend en AWS Lambda, existen dos escuelas de diseno principales: (1) Funcion Lambda individual por cada endpoint REST (30+ funciones separadas), o (2) Monolito Serverless (Lambdalith) donde una sola funcion Lambda ejecuta un servidor Express.js completo utilizando serverless-http.

## Problema
Como estructurar la base de codigo del backend para maximizar la velocidad de desarrollo local, minimizar la latencia agregada por cold starts multiples y mantener una base de codigo limpia y modular?

## Decisión
Implementar el patron Monolito Serverless (Lambdalith) en Node.js 18.x utilizando Express 4.x envuelto por serverless-http, manejando las rutas ANY / y ANY /{proxy+} desde una unica funcion Lambda (api).

## Justificación técnica
1. Mitigacion de Cold Starts: En una arquitectura de 30 Lambdas separadas, cada endpoint sufre su propio cold start independiente. En el monolito serverless, cualquier peticion mantiene caliente la funcion para todos los endpoints.\n2. Experiencia de Desarrollo Local (DX): Permite ejecutar npm run dev con Nodemon directamente en local sin necesidad de simular API Gateway o Docker.\n3. Modularidad Interna Limpia: El codigo se organiza estrictamente en capas (Controllers, Services, Repositories, Middlewares, Models) preservando separacion de responsabilidades.\n4. Tamano de Empaquetado Controlado: El paquete zip resultante pesa menos de 14 MB (bien por debajo del limite de 50 MB directos de Lambda).

## Alternativas consideradas
- Alternativa 1: Micro-funciones Lambda independientes por endpoint. Descartada por proliferacion masiva de cold starts, configuracion verbosa de CloudFormation y dificultad para compartir middlewares comunes.\n- Alternativa 2: NestJS Serverless. Descartada por tamano de bundle excesivo (>30MB comprimido), mayor overhead de arranque y curva de aprendizaje.

## Consecuencias positivas
- Unificacion de middlewares de seguridad (CORS, Helmet, Rate-Limit, Auth) en un unico pipeline de Express.\n- Rapida incorporacion de nuevos endpoints sin modificar la infraestructura en serverless.yml.\n- Simulacion y pruebas locales inmediatas.

## Consecuencias negativas
- Toda la API escala uniformemente; no se puede asignar memoria diferenciada por endpoint.\n- Un fallo catastrofico en tiempo de inicializacion afectaria a todos los endpoints REST.

## Riesgos
- Crecimiento descontrolado del paquete zip por dependencias innecesarias que eleven el tiempo de descarga del contenedor Lambda.

## Mitigaciones
- Mantener dependencias de produccion minimas en package.json y usar empaquetadores como esbuild si el tamano excede 25MB.

## Componentes afectados
backend_urbanshield/src/server.js, src/lambda.js, src/app.js, serverless.yml.
