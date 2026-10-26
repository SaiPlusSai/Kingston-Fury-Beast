# Propuesta: Historial de Reportes, Filtros y Detalle con Timeline (Sprint 5)

## 1. Alcance del Sprint

Este cambio aborda la implementación de las pantallas de consulta y seguimiento de reportes creados por el ciudadano (**MyReportsScreen** y **ReportDetailScreen**), cubriendo la tarea **T-5.5** del plan maestro y los requerimientos funcionales **RF-MOB-009** y **RF-MOB-010**.

### Componentes Incluidos
- **Historial de Reportes (`MyReportsScreen`)**:
  - Lista paginada con scroll infinito (20 items por lote).
  - Mecanismo pull-to-refresh para sincronización manual inmediata.
  - Filtros combinables por estado (Pendiente, En Progreso, Resuelto, Cerrado), categoría y ventana de tiempo.
  - Tarjetas de reporte con thumbnail de evidencia, badges de estado, fecha relativa y distancia.
- **Detalle de Incidente (`ReportDetailScreen`)**:
  - Header con identificador de reporte y estado oficial.
  - Mini-mapa interactivo centrado en el punto geográfico del incidente.
  - Carrusel multimedia con soporte para gestos táctiles de zoom y pan.
  - **Timeline de Actividad**: Trazabilidad cronológica de cambios de estado, asignación de autoridades y comentarios institucionales.
  - Acciones del ciudadano: Añadir comentarios adicionales, adjuntar más evidencia y enlace para compartir.

### Exclusiones de este Sprint
- Notificaciones push en tiempo real ante cambios de estado (Sprint 7).
- Flujo de conversación asistida por chatbot (Sprint 6).

---

## 2. Dependencias y Módulos a Incorporar

| Módulo / Paquete | Versión Compatible (Expo SDK 51) | Propósito |
|---|---|---|
| `react-native-gesture-handler` | `~2.16.1` | Gestos nativos fluidos para carrusel y zoom |
| `react-native-reanimated` | `~3.10.1` | Animaciones fluidas para timeline y transiciones |

---

## 3. Trazabilidad con Contratos del Backend (OpenSpec Raíz)

La aplicación consumirá:
- `GET /api/reports`: Consulta paginada de reportes del usuario (`?limit=20&lastKey=...`).
- `GET /api/reports/:id`: Consulta detallada del reporte incluyendo el array de logs en `activityLog`.
- `POST /api/reports/:id/vote`: Registro de validación comunitaria.
