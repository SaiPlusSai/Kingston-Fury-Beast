# Tareas de Implementación: Chatbot Ciudadano vía WebSocket (Sprint 6)

Todas las tareas corresponden al Sprint 6 y se encuentran en estado planificado (`- [ ]`), pendientes de aprobación para su implementación.

---

## Fase 1: Cliente WebSocket y Gestión de Estado

- [ ] **T-MOB-6.1:** Implementar el hook `useMobileWebSocket.ts` para gestionar conexión WSS autenticada, latidos heartbeat y reconexión automática con backoff exponencial.
  - **Verificación:** Prueba unitaria con mock de WebSocket valida el flujo de reconexión y serialización de mensajes JSON.

- [ ] **T-MOB-6.2:** Implementar el store de mensajes de chat con Zustand (`store/useChatStore.ts`) con persistencia en memoria y manejo de sesiones.
  - **Verificación:** Prueba unitaria verifica la acumulación de mensajes y la actualización de quick replies.

## Fase 2: Componentes UI de Conversación

- [ ] **T-MOB-6.3:** Implementar componentes de burbujas `MessageBubble.tsx` (usuario y bot) y el indicador animado `TypingIndicator.tsx`.
  - **Verificación:** Prueba de componente en RNTL valida el renderizado accesible de mensajes de texto y estados de carga.

- [ ] **T-MOB-6.4:** Implementar la barra de opciones rápidas `QuickReplies.tsx` con eventos táctiles para envío directo de intenciones FAQ.
  - **Verificación:** Prueba de componente confirma que presionar un chip despacha el mensaje al WebSocket.

## Fase 3: Integración de Pantalla y Teclado

- [ ] **T-MOB-6.5:** Integrar la pantalla completa `ChatScreen.tsx` adaptada a `KeyboardAvoidingView` para Android e iOS.
  - **Verificación:** `npx expo export --platform android` valida el empaquetado del bundle sin conflictos de layout o dependencias.
