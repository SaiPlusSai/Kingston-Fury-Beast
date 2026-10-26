# Tareas de Implementación: Dashboard y Mapa (Sprint 3)

Todas las tareas corresponden al Sprint 3 y se encuentran en estado planificado (`- [ ]`), pendientes de aprobación para su implementación.

---

## Fase 1: Geolocalización y Servicios de Mapas

- [ ] **T-MOB-3.1:** Configurar `expo-location` y `react-native-maps` en `mobile/app.json`, declarando permisos de ubicación en primer plano y claves de API necesarias.
  - **Verificación:** `npx expo config --type public` valida los plugins y permisos configurados sin errores.

- [ ] **T-MOB-3.2:** Implementar el hook `useUserLocation.ts` para solicitar permisos y obtener la posición actual con alta precisión, gestionando errores y coordenadas por defecto.
  - **Verificación:** Prueba unitaria con mock de `expo-location` valida el flujo de permisos concedidos y denegados.

## Fase 2: Componentes del Dashboard

- [ ] **T-MOB-3.3:** Implementar el componente `InteractiveMap.tsx` con `react-native-maps`, renderizando marcadores coloreados por categoría y el botón flotante FAB.
  - **Verificación:** `npx tsc --noEmit` y `npm run lint` validan la interfaz del mapa y los tipos de coordenadas.

- [ ] **T-MOB-3.4:** Implementar el carrusel de tarjetas de resumen `SummaryCards.tsx` con contadores de reportes activos, incidentes del día y alertas.
  - **Verificación:** Prueba de componente con React Native Testing Library confirma el renderizado correcto de estadísticas.

- [ ] **T-MOB-3.5:** Implementar el feed vertical `RecentIncidentsList.tsx` mostrando los 10 incidentes más cercanos con cálculo de distancia y tiempo transcurrido.
  - **Verificación:** Prueba unitaria verifica la ordenación por proximidad y el formateo de tiempo relativo.

## Fase 3: Integración de Pantalla Principal

- [ ] **T-MOB-3.6:** Integrar la pantalla completa `HomeScreen.tsx` conectada al hook `useNearbyReports` y los endpoints del backend (`GET /api/reports/nearby`).
  - **Verificación:** `npx expo export --platform android` empaqueta el bundle de la HomeScreen sin errores de dependencias nativas.
