# Priorización de Casos de Proyecto - Taller de Sistemas Inteligentes

## 1. Descripción de los Casos Evaluados

### Caso A: HALO - Plataforma Inteligente de Gestión de Emergencias Urbanas
* **Descripción:** Evolución de la plataforma serverless HALO (gestión de incidentes y seguridad ciudadana). La propuesta añade a la arquitectura existente: 1) Un chatbot en tiempo real para asistencia e información, 2) Una versión móvil nativa de la aplicación, y 3) Predicción estadística de hotspots (zonas de riesgo) utilizando modelos como Prophet (Meta) o ARIMA/SARIMA, entrenados con el histórico de incidentes por zona y hora, presentando gráficas comparativas de predicción vs realidad.
* **Usuarios/Interesados:** Ciudadanos, autoridades locales y administradores del sistema de emergencias.
* **Infraestructura/Entorno:** AWS Serverless (Lambda, DynamoDB, API Gateway, S3, SNS), React (Web), React Native / Flutter (Móvil), Python (Prophet/ARIMA para predicción de series de tiempo).

### Caso B: Agente para Gestión Inteligente de Restaurante
* **Descripción:** Agente conversacional e inteligente para la gestión operativa de un restaurante (predicción de demanda de insumos, optimización de inventario, asignación de reservas y turnos de personal).
* **Usuarios/Interesados:** Administradores y gerentes de restaurantes locales.
* **Infraestructura/Entorno:** Base de datos relacional, modelos de series de tiempo / RL estocástico, API REST, Nube.

### Caso C: Agente de Gestión de Estacionamiento con IA
* **Descripción:** Sistema de visión por computadora y gestión adaptativa para estacionamientos comerciales (detección de espacios libres mediante video, tarifas dinámicas según ocupación y control de flujo vehicular).
* **Usuarios/Interesados:** Operadores de parqueos urbanos y conductores.
* **Infraestructura/Entorno:** OpenCV, YOLO, cámaras de video, sistema embebido/servidor de inferencia, Nube.

---

## 2. Matriz de Priorización de Casos

| Caso | Valor | Datos / Entorno | Factibilidad | Riesgo | Despliegue | Puntaje Total | Decisión |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **A. HALO (Emergencias Urbanas)** | **5** | **5** | **4** | **4** | **5** | **23 / 25** | **Elegir** |
| **B. Agente de Gestión de Restaurante** | 4 | 2 | 3 | 3 | 3 | **15 / 25** | **Reserva** |
| **C. Agente de Estacionamiento con IA** | 3 | 2 | 2 | 2 | 3 | **12 / 25** | **Descartar** |

---

## 3. Justificación Detallada de la Decisión

Se selecciona el **Caso A (HALO - Plataforma Inteligente de Gestión de Emergencias Urbanas)** como el proyecto a desarrollar durante el semestre por las siguientes razones analíticas:

1. **Arquitectura Base Estable (Factibilidad y Despliegue = 4 y 5):**
  A diferencia de los casos B y C que deben construirse desde cero, el Caso A ya cuenta con una infraestructura serverless sólida en AWS (Lambda, DynamoDB, Cognito, etc.) y un frontend web funcional. Esto permite enfocar los esfuerzos del semestre en la adición de valor analítico y accesibilidad: la IA (modelos predictivos ligeros y chatbot en tiempo real) y la expansión hacia una versión móvil.

2. **Impacto Visual y Predictivo Inmediato (Valor = 5/5):**
  La implementación de algoritmos de predicción de series temporales (Prophet / ARIMA / SARIMA) en puro Python sobre el histórico de incidentes por zona y hora, sin depender de soluciones pre-empaquetadas como Amazon Forecast, permite un alto control del modelo estadístico y la posibilidad de mostrar gráficas de *Predicción vs Realidad* de gran impacto visual para la presentación final.

3. **Interacción en Tiempo Real (Datos / Entorno = 5/5):**
  La adición de un chatbot en tiempo real permite experimentar con modelos para responder consultas, proporcionar información sobre incidentes cercanos, contactos de emergencia y estado de reportes, apalancándose en la red ciudadana que ya maneja HALO.

4. **Análisis de Opciones Descartadas:**
  * **Caso B (Restaurante):** Presenta un alto riesgo de bloqueo en la adquisición de datos reales de consumo e inventario de restaurantes locales, además de depender de reglas de negocio cambiantes.
  * **Caso C (Estacionamiento):** Depende críticamente de hardware de captura de video en tiempo real, latencia de procesamiento y dataset anotado de cámaras en ángulos específicos, lo que representa un elevado riesgo operativo y de infraestructura para el plazo académico.

---

## 4. Restricción Principal y Estrategia de Mitigación

* **Restricción Principal Identificada:** **Integración de Modelos de Predicción y Chatbot a la Arquitectura Serverless Existente.**
 * *Riesgo:* Desplegar modelos en Python (Prophet/ARIMA) y un chatbot conversacional puede agregar complejidad a una arquitectura que actualmente opera con AWS Lambda de manera muy optimizada. Superar límites de tamaño (cold starts pesados) si no se gestionan correctamente las librerías científicas.
* **Estrategia de Mitigación:**
 1. Entrenar y empaquetar los modelos Prophet/ARIMA de forma liviana, considerando el uso de Container Images en AWS Lambda o microservicios aislados (ECS/App Runner) para evitar impactar la API de Node.js existente.
 2. Implementar el chatbot utilizando WebSockets o Server-Sent Events (SSE) para lograr la comunicación en tiempo real con el cliente web/móvil.
 3. Aprovechar frameworks multiplataforma (ej. React Native) para reciclar la lógica y componentes del frontend web actual de HALO, mitigando el tiempo necesario para construir la aplicación móvil desde cero.

