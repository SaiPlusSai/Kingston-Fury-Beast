# Propuesta: Expansión de HALO v2 — Chatbot, App Móvil y Predicción de Hotspots

## 1. Contexto y Motivación

### 1.1 Situación Actual
HALO (Urban Shield) es una plataforma de gestión de emergencias e incidentes urbanos que ya se encuentra operativa con una arquitectura serverless completa en AWS. El sistema actual permite a los ciudadanos reportar incidentes urbanos (robos, accidentes, infraestructura dañada, emergencias médicas, etc.) a través de una aplicación web construida en React 19, mientras que los administradores y autoridades pueden gestionar, priorizar y dar seguimiento a estos reportes desde un panel de administración con analíticas, tablero Kanban y sistema de soporte.

**Repositorios existentes:**
- **Frontend Web:** [chriscc27/frontend_urbanshield](https://github.com/chriscc27/frontend_urbanshield) — React 19, Vite, MapLibre GL JS, TailwindCSS
- **Backend Serverless:** [chriscc27/backend_urbanshield](https://github.com/chriscc27/backend_urbanshield) — Node.js (Express) en AWS Lambda, DynamoDB, S3, Cognito, SNS

### 1.2 Problema Identificado
A pesar de contar con un sistema funcional, se han identificado tres brechas críticas que limitan el impacto y la adopción de la plataforma:

1. **Accesibilidad Móvil:** Los ciudadanos necesitan reportar incidentes desde la calle, en el momento exacto en que ocurren. Depender exclusivamente de un navegador web móvil genera fricción: la experiencia no es nativa, no se aprovechan las capacidades del dispositivo (GPS de alta precisión, cámara optimizada, notificaciones push), y la retención del usuario es baja comparada con una app instalada.

2. **Asistencia Inmediata:** En situaciones de emergencia o urgencia, navegar por menús y formularios puede ser lento y confuso. Los ciudadanos necesitan un canal de comunicación directa, rápido e intuitivo, donde puedan hacer preguntas ("¿cuál es el número de emergencias?", "¿qué pasó con mi reporte #2847?") o incluso crear un nuevo reporte de forma conversacional sin tener que llenar formularios complejos.

3. **Inteligencia Predictiva:** Las autoridades y administradores reaccionan a los incidentes después de que ocurren. No existe actualmente ningún mecanismo para anticipar zonas de riesgo (hotspots) basándose en patrones históricos. Visualizar dónde y cuándo es más probable que ocurran incidentes permitiría la asignación proactiva de recursos (patrullas, ambulancias, equipos de mantenimiento).

### 1.3 Oportunidad Académica
Esta expansión se enmarca en la materia de **Taller de Sistemas Inteligentes**, donde se requiere la aplicación de técnicas de Inteligencia Artificial y Machine Learning. La predicción de hotspots con modelos estadísticos propios (Prophet de Meta, ARIMA/SARIMA) satisface directamente este requerimiento académico, mientras que el chatbot introduce componentes de procesamiento de lenguaje natural (NLP) y la app móvil demuestra capacidad de despliegue multiplataforma.

---

## 2. Alcance (Scope)

### 2.1 Funcionalidad 1: Chatbot Interactivo en Tiempo Real
Un sistema de chat bidireccional integrado tanto en la aplicación web como en la futura app móvil, con las siguientes capacidades:

- **FAQ y Consultas Generales:** Responder preguntas frecuentes sobre el sistema, números de emergencia, horarios de atención, tipos de incidentes que se pueden reportar, y cualquier información de utilidad pública pre-configurada por los administradores.
- **Consulta de Estado de Reportes:** El ciudadano puede preguntar por el estado de un reporte proporcionando su ID o describiendo el incidente. El bot consultará la base de datos en tiempo real y devolverá el estado actual, los logs de actividad y las actualizaciones más recientes.
- **Creación Conversacional de Reportes:** El bot guiará al usuario paso a paso para crear un nuevo reporte de incidente: preguntará la categoría, solicitará una descripción, pedirá confirmación para enviar la ubicación GPS, y opcionalmente solicitará una foto. Una vez recopilados todos los datos, el bot invocará internamente el endpoint de creación de reportes en nombre del usuario autenticado.
- **Notificaciones Proactivas:** Cuando un administrador actualice el estado de un reporte, el sistema podrá enviar una notificación al ciudadano a través del canal de chat si tiene una sesión WebSocket activa.

**Tecnología:** AWS API Gateway (WebSocket API), funciones Lambda dedicadas para manejo de conexiones y mensajes, DynamoDB para persistencia de sesiones WebSocket, motor de NLP basado en intenciones (AWS Lex, Dialogflow, o detección de intenciones propia con regex/embeddings).

### 2.2 Funcionalidad 2: Aplicación Móvil Nativa (React Native)
Una aplicación móvil multiplataforma (Android e iOS) que ofrezca una experiencia nativa y optimizada para el ciudadano:

- **Autenticación:** Login y registro utilizando el mismo sistema de Amazon Cognito del backend existente, con persistencia segura de tokens JWT mediante `expo-secure-store`.
- **Dashboard del Ciudadano:** Vista principal con el mapa interactivo mostrando incidentes cercanos, notificaciones recientes y acceso rápido a crear un nuevo reporte.
- **Creación de Reportes con Capacidades Nativas:** Uso de la cámara del dispositivo (`expo-image-picker`), GPS de alta precisión (`expo-location`), y subida directa de imágenes a S3 mediante pre-signed URLs.
- **Notificaciones Push:** Integración con servicios de notificaciones push (FCM para Android, APNs para iOS) a través de Amazon SNS o Expo Notifications para alertar al ciudadano sobre actualizaciones de sus reportes o alertas de emergencia en su zona.
- **Chatbot Integrado:** El mismo componente de chat disponible dentro de la app móvil, conectado al WebSocket del backend.
- **Modo Offline Básico:** Capacidad de guardar borradores de reportes localmente cuando no hay conexión y sincronizarlos automáticamente al recuperar señal.

**Tecnología:** React Native con Expo (Bare Workflow para módulos nativos de mapas), `react-native-maps`, `expo-location`, `expo-image-picker`, `expo-secure-store`, `expo-notifications`.

### 2.3 Funcionalidad 3: Predicción de Hotspots con Modelos Estadísticos
Un módulo de inteligencia analítica que permite a los administradores y autoridades anticipar zonas de riesgo:

- **Ingesta de Datos Históricos:** Extracción automatizada de todos los registros de la tabla `ReportsTable` en DynamoDB, transformación a un DataFrame de pandas con columnas `ds` (fecha/hora del incidente) y `y` (frecuencia de incidentes), agrupados por zona geográfica (cuadrante/distrito) y franja horaria.
- **Entrenamiento del Modelo:** Implementación de Prophet (Meta) como modelo principal, con ARIMA/SARIMA como alternativa o modelo de comparación. El entrenamiento se ejecutará en batch (no en tiempo real) mediante un job programado, generando predicciones para los próximos 7, 14 y 30 días.
- **Visualización Comparativa:** Gráficas de series de tiempo en el Dashboard de Administrador que superponen la predicción del modelo (`yhat`, `yhat_lower`, `yhat_upper`) sobre los datos reales observados, permitiendo evaluar visualmente la precisión del modelo.
- **Mapa de Calor Predictivo:** Visualización geográfica en el mapa del administrador mostrando las zonas con mayor probabilidad de incidentes en las próximas horas/días, con gradientes de color según la intensidad predicha.
- **Métricas de Evaluación:** Cálculo y presentación de métricas estándar (MAE, RMSE, MAPE) para que las autoridades comprendan el nivel de confianza de las predicciones.

**Tecnología:** Python 3.11, Prophet (pystan), pandas, numpy, matplotlib/plotly (para generación estática de gráficas si se requiere), AWS Lambda Container Images (Docker en ECR), Amazon EventBridge (para scheduling del job de entrenamiento), S3 (para almacenamiento de resultados y modelos serializados).

---

## 3. Fuera de Alcance

Los siguientes elementos **NO** serán implementados en esta fase de expansión:

- **Entrenamiento de LLMs propios:** No se entrenará ni fine-tuneará ningún modelo de lenguaje grande desde cero. El chatbot utilizará un motor de NLP preexistente (AWS Lex, Dialogflow, OpenAI API) o un sistema de detección de intenciones basado en reglas/regex para la primera versión.
- **Migración de base de datos:** La base de datos permanecerá en Amazon DynamoDB. No se migrará a PostgreSQL, MongoDB, ni ningún otro motor.
- **Modificación del sistema de autenticación:** Se reutilizará Amazon Cognito tal cual está configurado. No se añadirán nuevos proveedores de identidad (Google, Facebook, etc.) ni se cambiará el flujo de autenticación existente.
- **Panel de administración en la app móvil:** La app móvil será exclusivamente para ciudadanos. Los administradores seguirán utilizando la aplicación web.
- **Streaming de video en tiempo real:** No se implementará videovigilancia ni integración con cámaras de seguridad urbanas.
- **Sistema de pagos o donaciones:** No se incluirá ninguna funcionalidad financiera.
- **Internacionalización (i18n):** La primera versión será exclusivamente en español.
- **Publicación en App Store / Play Store:** Se generarán builds de desarrollo y APK/IPA para testing, pero la publicación formal en tiendas está fuera del alcance del semestre.

---

## 4. Criterios de Éxito

### 4.1 Chatbot
1. Un ciudadano autenticado puede abrir el chat desde la web o la app móvil y recibir una respuesta en menos de 2 segundos.
2. El bot puede responder correctamente al menos 5 preguntas frecuentes pre-configuradas.
3. El bot puede consultar el estado de un reporte existente dado su ID y devolver información correcta.
4. El bot puede guiar al usuario para crear un nuevo reporte completo (categoría, descripción, ubicación) y el reporte aparece correctamente en la base de datos y en el panel de administración.
5. Las conexiones WebSocket se mantienen estables durante al menos 30 minutos de inactividad antes de timeout.

### 4.2 App Móvil
1. La app compila correctamente para Android (APK) e iOS (IPA) sin errores.
2. El usuario puede registrarse, iniciar sesión y ver su dashboard con el mapa de incidentes.
3. El usuario puede crear un reporte con foto tomada desde la cámara del dispositivo y ubicación GPS automática.
4. Las notificaciones push se reciben correctamente cuando el administrador actualiza un reporte del usuario.
5. La app funciona correctamente en dispositivos con Android 10+ y iOS 14+.

### 4.3 Predicción de Hotspots
1. El modelo Prophet genera predicciones para al menos 3 zonas geográficas distintas.
2. Las gráficas de Predicción vs Realidad se renderizan correctamente en el Dashboard del administrador.
3. El mapa de calor predictivo muestra zonas coloreadas según intensidad de riesgo predicho.
4. El tiempo de carga de las predicciones en el dashboard es menor a 5 segundos.
5. Las métricas de evaluación (MAE, RMSE) son calculadas y presentadas junto a las gráficas.

---

## 5. Dependencias y Supuestos

### 5.1 Dependencias
- El backend serverless existente (`backend_urbanshield`) debe estar funcional y desplegado.
- Las tablas de DynamoDB deben contener datos históricos suficientes (o se generarán datos sintéticos realistas para el entrenamiento de Prophet).
- Se requiere una cuenta AWS con permisos para crear API Gateway WebSocket, funciones Lambda adicionales, repositorios ECR, y reglas EventBridge.
- Se requiere acceso a dispositivos físicos o emuladores para testing de la app React Native.

### 5.2 Supuestos
- El equipo tiene acceso a la capa gratuita de AWS o créditos educativos suficientes.
- Los datos de incidentes existentes son suficientes para entrenar un modelo básico de Prophet (al menos 50+ registros). Si no, se generarán datos sintéticos.
- El flujo de autenticación de Cognito es compatible con React Native sin modificaciones mayores.
- MapLibre GL JS puede ser sustituido por `react-native-maps` en la versión móvil sin pérdida significativa de funcionalidad.

---

## 6. Riesgos de Alto Nivel

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|:---:|:---:|---|
| Cold starts pesados en Lambda Container Image (Python/Prophet) | Alta | Medio | Ejecutar predicciones en batch con EventBridge y cachear resultados en S3; el usuario nunca espera al modelo en vivo |
| Complejidad de WebSockets en API Gateway | Media | Alto | Usar el SDK oficial de AWS y la librería `@aws-sdk/client-apigatewaymanagementapi`; implementar reconexión automática en el cliente |
| Incompatibilidad de react-native-maps con Expo Managed | Media | Medio | Usar Expo Bare Workflow o prebuild; tener MapView de respaldo |
| Datos históricos insuficientes para Prophet | Media | Alto | Generar dataset sintético realista basado en distribuciones estadísticas de incidentes urbanos |
| Latencia de Cognito en React Native | Baja | Medio | Cachear tokens en SecureStore y renovarlos en background |
