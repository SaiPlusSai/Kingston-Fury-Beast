# Tareas de Implementación: Historial y Detalle de Reportes (Sprint 5)

Todas las tareas corresponden al Sprint 5 y se encuentran en estado planificado (`- [ ]`), pendientes de aprobación para su implementación.

---

## Fase 1: Listado, Paginación y Filtros

- [ ] **T-MOB-5.1:** Implementar el hook `useMyReports.ts` con soporte para paginación por cursor DynamoDB, pull-to-refresh y filtrado local/remoto.
  - **Verificación:** Prueba unitaria con Axios Mock valida la acumulación de páginas y la recarga limpia.

- [ ] **T-MOB-5.2:** Implementar el componente de filtros `FilterBar.tsx` con chips interactivos de selección múltiple por estado y categoría.
  - **Verificación:** Prueba de componente en RNTL confirma la activación visual y emisión del evento de filtrado.

- [ ] **T-MOB-5.3:** Implementar `MyReportsScreen.tsx` integrando `FlatList` optimizado y el componente `ReportCard.tsx`.
  - **Verificación:** `npm run lint` y `npx tsc --noEmit` validan la lista sin violaciones de rendimiento o tipos.

## Fase 2: Vista de Detalle y Timeline

- [ ] **T-MOB-5.4:** Implementar el componente cronológico `ActivityTimeline.tsx` que traduce los eventos de auditoría y cambios de estado en un árbol visual vertical.
  - **Verificación:** Prueba unitaria valida el formateo de fechas relativas y descripciones de las autoridades.

- [ ] **T-MOB-5.5:** Implementar el carrusel de fotos `PhotoGallery.tsx` con soporte para gestos táctiles y visor de imagen a pantalla completa con zoom.
  - **Verificación:** Prueba de componente confirma la apertura del modal al presionar una imagen.

- [ ] **T-MOB-5.6:** Integrar la pantalla `ReportDetailScreen.tsx` conectada a `GET /api/reports/:id` con acciones de interacción y compartición.
  - **Verificación:** `npx expo export --platform android` valida el empaquetado del bundle sin fallos de dependencias.
