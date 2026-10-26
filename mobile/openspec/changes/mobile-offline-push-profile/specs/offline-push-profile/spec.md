## Purpose

Especificar los requerimientos funcionales para la entrega de alertas push del sistema, la resiliencia en modo desconectado con sincronización diferida y la gestión del perfil del ciudadano en HALO Mobile.

## ADDED Requirements

### Requirement: RF-MOB-011 - Registro de Token de Notificaciones Push

La app móvil SHALL solicitar permisos de notificaciones al inicio de sesión y registrar el token push del dispositivo en el backend.

#### Scenario: Registro exitoso de token push
- **WHEN** el usuario inicia sesión y concede permisos de notificaciones
- **THEN** la app obtiene el Expo Push Token y lo registra contra `POST /api/users/push-token` asociándolo al ID del usuario

### Requirement: RF-MOB-012 - Recepción y Enrutamiento de Notificaciones

La app móvil SHALL presentar notificaciones ante cambios en el estado de reportes o alertas de emergencia, adaptándose al estado operativo de la aplicación.

#### Scenario: Notificación con app en primer plano
- **WHEN** llega una notificación de actualización mientras el usuario utiliza la app
- **THEN** se muestra un banner toast superior no invasivo con sonido suave

#### Scenario: Enrutamiento deep link desde notificación nativa
- **WHEN** el usuario pulsa una notificación recibida con la app en segundo plano o cerrada
- **THEN** la aplicación se abre y navega directamente a la pantalla de detalle del reporte afectado

### Requirement: RF-MOB-013 - Borrador Offline y Sincronización Automática

La app móvil SHALL permitir capturar reportes sin conexión a internet, almacenarlos cifrados en el dispositivo y sincronizarlos automáticamente al recuperar la conectividad.

#### Scenario: Captura sin conexión a internet
- **WHEN** el usuario intenta enviar un reporte y `NetInfo` detecta ausencia de conexión
- **THEN** el reporte se guarda como borrador local cifrado y se informa al usuario que se enviará automáticamente

#### Scenario: Sincronización automática tras reconexión
- **WHEN** el dispositivo restablece su conexión de red (WiFi o datos móviles)
- **THEN** el servicio en segundo plano procesa la cola de borradores, envía los reportes y notifica al usuario del éxito

### Requirement: RF-MOB-014 - Pantalla de Perfil y Configuración

La app móvil SHALL permitir al ciudadano consultar sus estadísticas, modificar su información personal y gestionar preferencias de tema y seguridad.

#### Scenario: Edición de perfil exitosa
- **WHEN** el usuario modifica su teléfono o zona y presiona "Guardar Cambios"
- **THEN** se actualiza el backend vía `PUT /api/auth/me` y se actualiza el estado global de la app
