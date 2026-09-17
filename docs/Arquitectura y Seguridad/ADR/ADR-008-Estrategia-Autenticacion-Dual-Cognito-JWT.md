# ADR-008 — Estrategia de Autenticacion Dual: Amazon Cognito y JWT Local con Bcrypt

## Estado
**Aceptado**

## Contexto
En el codigo real del backend (backend_urbanshield), se identifico una discrepancia relevante respecto a la documentacion teorica previa: existe una bandera de configuracion USE_COGNITO que conmuta entre Amazon Cognito User Pools y un generador local de tokens JWT con passwords hasheadas mediante bcryptjs.

## Problema
Como conciliar el requerimiento de seguridad institucional de usar Amazon Cognito en produccion sin bloquear el desarrollo local, pruebas automatizadas en CI/CD y entornos academicos sin conexion a AWS?

## Decisión
Formalizar el patron de Autenticacion Dual Desacoplada mediante un adaptador en auth.service.js. En entornos desplegados en AWS (NODE_ENV=production), el sistema opera con Amazon Cognito; en entornos de desarrollo local o pruebas (USE_COGNITO=false), opera con el proveedor local de JWT + bcryptjs conservando exactamente la misma interfaz y firma de tokens.

## Justificación técnica
1. Independencia para Desarrollo y CI/CD: Permite a los desarrolladores correr pruebas unitarias e integracion completas sin requerir credenciales activas de AWS ni conexion a internet.
2. Seguridad Corporativa en Produccion: En AWS, Cognito delega la seguridad del almacen de identidades, politicas de contrasenas robustas, bloqueo por fuerza bruta y rotacion de claves publicas JWKS a la infraestructura gestionada de Amazon.
3. Transparencia para los Clientes: Tanto la web como la app movil reciben la misma estructura de respuesta (accessToken, refreshToken, user) independientemente del backend de autenticacion activo.

## Alternativas consideradas
- Alternativa 1: Forzar exclusivamente Amazon Cognito en todos los entornos. Descartada porque obligaria a tener conexion permanente a AWS y credenciales IAM para cualquier prueba unitaria local.
- Alternativa 2: Usar unicamente JWT local propio en produccion. Descartada por asumir el riesgo de gestionar almacenamiento de credenciales y no aprovechar la proteccion gestionada contra ataques de fuerza bruta que brinda Cognito.

## Consecuencias positivas
- Maxima flexibilidad operativa y agilidad en el ciclo de desarrollo.
- Coexistencia pacifica entre la realidad del codigo fuente y las metas de despliegue en nube.

## Consecuencias negativas
- Se deben mantener dos implementaciones de verificacion en el middleware (aws-jwt-verify y jsonwebtoken).

## Riesgos
- Que un despliegue a produccion se realice inadvertidamente con USE_COGNITO=false dejando el manejo de contrasenas al hash local en DynamoDB.

## Mitigaciones
- Configurar en serverless.yml la variable de entorno USE_COGNITO: true forzada para los stages prod y validar esta condicion en el script de arranque.

## Componentes afectados
src/services/auth.service.js, src/middlewares/auth.middleware.js, src/utils/cognitoVerify.js, src/utils/jwt.js.
