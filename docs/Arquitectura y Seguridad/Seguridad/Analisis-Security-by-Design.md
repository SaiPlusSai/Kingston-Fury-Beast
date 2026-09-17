# Análisis Integral de Seguridad y Security by Design — UrbanShield (HALO v2)

**Autor:** Arquitecto de Software Senior & Especialista en Seguridad  
**Fecha:** Septiembre 2026  
**Alcance:** Backend, Frontend Web, App Móvil, Chatbot en Tiempo Real y Pipeline de IA  

---

## 1. Introducción y Enfoque Metodológico

UrbanShield (HALO v2) opera en un dominio de alta sensibilidad social: la gestión de emergencias ciudadanas, alertas públicas y pronóstico de incidentes delictivos y viales. Una falla en la confidencialidad puede comprometer la identidad y seguridad física de denunciantes; una falla en la integridad puede desviar unidades de auxilio mediante reportes ficticios o envenenamiento de modelos de IA; y una falla en la disponibilidad puede costar vidas en situaciones de catástrofe.

Por ello, la arquitectura de UrbanShield implementa el principio de **Security by Design** y **Defensa en Profundidad (Defense in Depth)**, alineado con:
- **OWASP Top 10 API Security Risks (2023)**
- **OWASP Top 10 for Large Language Model & Machine Learning Applications (2025)**
- **AWS Well-Architected Framework — Security Pillar**
- **Principio de Privilegio Mínimo (PoLP)** y **Zero Trust Architecture**

---

## 2. Dimensiones de Seguridad de la Arquitectura

### 2.1 Autenticación e Identidad
- **Ecosistema Dual:**
  - **Producción (AWS):** Delegación completa a **Amazon Cognito User Pools**. Las contraseñas nunca tocan las bases de datos de UrbanShield. Cognito implementa protección contra ataques de fuerza bruta (Adaptive Authentication), políticas complejas de contraseñas (mínimo 8 caracteres, mayúsculas, números, símbolos) y verificación de correos vía códigos OTP de un solo uso.
  - **Desarrollo / Offline:** Adaptador local en `src/services/auth.service.js` con contraseñas hasheadas mediante **Bcrypt con factor de costo 10** y tokens JWT locales firmados con secreto criptográfico independiente.
- **Validación Criptográfica de Tokens:** El middleware `auth.middleware.js` valida la firma de tokens RSA (RS256) contra las claves públicas JWKS de Cognito (`aws-jwt-verify`) o la firma HMAC (HS256) local (`jsonwebtoken`). Se comprueban estrictamente `iss` (emisor), `aud` (audiencia) y la expiración `exp`.

### 2.2 Autorización y Control de Acceso (RBAC)
- **Roles Definidos:**
  - `citizen`: Reporte de incidentes, consulta de historial personal, votación comunitaria de reportes públicos y acceso al chatbot.
  - `authority`: Monitorea incidentes en tiempo real en mapa operativo, consulta predicciones de hotspots de riesgo y gestiona unidades de campo.
  - `admin`: Supervisión global, resolución y cambio de estado de reportes, administración de catálogo de FAQs del chatbot y auditoría forense.
- **Defensa contra BOLA / IDOR (OWASP API1:2023):**
  - Los endpoints de detalle y modificación de reportes (`/api/reports/:id`) validan en la capa de servicio (`report.service.js`) que el usuario autenticado sea el creador del reporte (`report.userId === req.user.userId`) o posea el rol `admin`.
  - El handler del chatbot (`statusHandler.js`) aplica la misma verificación antes de revelar el estado o contenido de cualquier ticket.

### 2.3 Protección Perimetral y de APIs
- **API Gateway Throttling:** Configuración de cuotas de consumo a nivel de API Gateway (10,000 peticiones en ráfaga, 5,000 peticiones por segundo sostenidas).
- **Express Rate Limiting:** Middleware `rateLimit.middleware.js` con ventanas de 15 minutos y un límite de 100 peticiones por IP en endpoints de autenticación y 500 peticiones en endpoints de consulta general.
- **Cabeceras HTTP de Seguridad:** Inyección de `helmet` para forzar HSTS (`Strict-Transport-Security`), prevención de clickjacking (`X-Frame-Options: DENY`), protección MIME sniffing (`X-Content-Type-Options: nosniff`) y política de referencias (`Referrer-Policy: no-referrer`).
- **Política de CORS Restrictiva:** `CORS_ORIGIN` configurable estrictamente para los dominios de CloudFront y clientes móviles autorizados, bloqueando orígenes `*` en producción.
- **Sanitización de Payloads:** Middleware `sanitize.middleware.js` que escapa entidades HTML y remueve caracteres de inyección de script o expresiones regulares maliciosas en todas las entradas `req.body`, `req.query` y `req.params`.

### 2.4 Gestión de Sesiones y Almacenamiento en Clientes
- **Ciclo de Vida de Tokens:**
  - `accessToken`: Vida corta (15 minutos) para minimizar la ventana de exposición en caso de intercepción.
  - `refreshToken`: Vida media (7 a 30 días) para permitir renovación transparente mediante el endpoint `POST /api/auth/refresh`.
- **Almacenamiento Seguro en Clientes:**
  - **App Móvil:** Los tokens se almacenan exclusivamente en **Expo SecureStore** (Keychain en iOS y EncryptedSharedPreferences con Keystore en Android). Nunca en AsyncStorage plano.
  - **Frontend Web:** Almacenamiento en memoria o cookies con atributos `HttpOnly; Secure; SameSite=Strict`.

### 2.5 Gestión de Secretos y Configuración
- **Cero Secretos en Repositorio:** Ni `serverless.yml` ni los repositorios de GitHub contienen credenciales IAM, llaves privadas o contraseñas de bases de datos.
- **AWS Systems Manager (SSM) Parameter Store:** En despliegues reales, las variables críticas (`JWT_ACCESS_SECRET`, llaves de API externas, credenciales de correo) se inyectan en tiempo de ejecución desde rutas SSM encriptadas con AWS KMS (`SecureString`).

### 2.6 Cifrado y Protección de Datos en Reposo y en Tránsito
- **En Tránsito:**
  - Todo el tráfico cliente-servidor (REST y WebSocket) se canaliza exclusivamente sobre **TLS 1.3 / HTTPS / WSS** con certificados administrados por AWS Certificate Manager (ACM).
- **En Reposo:**
  - **Amazon DynamoDB:** Cifrado transparente habilitado mediante **AWS KMS (SSE-KMS)** en todas las 8 tablas.
  - **Amazon S3:** Configuración de `ServerSideEncryptionByDefault` con algoritmo AES-256 (`aws:kms`) en todos los buckets de almacenamiento de fotos y predicciones.
  - **S3 Block Public Access:** Todos los buckets tienen habilitado el bloqueo total de acceso público. El acceso a las imágenes de evidencias se realiza exclusivamente mediante URLs prefirmadas de lectura o a través de CloudFront con Origin Access Control (OAC).

### 2.7 Validación de Entradas y Carga Segura de Archivos
- **Validación Estricta de Esquemas:** Uso de **Joi** (`validate.middleware.js`) para cada endpoint, verificando tipos de datos, rangos numéricos de latitud (-90 a 90) y longitud (-180 a 180), longitud máxima de texto (1000 caracteres) y categorías permitidas contra enums predefinidos.
- **Subida de Archivos con URLs Pre-firmadas:**
  - La Lambda genera URLs prefirmadas de S3 con una vigencia máxima de 300 segundos (5 minutos).
  - Se valida el tipo MIME (`image/jpeg`, `image/png`, `image/webp`).
  - Tamaño máximo restringido a 5 MB por archivo.
  - El nombre del archivo en S3 es un UUID v4 criptográfico generado por el backend, impidiendo Path Traversal (`../../malware.php`).

### 2.8 Auditoría Inmutable y Trazabilidad Forense
- **Tabla de Auditoría Inmutable (`ActivityLogsTable`):**
  - Cada acción crítica (creación de reporte, cambio de estado, resolución de emergencia, inicio de sesión administrativo, respuesta de soporte) genera un registro inmutable con clave de partición UUID, `entityId`, `action`, `performedBy`, `ipAddress` y timestamp ISO-8601.
  - La política de IAM de Lambda deniega `dynamodb:DeleteItem` y `dynamodb:UpdateItem` sobre esta tabla; solo se permiten operaciones `PutItem`, garantizando la integridad de la cadena de custodia.
- **Correlación de Peticiones:** Middleware `requestId.middleware.js` inyecta un encabezado `X-Request-Id` (UUID v4) en cada petición, propagándolo a los logs de AWS CloudWatch para trazabilidad de punta a punta.

---

## 3. Seguridad Específica de Componentes de IA y Chatbot

### 3.1 Chatbot en Tiempo Real (WebSocket + NLP)
1. **Autenticación en Handshake ($connect):**
   - No se aceptan conexiones anónimas. El token JWT debe transmitirse en el handshake inicial (`wss://...?token=...`).
   - Si el token no es válido o ha expirado, la función Lambda `$connect` aborta la conexión con código HTTP 401 antes de registrar nada en DynamoDB.
2. **Mitigación de Prompt Injection / Jailbreaks:**
   - Al haber adoptado un **Motor de Intenciones Determinístico basado en Expresiones Regulares** (ADR-004) en lugar de un LLM generativo no acotado, el riesgo de prompt injection, hijacking de instrucciones del sistema o fuga de datos mediante ingeniería de prompts es **NULO**. El bot no interpreta código ni ejecuta comandos dinámicos.
3. **Protección contra ReDoS (Regular Expression Denial of Service):**
   - Los patrones de expresiones regulares en `intentDetector.js` fueron diseñados sin cuantificadores anidados ambiguos (ej. `(a+)+`), evitando el retroceso catastrófico (catastrophic backtracking) de CPU.
   - Longitud máxima de mensaje recortada a 500 caracteres antes de la evaluación.
4. **Protección contra Abuso de Conexiones (Flood / DoS):**
   - Contador de mensajes por minuto almacenado con TTL en `WebSocketConnectionsTable`. Si un `connectionId` supera 30 mensajes en un minuto, el socket es desconectado forzosamente vía `DeleteConnectionCommand`.

### 3.2 Módulo de Inteligencia Artificial (Pipeline de Predicción Prophet / ARIMA)
1. **Data Poisoning (Envenenamiento de Datos de Entrenamiento):**
   - **Vector de Ataque:** Usuarios maliciosos o bots que generan cientos de reportes falsos de "robos armados" en una misma coordenada geográfica para manipular el modelo de IA y hacer que pronostique un hotspot falso, forzando el despliegue innecesario de patrullas policiales (ataque de agotamiento de recursos públicos).
   - **Controles Implementados:**
     - **Filtro de Estado de Incidentes:** El extractor del pipeline (`extract.py`) ignora completamente los reportes en estado `pending` o `cancelled`. Solo se incluyen reportes validados por la autoridad (`in_progress`, `resolved`) o con alto consenso comunitario de votos ciudadanos (`votesCount >= 3`).
     - **Detección y Poda de Outliers:** El componente `transform.py` aplica un filtro de detección de anomalías por zona basado en el rango intercuartílico (IQR) y la distribución de Poisson, recortando picos atípicos artificiales generados en ventanas temporales menores a 2 horas.
2. **Aislamiento del Entorno de Ejecución (Container Security):**
   - La imagen Docker de `prediction-service` se basa en `python:3.11-slim` libre de utilidades innecesarias (ej. curl, netcat, compilers en la capa final).
   - Se ejecuta bajo el usuario no privilegiado de Lambda (`nobody` / `appuser`), con sistema de archivos montado en modo de solo lectura (a excepción de `/tmp` efímero).
3. **Integridad de Resultados y Caché en S3:**
   - Los archivos JSON generados (`zone_{id}_forecast.json`) se firman con un checksum SHA-256 almacenado en los metadatos del objeto S3.
   - El backend Node.js verifica que los pronósticos provengan exclusivamente del bucket autorizado antes de parsearlos y servirlos al frontend.
4. **Continuidad Operativa y Fallback Gracioso:**
   - Si la ejecución nocturna de Prophet falla por falta de convergencia matemática o timeout, el sistema preserva el puntero `latest.json` hacia el pronóstico del día anterior y emite una alerta a CloudWatch Alarms / SNS para el equipo de soporte, impidiendo que el dashboard muestre pantallas en blanco.

---

## 4. Matriz de Cumplimiento OWASP API Security Top 10 (2023)

| ID OWASP | Vulnerabilidad / Riesgo | Estado en UrbanShield | Mecanismo de Control Implementado |
|---|---|:---:|---|
| **API1:2023** | Broken Object Level Authorization (BOLA) | **Mitigado** | Validación estricta de propiedad de recurso (`report.userId === req.user.userId`) en servicios y repositorio. |
| **API2:2023** | Broken Authentication | **Mitigado** | Amazon Cognito + tokens JWT RS256/HS256 con verificación criptográfica de firma, expiración corta y JWKS. |
| **API3:2023** | Broken Object Property Level Authorization | **Mitigado** | Esquemas Joi en `validate.middleware.js` filtran propiedades no autorizadas (`stripUnknown: true`). Ciudadanos no pueden alterar `status` ni `votesCount`. |
| **API4:2023** | Unrestricted Resource Consumption | **Mitigado** | Rate limiting por IP (100 req/15min en auth, 500 en API), paginación obligatoria (`limit=20`, `max=50`), cuotas en API Gateway. |
| **API5:2023** | Broken Function Level Authorization (BFLA) | **Mitigado** | Middleware `authorize.middleware.js` exige rol `admin` en rutas `/api/admin/*`, `/status`, `/resolve` y `/faqs`. |
| **API6:2023** | Unrestricted Access to Sensitive Business Flows | **Mitigado** | Creación de reportes requiere cuenta autenticada y verificada; subida de fotos limitada a 3 archivos prefirmados por incidente. |
| **API7:2023** | Server-Side Request Forgery (SSRF) | **Mitigado** | El backend no realiza peticiones HTTP arbitrarias a URLs provistas por el usuario; solo consume SDKs oficiales de AWS con endpoints fijos. |
| **API8:2023** | Security Misconfiguration | **Mitigado** | Cabeceras Helmet habilitadas, CORS restringido, S3 Block Public Access activo, `NODE_ENV=production` oculta stack traces en errores. |
| **API9:2023** | Improper Inventory Management | **Mitigado** | Documentación OpenAPI 3.0 sincronizada en `/api-docs` y `src/docs/openapi.yaml`; versionado de contratos planificado. |
| **API10:2023**| Unsafe Consumption of APIs | **Mitigado** | Respuestas de Amazon Location Service validadas y encapsuladas; URLs de S3 prefirmadas con parámetros firmados criptográficamente. |

---

## 5. Conclusiones y Recomendaciones de Seguridad

La arquitectura de evolución de UrbanShield cuenta con un perfil de seguridad robusto, derivado del aprovechamiento de las defensas administradas de AWS y la disciplina de diseño modular.

**Recomendaciones Prioritarias para la Puesta en Producción:**
1. Configurar **AWS WAF (Web Application Firewall)** frente al API Gateway con reglas administradas de AWS (`AWSManagedRulesCommonRuleSet` y `AWSManagedRulesKnownBadInputsRuleSet`).
2. Activar **Amazon GuardDuty** en la cuenta de AWS para detección continua de anomalías de comportamiento en IAM, CloudWatch y accesos no autorizados a S3.
3. Programar un escaneo automatizado de vulnerabilidades en dependencias (`npm audit` y `pip-audit`) en el pipeline de CI/CD de GitHub Actions antes de cada despliegue.
