## Purpose

Especificar los requerimientos de interacción conversacional en tiempo real entre el ciudadano y el Chatbot de HALO Mobile mediante el protocolo WebSocket de AWS API Gateway.

## ADDED Requirements

### Requirement: RF-MOB-CHAT - Chatbot Ciudadano Interactivo

La app móvil SHALL proveer una pantalla de chat conectada al API Gateway WebSocket, permitiendo intercambiar mensajes en tiempo real, consultar estados y responder mediante opciones interactivas.

#### Scenario: Conexión WebSocket autenticada exitosa
- **WHEN** el ciudadano autenticado ingresa a la pestaña de Chat
- **THEN** la app establece la conexión WSS pasando el token JWT, recibe el mensaje inicial de bienvenida y habilita el campo de texto

#### Scenario: Envío y recepción de mensajes en tiempo real
- **WHEN** el usuario escribe una consulta sobre un reporte y presiona enviar
- **THEN** el mensaje se renderiza en la burbuja del usuario, se muestra el indicador de escritura y la respuesta del bot se recibe y renderiza en menos de 2 segundos

#### Scenario: Opciones rápidas (Quick Replies)
- **WHEN** el bot ofrece botones de opciones frecuentes (ej. "¿Cómo reportar?", "Ver mis reportes")
- **THEN** el usuario puede tocar una opción para enviarla como respuesta sin necesidad de escribir en el teclado

#### Scenario: Reconexión resiliente tras pérdida de señal
- **WHEN** el dispositivo pierde temporalmente la conexión a internet y la recupera
- **THEN** el cliente WebSocket se reconecta automáticamente preservando el historial de la sesión activa
