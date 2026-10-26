# Tareas de Implementación: Push, Offline y Perfil (Sprint 7)

Todas las tareas corresponden al Sprint 7 y se encuentran en estado planificado (`- [ ]`), pendientes de aprobación para su implementación.

---

## Fase 1: Notificaciones Push

- [ ] **T-MOB-7.1:** Configurar `expo-notifications` en `mobile/app.json` declarando canales de Android y manejadores de interacción.
  - **Verificación:** `npx expo config --type public` valida la configuración del plugin de notificaciones.

- [ ] **T-MOB-7.2:** Implementar el servicio `notificationService.ts` para solicitar permisos, obtener el push token y registrarlo en `POST /api/users/push-token`.
  - **Verificación:** Prueba unitaria con mock de `expo-notifications` valida el registro en backend.

- [ ] **T-MOB-7.3:** Implementar el enrutador de notificaciones (deep linking) para navegar directamente al detalle de un reporte al tocar una notificación.
  - **Verificación:** Prueba unitaria valida el mapeo de `metadata.reportId` hacia la ruta de navegación correspondiente.

## Fase 2: Resiliencia Offline

- [ ] **T-MOB-7.4:** Configurar `@react-native-community/netinfo` e implementar el hook `useNetworkStatus.ts` para detectar conectividad en tiempo real.
  - **Verificación:** Prueba unitaria con mock de NetInfo verifica la detección de estados online/offline.

- [ ] **T-MOB-7.5:** Implementar el gestor de borradores `offlineSyncService.ts` con almacenamiento cifrado en `AsyncStorage` y sincronización automática.
  - **Verificación:** Prueba unitaria simula la transición offline-online y el vaciado exitoso de la cola de reportes pendientes.

## Fase 3: Pantalla de Perfil

- [ ] **T-MOB-7.6:** Implementar `ProfileScreen.tsx` con datos del usuario, estadísticas, preferencias de tema/notificaciones, cambio de contraseña y logout.
  - **Verificación:** `npx expo export --platform android` valida el empaquetado del bundle sin errores de importación.
