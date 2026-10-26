# Propuesta: Autenticación, Sesión Segura y Navegación Principal (Sprint 2)

## 1. Alcance del Sprint

Este cambio aborda la implementación de la infraestructura de navegación y el ciclo completo de autenticación y gestión de sesiones para la aplicación móvil **HALO Mobile**, cubriendo las tareas **T-5.1** y **T-5.2** del plan maestro y los requerimientos funcionales **RF-MOB-001**, **RF-MOB-002**, **RF-MOB-003**, **RF-MOB-004**, **RF-MOB-005** y **RF-MOB-007**.

### Componentes Incluidos
- **Arquitectura de Navegación**: Integración de `@react-navigation/native`, `@react-navigation/native-stack` y `@react-navigation/bottom-tabs` con navegación basada en estado (`RootNavigator`).
- **Pila de Autenticación (`AuthStack`)**:
  - `SplashScreen`: Verificación inicial de sesión persistida y enrutamiento dinámico.
  - `LoginScreen`: Formulario de inicio de sesión con validación de credenciales.
  - `RegisterScreen`: Formulario de registro de nuevo ciudadano.
  - `VerifyEmailScreen`: Ingreso de código OTP para confirmación de cuenta en Cognito.
- **Pila Principal (`MainTabs`)**: Estructura de Bottom Tab Navigator con las 5 pestañas principales (Inicio, Mis Reportes, Crear Reporte, Chat, Perfil) con vistas placeholder tipadas para los siguientes sprints.
- **Persistencia Segura**: Integración de `expo-secure-store` para almacenamiento cifrado de `accessToken` y `refreshToken`.
- **Cliente HTTP y Resiliencia**: Configuración de Axios con interceptores para inyección automática de Bearer Token y renovación transparente contra `POST /api/auth/refresh`.

### Exclusiones de este Sprint
- Componentes funcionales de mapa (`react-native-maps`), GPS (`expo-location`), cámara (`expo-image-picker`), notificaciones push (`expo-notifications`) y conexión WebSocket de chat, reservados para sprints posteriores.

---

## 2. Dependencias y Módulos a Incorporar

| Módulo / Paquete | Versión Compatible (Expo SDK 51) | Propósito |
|---|---|---|
| `@react-navigation/native` | `^6.1.18` | Contenedor principal de navegación |
| `@react-navigation/native-stack` | `^6.10.1` | Pila de navegación para flujos de autenticación |
| `@react-navigation/bottom-tabs` | `^6.6.1` | Barra de navegación inferior persistente |
| `react-native-screens` | `~3.31.1` | Optimización nativa de vistas para React Navigation |
| `react-native-safe-area-context` | `4.10.5` | Manejo de safe area insets (notches, home bars) |
| `expo-secure-store` | `~13.0.2` | Almacenamiento seguro cifrado en hardware nativo |
| `axios` | `^1.7.0` | Cliente HTTP con interceptores de autenticación |
| `zustand` | `^4.5.2` | Gestión de estado global de sesión de usuario |

---

## 3. Trazabilidad con Contratos del Backend (OpenSpec Raíz)

La aplicación móvil consumirá los contratos existentes en `backend/src/routes/auth.routes.js`:
- `POST /api/auth/register`: Registro de usuario en Cognito y UsersTable.
- `POST /api/auth/login`: Validación de credenciales y emisión de tokens.
- `POST /api/auth/refresh`: Renovación automática de tokens mediante `refreshToken`.
- `POST /api/auth/logout`: Invalidación de sesión del usuario.
- `GET /api/auth/me`: Obtención de datos del perfil del ciudadano autenticado.
