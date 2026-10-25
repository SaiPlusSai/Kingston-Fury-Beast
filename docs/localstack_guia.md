# 🛠️ Guía de Ejecución Offline con LocalStack (HALO v2)

> **Materia:** Taller de Sistemas Inteligentes (SIS-352)  
> **Propósito:** Protocolo de contingencia para demostración presencial y desarrollo offline sin dependencia de internet ni costos de AWS.  
> **Tarea ClickUp:** [ARCH-06 (ID: #86e3aebp4)](https://app.clickup.com/t/86e3aebp4)  
> **Mitigación Asociada:** RISK-06 (Dependencia de AWS para Demostraciones)

---

## 📌 1. Visión General

LocalStack emula de manera local los servicios principales de AWS utilizados por HALO:
* **Amazon DynamoDB:** Persistencia transaccional de usuarios, reportes, logs y sesiones de WebSocket.
* **Amazon S3:** Almacenamiento de evidencias fotográficas y caché estático de predicciones.
* **Amazon SNS / API Gateway:** Notificaciones y enrutamiento de peticiones.

Esta configuración garantiza que el equipo puede defender y demostrar el funcionamiento del sistema en cualquier aula o auditorio, incluso en modo avión.

---

## 🚀 2. Guía Paso a Paso para la Demostración en Vivo

### Paso 1: Levantar el contenedor de LocalStack
Desde la carpeta `backend/`, ejecuta:
```bash
npm run localstack:up
```
*Esto iniciará el contenedor Docker `halo_localstack` en el puerto `4566`.*

### Paso 2: Aprovisionar Tablas DynamoDB y Buckets S3
Ejecuta el script multiplataforma en Node.js:
```bash
npm run localstack:init
```
*El script creará automáticamente:*
* **8 Tablas DynamoDB:**
  1. `UrbanShield-Users-dev`
  2. `UrbanShield-Reports-dev`
  3. `UrbanShield-Notifications-dev`
  4. `UrbanShield-ActivityLogs-dev`
  5. `UrbanShield-SupportMessages-dev`
  6. `UrbanShield-WebSocketConnections-dev`
  7. `UrbanShield-ChatSessions-dev`
  8. `UrbanShield-ChatFaqs-dev`
* **3 Buckets S3:**
  1. `urbanshield-uploads-dev-local`
  2. `urbanshield-prediction-cache-local`
  3. `urbanshield-profile-photos-dev-local`

### Paso 3: Iniciar el Backend en Modo Local
```bash
npm run dev
```

### Paso 4: Ejecutar la Suite de Pruebas de WebSocket
Para demostrar ante el docente que la arquitectura de WebSocket funciona al 100%:
```bash
npm run test:websocket
```
*Se ejecutarán las 4 suites de pruebas unitarias:*
1. **Detección de Intenciones:** `intentDetector.test.js` (21/21 casos aprobados — 100%).
2. **Máquina de Estados de Reportes:** `stateMachine.test.js` (Flujo E2E de 6 pasos aprobado).
3. **Autenticación y Handshake:** `connection.test.js` ($connect con JWT válido y $disconnect).
4. **Heartbeat y Mitigación de Timeout:** `heartbeat.test.js` (Keepalive ping-pong en < 50ms).

---

## 🛑 3. Detener el Entorno LocalStack

Cuando finalice la sesión de trabajo o demostración:
```bash
npm run localstack:down
```

---

## 🛡️ 4. Trazabilidad y Cumplimiento con la Rúbrica
* **Evidencia Verificable:** Código ejecutable en vivo, eliminando el antipatrón de *"evidencia en foto"*.
* **Defensa Técnica:** Demuestra comprensión de arquitectura híbrida (Nube + Fallback Local).
