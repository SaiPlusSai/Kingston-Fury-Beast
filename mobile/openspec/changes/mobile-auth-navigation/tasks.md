# Tareas de Implementación: Autenticación y Navegación (Sprint 2)

Todas las tareas corresponden al Sprint 2 y se encuentran en estado planificado (`- [ ]`), pendientes de aprobación para su implementación.

---

## Fase 1: Arquitectura de Navegación y Tipos

- [ ] **T-MOB-2.1:** Configurar dependencias de navegación (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `react-native-screens`, `react-native-safe-area-context`) e implementar el sistema de tipos de rutas (`types/navigation.ts`).
  - **Verificación:** `npx tsc --noEmit` ejecuta sin errores de resolución de tipos de rutas.

- [ ] **T-MOB-2.2:** Implementar `RootNavigator.tsx` con navegación condicional basada en el estado de autenticación (`SplashScreen`, `AuthStack`, `MainTabs`).
  - **Verificación:** `npx expo export --platform android` resuelve la estructura de navegación sin errores de importación.

- [ ] **T-MOB-2.3:** Implementar `MainTabs.tsx` con la barra de navegación inferior de 5 pestañas e iconos adaptativos para Home, MyReports, CreateReport, Chat y Profile.
  - **Verificación:** `npx tsc --noEmit` y `npm run lint` validan la barra de navegación sin violaciones de diseño.

## Fase 2: Almacenamiento Seguro y Cliente HTTP

- [ ] **T-MOB-2.4:** Configurar `expo-secure-store` e implementar el servicio `authStorage.ts` para persistencia cifrada de `accessToken`, `refreshToken` y datos de usuario.
  - **Verificación:** Prueba unitaria de Jest con mock de `expo-secure-store` valida guardado, lectura y borrado de tokens.

- [ ] **T-MOB-2.5:** Configurar cliente Axios en `api/client.ts` con interceptores de inyección de Bearer token y renovación automática contra `POST /api/auth/refresh`.
  - **Verificación:** Prueba unitaria con Axios Mock Adapter verifica que un 401 dispara el refresh y reintenta la petición original.

- [ ] **T-MOB-2.6:** Implementar store de autenticación con Zustand (`store/useAuthStore.ts`) para sincronizar el estado global del usuario autenticado.
  - **Verificación:** Prueba unitaria de Zustand verifica mutaciones de estado en login, logout y carga inicial.

## Fase 3: Pantallas de Autenticación y Validación

- [ ] **T-MOB-2.7:** Implementar `SplashScreen.tsx` con animación de bienvenida y verificación de sesión en segundo plano (máximo 3 segundos).
  - **Verificación:** Prueba de componente con React Native Testing Library confirma el flujo de redirección según el resultado del token.

- [ ] **T-MOB-2.8:** Implementar `LoginScreen.tsx` con formulario validado, llamada a `POST /api/auth/login` y manejo de errores amigables.
  - **Verificación:** Prueba de componente verifica que el botón de envío permanece deshabilitado hasta cumplir las reglas de validación.

- [ ] **T-MOB-2.9:** Implementar `RegisterScreen.tsx` y `VerifyEmailScreen.tsx` con validaciones de campos (correo, contraseña segura, nombre, zona) y envío a `POST /api/auth/register`.
  - **Verificación:** `npm run lint` y `npx tsc --noEmit` ejecutan con 0 errores; prueba de RNTL valida el paso de verificación de código OTP.
