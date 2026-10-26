# Propuesta: Notificaciones Push, Resiliencia Offline y Gestión de Perfil (Sprint 7)

## 1. Alcance del Sprint

Este cambio aborda la implementación de las capacidades de notificaciones del sistema operativo, el almacenamiento local ante pérdida de red y la gestión integral de la cuenta ciudadana, cubriendo las tareas **T-5.7**, **T-5.8** y **T-5.9** del plan maestro y los requerimientos funcionales **RF-MOB-011**, **RF-MOB-012**, **RF-MOB-013** y **RF-MOB-014**.

### Componentes Incluidos
- **Notificaciones Push (`expo-notifications`)**:
  - Solicitud de permisos al sistema operativo en el inicio de sesión.
  - Obtención del Expo Push Token y registro contra el backend.
  - Manejo de los 3 estados: primer plano (banner in-app tipo toast), segundo plano (notificación nativa) y app cerrada (deep link hacia el detalle del reporte).
- **Modo Offline y Sincronización Automática**:
  - Detección de conectividad en tiempo real mediante `@react-native-community/netinfo`.
  - Guardado de reportes incompletos o no enviados en `@react-native-async-storage/async-storage` con cifrado de campos sensibles (RNF-MOB-013).
  - Listener de reconexión que dispara el envío automático de la cola de borradores diferidos sin intervención del usuario.
- **Pantalla de Perfil del Ciudadano (`ProfileScreen`)**:
  - Visualización y edición de datos personales (nombre, teléfono, distrito de residencia).
  - Métricas personales: total de reportes emitidos, reportes resueltos y tiempo promedio de atención.
  - Preferencias: activación de notificaciones, ubicación en segundo plano y modo oscuro/claro.
  - Acciones críticas: cambio de contraseña y cierre seguro de sesión con purga de credenciales locales.

---

## 2. Dependencias y Módulos a Incorporar

| Módulo / Paquete | Versión Compatible (Expo SDK 51) | Propósito |
|---|---|---|
| `expo-notifications` | `~0.28.19` | Notificaciones push locales y remotas |
| `@react-native-community/netinfo` | `11.3.1` | Detección del estado de la interfaz de red |
| `@react-native-async-storage/async-storage` | `1.23.1` | Persistencia local de borradores y preferencias |

---

## 3. Trazabilidad con Contratos del Backend (OpenSpec Raíz)

La aplicación consumirá:
- `POST /api/users/push-token`: Registro del token de notificaciones push del dispositivo.
- `GET /api/auth/me`: Carga de datos de perfil y estadísticas del usuario.
- `PUT /api/auth/me`: Actualización de nombre, teléfono y distrito.
- `PUT /api/auth/password`: Cambio de contraseña autenticado.
- `POST /api/auth/logout`: Invalidación de sesión y revocación del token push.
