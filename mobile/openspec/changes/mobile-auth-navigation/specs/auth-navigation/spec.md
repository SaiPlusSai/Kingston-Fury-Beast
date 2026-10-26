## Purpose

Especificar los requerimientos funcionales y escenarios de prueba para la navegación y el sistema de autenticación segura de HALO Mobile, cubriendo el ciclo de vida del token y las pantallas de acceso del ciudadano.

## ADDED Requirements

### Requirement: RF-MOB-001 - Pantalla de Inicio (Splash Screen)

La app móvil SHALL mostrar una pantalla de bienvenida con el logotipo de HALO al iniciar, mientras comprueba concurrentemente la validez del token JWT almacenado en `expo-secure-store`.

#### Scenario: Sesión activa válida
- **WHEN** un ciudadano abre la aplicación y existe un token de sesión válido no expirado en SecureStore
- **THEN** la app redirige automáticamente al Dashboard (`MainTabs`) en menos de 3 segundos sin mostrar la pantalla de Login

#### Scenario: Sesión ausente o expirada
- **WHEN** la aplicación inicia sin tokens almacenados o el token no puede ser renovado
- **THEN** la app transiciona fluidamente a la pantalla de `Login` del `AuthStack`

### Requirement: RF-MOB-002 - Registro de Nuevo Usuario

La app móvil SHALL proporcionar un formulario de registro que valide entradas en el cliente y envíe la petición a `POST /api/auth/register`, gestionando la confirmación de cuenta mediante código OTP.

#### Scenario: Registro exitoso con validación de campos
- **WHEN** el usuario completa su nombre, correo válido, contraseña segura (8+ caracteres, mayúscula, número y especial) y zona de residencia
- **THEN** se envía la petición al backend y se muestra la pantalla `VerifyEmailScreen` para ingresar el código enviado por Cognito

#### Scenario: Error de validación en formulario
- **WHEN** el usuario ingresa un correo con formato inválido o una contraseña débil
- **THEN** se muestran mensajes de error específicos en línea debajo de cada campo afectado y se bloquea el envío

### Requirement: RF-MOB-003 - Inicio de Sesión

La app móvil SHALL autenticar al ciudadano contra el endpoint `POST /api/auth/login`, persistir de forma segura los tokens en `expo-secure-store` y cargar el perfil en el almacén global.

#### Scenario: Login exitoso y persistencia
- **WHEN** el usuario ingresa credenciales correctas y presiona "Iniciar Sesión"
- **THEN** el backend retorna `accessToken`, `refreshToken`, `idToken` y `user`, los tokens se guardan cifrados en SecureStore y la app navega a `MainTabs`

#### Scenario: Credenciales inválidas
- **WHEN** el usuario ingresa una contraseña incorrecta o un correo no registrado
- **THEN** la app presenta una alerta amigable ("Credenciales incorrectas") sin exponer detalles internos ni credenciales

### Requirement: RF-MOB-004 - Renovación Automática de Token

La app móvil SHALL interceptar peticiones HTTP salientes y renovar automáticamente el `accessToken` antes o al momento de su expiración mediante `POST /api/auth/refresh`.

#### Scenario: Renovación transparente exitosa
- **WHEN** una petición a la API recibe un código 401 o el token actual está a menos de 5 minutos de expirar
- **THEN** el interceptor de Axios utiliza el `refreshToken` para obtener un nuevo token y reintenta la petición original sin interrumpir al usuario

#### Scenario: Expiración definitiva de sesión
- **WHEN** el `refreshToken` también ha expirado (más de 30 días de inactividad) o es revocado
- **THEN** se limpian los tokens locales de SecureStore y se redirige al ciudadano a `Login` con el mensaje "Tu sesión ha expirado"

### Requirement: RF-MOB-005 - Cierre de Sesión Seguro

La app móvil SHALL permitir al ciudadano cerrar su sesión desde el perfil, eliminando los secretos locales y reseteando el estado en memoria.

#### Scenario: Logout manual
- **WHEN** el usuario confirma la acción de cerrar sesión
- **THEN** se eliminan las llaves de SecureStore, se vacía el store global y se navega a la pantalla de `Login` bloqueando el botón de retroceso hacia pantallas protegidas

### Requirement: RF-MOB-007 - Navegación Principal (BottomTabNavigator)

La app móvil SHALL organizar las secciones principales del ciudadano mediante una barra de navegación inferior de 5 pestañas: Inicio, Mis Reportes, Nuevo Reporte, Chat y Perfil.

#### Scenario: Navegación fluida entre pestañas
- **WHEN** el usuario toca cualquier pestaña de la barra inferior
- **THEN** la pantalla correspondiente se presenta de forma inmediata preservando el estado de las pestañas previas sin recargas innecesarias
