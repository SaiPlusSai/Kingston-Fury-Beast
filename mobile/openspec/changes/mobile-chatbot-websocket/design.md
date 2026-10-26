# Diseño Técnico: Chatbot Ciudadano vía WebSocket (Sprint 6)

## 1. Arquitectura de Conexión en Tiempo Real

```
ChatScreen
├── ChatHeader (Estado de Conexión: Conectado / Reconectando / Offline)
├── MessageList (Inverted FlatList para mantener el foco en mensajes recientes)
│   ├── UserMessageBubble (Alineado a la derecha, color azul corporativo)
│   ├── BotMessageBubble (Alineado a la izquierda con avatar de HALO)
│   └── TypingIndicator (Tres puntos animados durante procesamiento)
├── QuickRepliesBar (ScrollView horizontal con chips de preguntas frecuentes)
└── KeyboardAvoidingInput (TextInput + Botón de Envío con icono accesible)
```

---

## 2. Decisiones Arquitectónicas Locales

### ADR-MOB-010: Cliente WebSocket Ligero con Reconexión por Backoff
- **Contexto**: Las librerías de WebSocket complejas (ej. Socket.io) no son compatibles con AWS API Gateway WebSocket, el cual opera sobre el protocolo estándar RFC 6455.
- **Decisión**: Utilizar la API global nativa `WebSocket` de React Native encapsulada en el hook `useMobileWebSocket.ts`, implementando reintentos con backoff exponencial y jitter (1s, 2s, 4s, 8s hasta 30s).
- **Consecuencias**: Cero dependencias adicionales, consumo óptimo de batería y reconexión inmediata coordinada con `NetInfo`.

---

## 3. Estrategia de Pruebas y Validación

1. **Pruebas Unitarias (Jest)**:
   - Hook `useMobileWebSocket` con mock de `WebSocket` para probar apertura, recepción de mensajes JSON y manejo de cierre con código de error.
   - Formateador de burbujas de mensajes y cálculo de marcas temporales.
2. **Pruebas de Componentes (RNTL)**:
   - Renderizado de `ChatScreen` y envío de mensaje con `fireEvent.changeText` y `fireEvent.press`.
   - Interacción con botones de quick reply.
3. **Validación Estática y de Empaquetado**:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npx expo export --platform android`
