# Propuesta: Chatbot Ciudadano Interactivo en Tiempo Real vía WebSocket (Sprint 6)

## 1. Alcance del Sprint

Este cambio aborda la implementación del canal de conversación asistida en tiempo real (**ChatScreen**), cubriendo la tarea **T-5.6** del plan maestro y la integración móvil con la infraestructura de WebSocket backend desarrollada en la Fase 1 (`T-1.1` a `T-1.11`).

### Componentes Incluidos
- **Cliente WebSocket Nativo Móvil**: Adaptación del hook `useWebSocket` para React Native, gestionando el handshake con token JWT en query param `?token=`, latidos heartbeat cada 30s y reconexión con backoff exponencial ante pérdidas de señal.
- **Interfaz Móvil Adaptativa**: Pantalla de chat con burbujas diferenciadas para usuario y bot, avatar institucional, indicador de "Escribiendo...", e integración con `KeyboardAvoidingView` para evitar que el teclado nativo tape los mensajes.
- **Flujos Conversacionales Soportados**:
  - Saludos y bienvenida interactiva.
  - Preguntas Frecuentes (FAQ) con botones de respuesta rápida (quick replies).
  - Consulta del estado de reportes propios mediante número de radicado.
  - Creación guiada paso a paso de reportes desde el chat.

### Exclusiones de este Sprint
- Notificaciones push nativas al recibir mensajes cuando la app está en background (Sprint 7).
- Modo offline para el chat (el chat requiere conexión activa WSS).

---

## 2. Dependencias y Módulos a Incorporar

Se utilizan las APIs nativas estándar de React Native (`WebSocket`, `KeyboardAvoidingView`, `FlatList`) sin dependencias pesadas de terceros, manteniendo el rendimiento y la ligereza del bundle.

---

## 3. Trazabilidad con Contratos del Backend (OpenSpec Raíz)

La aplicación consumirá:
- `WSS /?token={jwt}`: Endpoint de AWS API Gateway WebSocket (`chatConnect`).
- Mensaje saliente `{ "action": "sendMessage", "message": "...", "sessionId": "..." }`: Procesado por `chatHandleMessage`.
- Respuestas entrantes estructuradas `{ "type": "bot_response", "text": "...", "quickReplies": [...] }`.
