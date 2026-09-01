# Spec: Aplicación Móvil Nativa (React Native)

## 1. Resumen de la Capacidad

Este documento especifica todos los requisitos funcionales y no funcionales para la Aplicación Móvil Nativa de HALO, destinada a ciudadanos que necesitan reportar incidentes urbanos desde sus dispositivos móviles con una experiencia optimizada y nativa. La aplicación será desarrollada con React Native utilizando Expo (Bare Workflow) para aprovechar el conocimiento existente del equipo en React, mientras se mantiene acceso completo a módulos nativos para mapas, cámara, GPS y notificaciones push.

La aplicación móvil será una extensión directa del frontend web, consumiendo exactamente la misma API del backend serverless (`backend_urbanshield`), reutilizando la lógica de negocio y los endpoints existentes. No se creará un backend separado para la app móvil.

---

## 2. Requisitos Funcionales

### 2.1 Autenticación y Gestión de Sesión

#### RF-MOB-001: Pantalla de Inicio (Splash Screen)
- **Descripción:** La app debe mostrar una pantalla de splash con el logotipo de HALO al iniciar, mientras verifica si existe un token de sesión válido almacenado localmente.
- **Flujo:**
 1. La app se abre y muestra el splash screen con el logo animado de HALO (fade-in + scale).
 2. En paralelo, la app verifica si existe un token JWT en `expo-secure-store`.
 3. Si existe y no ha expirado, redirige automáticamente al Dashboard del ciudadano.
 4. Si no existe o ha expirado, redirige a la pantalla de Login.
 5. El splash screen no debe durar más de 3 segundos en el peor caso (token expirado + refresh fallido).
- **Criterio de Aceptación:** El usuario con sesión activa llega al Dashboard sin ver la pantalla de Login; el usuario sin sesión ve la pantalla de Login tras el splash.

#### RF-MOB-002: Registro de Nuevo Usuario
- **Descripción:** Nuevos ciudadanos deben poder crear una cuenta desde la app móvil.
- **Flujo:**
 1. El usuario accede a "Crear cuenta" desde la pantalla de Login.
 2. Completa el formulario con: nombre completo, correo electrónico, contraseña (mínimo 8 caracteres, al menos 1 mayúscula, 1 número), número de teléfono (opcional), zona/distrito de residencia.
 3. Se envía la solicitud al endpoint `POST /api/auth/register` del backend existente.
 4. El backend crea el usuario en Amazon Cognito y en `UsersTable` de DynamoDB.
 5. Se envía un correo de verificación (Cognito).
 6. La app muestra una pantalla de "Verifica tu correo electrónico" con un campo para ingresar el código de verificación.
 7. Tras verificar, el usuario es redirigido al Login para iniciar sesión.
- **Validaciones del formulario:**
 - Email: formato válido, no duplicado (verificar con backend antes de enviar).
 - Contraseña: mínimo 8 caracteres, 1 mayúscula, 1 número, 1 carácter especial.
 - Nombre: mínimo 2 caracteres, máximo 100.
 - Teléfono: formato válido si se proporciona.
- **Criterio de Aceptación:** Un usuario nuevo puede registrarse, verificar su correo e iniciar sesión exitosamente; los errores de validación se muestran en línea junto a cada campo.

#### RF-MOB-003: Inicio de Sesión
- **Descripción:** Usuarios registrados pueden iniciar sesión con correo y contraseña.
- **Flujo:**
 1. El usuario ingresa correo electrónico y contraseña.
 2. Se envía la solicitud al endpoint `POST /api/auth/login`.
 3. El backend valida las credenciales contra Cognito.
 4. Si es exitoso, el backend devuelve: `accessToken`, `refreshToken`, `idToken`, y el objeto `user` con datos del perfil.
 5. La app almacena los tokens en `expo-secure-store` (almacenamiento cifrado nativo).
 6. Se almacena el objeto `user` en el estado global de la app (Context/Redux).
 7. Se redirige al Dashboard.
 8. Si falla: mostrar mensaje de error específico ("Credenciales incorrectas", "Cuenta no verificada", "Cuenta bloqueada").
- **Criterio de Aceptación:** El login funciona correctamente y los tokens se persisten de forma segura; tras cerrar y reabrir la app, la sesión se mantiene.

#### RF-MOB-004: Renovación Automática de Token
- **Descripción:** La app debe renovar automáticamente el `accessToken` cuando esté próximo a expirar.
- **Flujo:**
 1. Un interceptor HTTP (Axios interceptor) verifica la fecha de expiración del `accessToken` antes de cada petición.
 2. Si faltan menos de 5 minutos para que expire, usa el `refreshToken` para obtener un nuevo `accessToken` de forma transparente.
 3. Si el `refreshToken` también ha expirado (sesión de más de 30 días), cierra la sesión y redirige al Login con un mensaje: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
- **Criterio de Aceptación:** Las peticiones del usuario nunca fallan por token expirado si el `refreshToken` sigue vigente; la renovación es invisible para el usuario.

#### RF-MOB-005: Cierre de Sesión
- **Descripción:** El usuario puede cerrar sesión desde el menú de perfil.
- **Flujo:**
 1. Eliminar todos los tokens de `expo-secure-store`.
 2. Limpiar el estado global de la app.
 3. Desregistrar el token de push notifications del backend.
 4. Redirigir a la pantalla de Login.
- **Criterio de Aceptación:** Tras cerrar sesión, no se puede acceder a ninguna pantalla protegida sin volver a iniciar sesión; los datos sensibles son eliminados del dispositivo.

### 2.2 Dashboard del Ciudadano

#### RF-MOB-006: Pantalla Principal (Home)
- **Descripción:** La pantalla principal debe mostrar un resumen del estado de la ciudad y accesos rápidos a las funcionalidades principales.
- **Contenido:**
 1. **Header:** Logo de HALO + nombre del usuario + icono de notificaciones (badge con conteo de no leídas).
 2. **Mapa Interactivo:** Mapa a pantalla parcial (60% de la pantalla) mostrando los incidentes recientes reportados en la zona del usuario, con marcadores coloreados por categoría y estado. Implementado con `react-native-maps` (Google Maps en Android, Apple Maps en iOS).
 3. **Botón Flotante de Reporte Rápido:** FAB (Floating Action Button) rojo con icono de "+" para crear un nuevo reporte rápidamente. Posicionado en la esquina inferior derecha, sobre el mapa.
 4. **Tarjetas de Resumen:** Debajo del mapa, tarjetas horizontales scrolleables mostrando:
   - "Tus reportes activos: X"
   - "Incidentes en tu zona hoy: Y"
   - "Alertas de emergencia: Z"
 5. **Lista de Incidentes Recientes:** Lista vertical con los últimos 10 incidentes reportados en la zona del usuario, cada uno mostrando: ícono de categoría, título breve, distancia desde la ubicación del usuario, tiempo relativo ("hace 15 min"), estado con color.
- **Datos:** Se cargan llamando a `GET /api/reports?lat={lat}&lon={lon}&radius=5000` para incidentes cercanos y `GET /api/reports/user` para los reportes propios del usuario.
- **Criterio de Aceptación:** El dashboard carga correctamente con el mapa y los incidentes en menos de 3 segundos; el mapa está centrado en la ubicación actual del usuario.

#### RF-MOB-007: Navegación Principal
- **Descripción:** La app utiliza una barra de navegación inferior (Bottom Tab Navigator) con las siguientes pestañas.
- **Pestañas:**

 | Pestaña | Ícono | Pantalla | Descripción |
 |---|---|---|---|
 | Inicio | | HomeScreen | Dashboard con mapa e incidentes |
 | Mis Reportes | | MyReportsScreen | Lista de todos los reportes del usuario |
 | Nuevo Reporte | | CreateReportScreen | Formulario de creación de reporte |
 | Chat | | ChatScreen | Chatbot interactivo |
 | Perfil | | ProfileScreen | Datos del usuario y configuración |

- **Comportamiento:** La pestaña activa se resalta visualmente; el badge de notificaciones aparece sobre la pestaña de Chat cuando hay mensajes no leídos.
- **Criterio de Aceptación:** La navegación funciona fluidamente sin lag perceptible; el estado de cada pestaña se preserva al navegar entre ellas.

### 2.3 Creación de Reportes

#### RF-MOB-008: Formulario de Creación de Reporte
- **Descripción:** Pantalla para crear un nuevo reporte de incidente utilizando las capacidades nativas del dispositivo.
- **Campos del formulario:**

 1. **Categoría (obligatorio):** Selector visual con iconos y colores para cada categoría:
   - Emergencia de Seguridad — Rojo
   - Accidente de Tránsito — Naranja
   - Infraestructura — Amarillo
   - Emergencia Médica — Verde
   - Incendio — Rojo oscuro
   - Desastre Natural — Azul
   - Otro — Gris

 2. **Título/Descripción Corta (obligatorio):** Input de texto, mínimo 5 caracteres, máximo 100.
 
 3. **Descripción Detallada (obligatorio):** TextArea multilínea, mínimo 20 caracteres, máximo 1000.

 4. **Ubicación (obligatorio):**
   - **Opción A (predeterminada):** "Usar mi ubicación actual". Al seleccionar, solicita permisos de ubicación (`expo-location`) y obtiene coordenadas GPS del dispositivo con precisión alta (`Accuracy.Highest`). Muestra un mini-mapa con un pin editable (el usuario puede arrastrar el pin para ajustar la ubicación exacta).
   - **Opción B:** "Buscar dirección". Campo de texto con autocompletado que usa Amazon Location Service para geocodificación directa. Al seleccionar un resultado, muestra el mini-mapa con el pin en la ubicación seleccionada.
 
 5. **Evidencia Fotográfica (opcional, máximo 3 fotos):**
   - Botón "Tomar Foto": Abre la cámara del dispositivo usando `expo-image-picker` con `launchCameraAsync()`. La imagen se comprime a máximo 1MB (quality: 0.7, maxWidth: 1920).
   - Botón "Elegir de Galería": Abre la galería usando `launchImageLibraryAsync()` con las mismas restricciones.
   - Cada foto se muestra como thumbnail con botón de eliminar (X).
   - Las fotos se suben a S3 usando pre-signed URLs obtenidas de `GET /api/uploads/presigned-url`.

 6. **Nivel de Urgencia (obligatorio):**
   - Bajo: "No es urgente, puede esperar"
   - Medio: "Requiere atención pronto"
   - Alto: "Situación peligrosa, requiere atención inmediata"
   - Crítico: "Hay personas en peligro inmediato"

 7. **Datos Adicionales (opcionales):**
   - Número de personas afectadas (numérico).
   - ¿Siguen las autoridades presentes? (Sí/No).
   - ¿Deseas que tu reporte sea anónimo? (Toggle).

- **Flujo de envío:**
 1. El usuario completa el formulario y presiona "Enviar Reporte".
 2. Se validan todos los campos en el cliente.
 3. Si hay fotos, se suben primero a S3 (con indicador de progreso).
 4. Se envía el reporte al endpoint `POST /api/reports` con todos los datos.
 5. Se muestra una pantalla de confirmación con el número de reporte asignado.
 6. Se redirige al detalle del reporte o al dashboard.
- **Criterio de Aceptación:** El reporte se crea correctamente con foto, GPS y todos los campos; el reporte aparece inmediatamente en "Mis Reportes" y en el panel de administración.

#### RF-MOB-009: Lista de Reportes del Usuario
- **Descripción:** Pantalla que muestra todos los reportes creados por el usuario, con filtros y búsqueda.
- **Contenido por cada reporte en la lista:**
 - Thumbnail de la primera foto (si tiene) o ícono de categoría.
 - Título del reporte.
 - Categoría con color.
 - Estado con badge de color (Pendiente = amarillo, En Progreso = azul, Resuelto = verde, Cerrado = gris).
 - Fecha de creación en formato relativo ("hace 2 días") o absoluto si es mayor a 7 días.
 - Distancia desde la ubicación actual del usuario.
- **Filtros:** Por estado, por categoría, por fecha (últimos 7 días / 30 días / todos).
- **Pull-to-refresh:** Actualización manual tirando hacia abajo.
- **Paginación:** Scroll infinito con carga de 20 reportes por página.
- **Criterio de Aceptación:** La lista carga y muestra todos los reportes del usuario correctamente; los filtros funcionan y reducen la lista en tiempo real; el pull-to-refresh actualiza los datos.

#### RF-MOB-010: Detalle de Reporte
- **Descripción:** Pantalla de detalle que muestra toda la información de un reporte específico.
- **Contenido:**
 1. **Header:** Categoría (ícono + nombre), estado (badge grande con color), número de reporte.
 2. **Mapa:** Mapa interactivo mostrando la ubicación exacta del incidente con un marcador.
 3. **Información del incidente:** Título, descripción completa, nivel de urgencia, fecha y hora del reporte.
 4. **Galería de fotos:** Carrusel horizontal con las fotos adjuntas (con zoom y pan gesture).
 5. **Timeline de actividad:** Lista cronológica de todas las actualizaciones del reporte (logs de actividad) mostrando quién hizo qué y cuándo:
   ```
   ● 01/09/2026 15:00 — Estado cambiado a "En Investigación"
    Oficial Martinez asignado al caso.
   ● 31/08/2026 16:30 — Evidencia adicional adjuntada
    Administrador adjuntó foto del sitio.
   ● 31/08/2026 14:30 — Reporte creado
    Reportado por el ciudadano desde la app móvil.
   ```
 6. **Acciones disponibles:**
   - "Agregar comentario": Permite al ciudadano añadir información adicional.
   - "Adjuntar más fotos": Permite subir fotos adicionales.
   - "Compartir": Genera un enlace compartible del reporte.
- **Criterio de Aceptación:** Toda la información del reporte se muestra correctamente; el timeline de actividad se actualiza en tiempo real si se recibe una notificación WebSocket.

### 2.4 Notificaciones Push

#### RF-MOB-011: Registro de Token de Push
- **Descripción:** Al iniciar sesión, la app debe registrar el token de push notifications del dispositivo en el backend.
- **Flujo:**
 1. Solicitar permisos de notificaciones al usuario (`expo-notifications`).
 2. Obtener el Expo Push Token o el token FCM/APNs nativo.
 3. Enviar el token al backend: `POST /api/users/push-token` con `{ "pushToken": "ExponentPushToken[xxx]", "platform": "android|ios" }`.
 4. El backend almacena el token en `UsersTable` asociado al `userId`.
- **Criterio de Aceptación:** El token se registra correctamente en el primer inicio de sesión; si el token cambia (reinstalación), se actualiza automáticamente.

#### RF-MOB-012: Recepción de Notificaciones Push
- **Descripción:** El usuario debe recibir notificaciones push cuando:
 - El estado de uno de sus reportes cambia.
 - Se emite una alerta de emergencia en su zona.
 - Hay una respuesta del soporte a un ticket de ayuda.
- **Comportamiento:**
 - **App en primer plano:** Mostrar un banner in-app (toast notification) en la parte superior de la pantalla.
 - **App en segundo plano:** Mostrar notificación nativa del sistema operativo con sonido y vibración.
 - **App cerrada:** Mostrar notificación nativa; al tocar, la app se abre directamente en el detalle del reporte correspondiente (deep linking).
- **Criterio de Aceptación:** Las notificaciones se reciben correctamente en los 3 estados (foreground, background, killed); al tocar la notificación se navega al contexto correcto.

### 2.5 Modo Offline

#### RF-MOB-013: Borrador Offline de Reportes
- **Descripción:** Si el usuario intenta crear un reporte sin conexión a internet, la app debe guardar un borrador local.
- **Flujo:**
 1. El usuario completa el formulario de reporte y presiona "Enviar".
 2. La app detecta que no hay conexión (NetInfo).
 3. Guarda el reporte como borrador en AsyncStorage con estado `draft_offline`.
 4. Muestra un mensaje: "Sin conexión. Tu reporte se guardó como borrador y se enviará automáticamente cuando recuperes la conexión."
 5. Cuando la app detecta que recuperó conexión, intenta enviar todos los borradores pendientes automáticamente.
 6. Si el envío es exitoso, elimina el borrador local y notifica al usuario.
 7. Si falla, mantiene el borrador y reintenta en el próximo ciclo de conectividad.
- **Criterio de Aceptación:** El borrador se guarda localmente cuando no hay conexión; se envía automáticamente al recuperar conexión; el usuario es notificado del envío exitoso.

### 2.6 Perfil del Usuario

#### RF-MOB-014: Pantalla de Perfil
- **Descripción:** Pantalla donde el usuario puede ver y editar su información personal y gestionar la configuración de la app.
- **Contenido:**
 1. **Foto de perfil:** Avatar con iniciales o foto subida por el usuario. Botón para cambiar foto.
 2. **Datos personales:** Nombre, correo (no editable), teléfono, zona/distrito.
 3. **Estadísticas:** Número total de reportes creados, reportes resueltos, tiempo promedio de resolución de sus reportes.
 4. **Configuración:**
   - Activar/desactivar notificaciones push.
   - Activar/desactivar ubicación en background.
   - Modo oscuro / Modo claro.
   - Idioma (solo español en v1).
 5. **Acciones:**
   - Cambiar contraseña.
   - Cerrar sesión.
   - Eliminar cuenta (con confirmación de doble paso).
 6. **Acerca de:** Versión de la app, créditos, términos de uso, política de privacidad.
- **Criterio de Aceptación:** El usuario puede ver y editar todos sus datos correctamente; los cambios se reflejan inmediatamente en el backend y en la UI.

---

## 3. Requisitos No Funcionales

### 3.1 Rendimiento
- **RNF-MOB-001:** La app debe iniciar (cold start hasta dashboard visible) en menos de 4 segundos en un dispositivo de gama media (ej. Samsung Galaxy A54, iPhone SE 3).
- **RNF-MOB-002:** Las transiciones entre pantallas no deben tardar más de 300ms.
- **RNF-MOB-003:** El scroll de la lista de reportes debe mantener 60 FPS sin jank perceptible.
- **RNF-MOB-004:** La carga de imágenes debe usar lazy loading y caching local (`expo-image` o `FastImage`).
- **RNF-MOB-005:** El tamaño del bundle (APK) no debe superar los 50MB.

### 3.2 Compatibilidad
- **RNF-MOB-006:** Android: compatible con Android 10 (API 29) en adelante.
- **RNF-MOB-007:** iOS: compatible con iOS 14 en adelante.
- **RNF-MOB-008:** La app debe funcionar correctamente en pantallas desde 4.7" (iPhone SE) hasta 6.9" (iPhone 16 Pro Max) y tablets de 10".
- **RNF-MOB-009:** Soporte para modo oscuro (Dark Mode) del sistema operativo.
- **RNF-MOB-010:** Soporte para orientación vertical (portrait); landscape opcional para la vista de mapa.

### 3.3 Seguridad
- **RNF-MOB-011:** Los tokens JWT deben almacenarse exclusivamente en `expo-secure-store` (Keychain en iOS, EncryptedSharedPreferences en Android). Nunca en AsyncStorage ni en memoria persistente no cifrada.
- **RNF-MOB-012:** Todas las comunicaciones con el backend deben realizarse sobre HTTPS/WSS. No se permiten excepciones de seguridad.
- **RNF-MOB-013:** Los borradores offline deben cifrar la información sensible (descripción, coordenadas) antes de almacenarlos en AsyncStorage.
- **RNF-MOB-014:** La app debe implementar certificate pinning para las peticiones al API Gateway de producción.
- **RNF-MOB-015:** No se debe almacenar información personal del usuario en logs, analytics, ni crash reports.

### 3.4 Accesibilidad
- **RNF-MOB-016:** Todos los elementos interactivos deben tener labels de accesibilidad (`accessibilityLabel`).
- **RNF-MOB-017:** Los colores deben cumplir con un ratio de contraste mínimo de 4.5:1 (WCAG AA).
- **RNF-MOB-018:** Los tamaños de fuente deben respetar la configuración de accesibilidad del sistema operativo (Dynamic Type en iOS, font scale en Android).
- **RNF-MOB-019:** La navegación debe ser completamente operable mediante gestos estándar del sistema (swipe back, tap, long press).

### 3.5 UX/UI
- **RNF-MOB-020:** La app debe seguir las guías de diseño de Material Design 3 (Android) y Human Interface Guidelines (iOS) mediante componentes adaptativos de React Native Paper o NativeBase.
- **RNF-MOB-021:** Todos los estados de carga deben mostrar skeletons o spinners animados. Nunca pantallas en blanco.
- **RNF-MOB-022:** Los errores deben mostrarse con mensajes amigables y accionables, nunca con códigos de error técnicos.
- **RNF-MOB-023:** Los formularios deben preservar su estado si el usuario rota el dispositivo o navega accidentalmente fuera de la pantalla.

---

## 4. Estructura de Navegación

```
App (Root)
├── AuthStack (no autenticado)
│  ├── SplashScreen
│  ├── LoginScreen
│  ├── RegisterScreen
│  └── VerifyEmailScreen
│
└── MainStack (autenticado)
  └── BottomTabNavigator
    ├── HomeTab
    │  ├── HomeScreen (Dashboard con mapa)
    │  └── IncidentDetailScreen
    │
    ├── MyReportsTab
    │  ├── MyReportsListScreen
    │  └── ReportDetailScreen
    │
    ├── CreateReportTab
    │  └── CreateReportScreen
    │
    ├── ChatTab
    │  └── ChatScreen (Chatbot WebSocket)
    │
    └── ProfileTab
      ├── ProfileScreen
      ├── EditProfileScreen
      ├── ChangePasswordScreen
      ├── SettingsScreen
      └── AboutScreen
```

---

## 5. Dependencias de Paquetes (package.json estimado)

```json
{
 "dependencies": {
  "expo": "~51.x.x",
  "react-native": "0.74.x",
  "react-native-maps": "^1.x.x",
  "expo-location": "~17.x.x",
  "expo-image-picker": "~15.x.x",
  "expo-secure-store": "~13.x.x",
  "expo-notifications": "~0.28.x",
  "expo-image": "~1.x.x",
  "@react-navigation/native": "^6.x.x",
  "@react-navigation/bottom-tabs": "^6.x.x",
  "@react-navigation/native-stack": "^6.x.x",
  "@react-native-async-storage/async-storage": "^1.x.x",
  "@react-native-community/netinfo": "^11.x.x",
  "axios": "^1.x.x",
  "zustand": "^4.x.x",
  "react-native-reanimated": "~3.x.x",
  "react-native-gesture-handler": "~2.x.x"
 }
}
```

---

## 6. Contratos de API Consumidos

La app móvil consumirá los siguientes endpoints existentes del backend sin modificaciones:

| Método | Endpoint | Uso en la App |
|---|---|---|
| `POST` | `/api/auth/register` | Registro de nuevo usuario |
| `POST` | `/api/auth/login` | Inicio de sesión |
| `POST` | `/api/auth/refresh` | Renovación de token |
| `GET` | `/api/reports` | Listar incidentes (con filtros geo) |
| `GET` | `/api/reports/user` | Reportes del usuario autenticado |
| `GET` | `/api/reports/:id` | Detalle de un reporte |
| `POST` | `/api/reports` | Crear nuevo reporte |
| `PUT` | `/api/reports/:id` | Actualizar reporte |
| `GET` | `/api/uploads/presigned-url` | Obtener URL para subir foto a S3 |
| `GET` | `/api/notifications` | Listar notificaciones del usuario |
| `PUT` | `/api/users/profile` | Actualizar perfil del usuario |
| `POST` | `/api/users/push-token` | Registrar token de push (nuevo endpoint) |
| `WSS` | WebSocket API | Chatbot interactivo |

**Nuevo endpoint requerido en el backend:**

#### POST /api/users/push-token
**Request Body:**
```json
{
 "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
 "platform": "android",
 "deviceId": "unique-device-identifier"
}
```
**Response (200):**
```json
{
 "success": true,
 "message": "Push token registrado exitosamente"
}
```

---

## 7. Diagrama de Arquitectura Móvil

```
┌───────────────────────────────────────────────────────┐
│         DISPOSITIVO MÓVIL           │
│                             │
│ ┌──────────────────────────────────────────────────┐ │
│ │      React Native App (Expo)        │ │
│ │                          │ │
│ │ ┌────────────┐ ┌────────────┐ ┌────────────┐ │ │
│ │ │  Screens │ │  Store  │ │ Services │ │ │
│ │ │ (UI/UX)  │ │ (Zustand) │ │ (API)   │ │ │
│ │ └─────┬──────┘ └─────┬──────┘ └──────┬─────┘ │ │
│ │    │        │         │     │ │
│ │ ┌─────┴───────────────┴─────────────────┴─────┐ │ │
│ │ │      Native Modules (Expo)       │ │ │
│ │ │ ┌──────┐ ┌──────┐ ┌────────┐ ┌──────────┐ │ │ │
│ │ │ │Camera│ │ GPS │ │SecStore│ │Push Notif│ │ │ │
│ │ │ └──────┘ └──────┘ └────────┘ └──────────┘ │ │ │
│ │ └─────────────────────┬───────────────────────┘ │ │
│ └────────────────────────┼──────────────────────────┘ │
│              │               │
└───────────────────────────┼──────────────────────────────┘
              │ HTTPS / WSS
              ▼
       ┌──────────────────────────┐
       │  AWS API Gateway    │
       │ (HTTP API + WebSocket) │
       └────────────┬─────────────┘
              │
       ┌────────────┴─────────────┐
       │   AWS Lambda     │
       │  (backend_urbanshield) │
       └────────────┬─────────────┘
              │
     ┌─────────────────┼─────────────────┐
     ▼         ▼         ▼
 ┌────────────┐  ┌────────────┐  ┌────────────┐
 │ DynamoDB │  │  S3    │  │ Cognito  │
 │ (Tables) │  │ (Photos) │  │ (Auth)  │
 └────────────┘  └────────────┘  └────────────┘
```


