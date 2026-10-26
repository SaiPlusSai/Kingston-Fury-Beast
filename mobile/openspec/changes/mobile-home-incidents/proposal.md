# Propuesta: Dashboard Ciudadano, Geolocalización y Mapa de Incidentes (Sprint 3)

## 1. Alcance del Sprint

Este cambio aborda la implementación de la pantalla principal del ciudadano (**HomeScreen**), cubriendo la tarea **T-5.3** del plan maestro y el requerimiento funcional **RF-MOB-006**, junto con los requerimientos no funcionales de rendimiento y accesibilidad.

### Componentes Incluidos
- **Integración de Geolocalización (`expo-location`)**: Solicitud de permisos de ubicación en primer plano (`requestForegroundPermissionsAsync`), lectura de coordenadas con precisión alta y centrado dinámico del mapa.
- **Mapa Interactivo (`react-native-maps`)**: Renderizado de mapa nativo (Google Maps en Android, Apple Maps en iOS) con marcadores personalizados coloreados según la categoría del incidente y llamada callout al tocarlos.
- **Botón Flotante de Acción Rápida (FAB)**: Botón de acceso directo al flujo de reporte rápido posicionado en la esquina inferior derecha.
- **Tarjetas de Resumen**: Componente scrolleable horizontal que sintetiza los reportes activos del usuario, los incidentes en la zona y las alertas de emergencia.
- **Lista de Incidentes Recientes**: Feed vertical con los últimos incidentes en un radio de 5 km, mostrando categoría, título, distancia relativa calculada y tiempo transcurrido.

### Exclusiones de este Sprint
- Captura de fotos y envío de reportes desde el formulario (Sprint 4).
- Filtros avanzados y timeline de actividades detalladas (Sprint 5).

---

## 2. Dependencias y Módulos a Incorporar

| Módulo / Paquete | Versión Compatible (Expo SDK 51) | Propósito |
|---|---|---|
| `react-native-maps` | `1.14.0` | Renderizado nativo de mapas interactivos |
| `expo-location` | `~17.0.1` | Acceso al chip GPS y permisos de ubicación |
| `expo-image` | `~1.12.12` | Carga optimizada y caché de iconos y marcadores |

---

## 3. Trazabilidad con Contratos del Backend (OpenSpec Raíz)

La aplicación consumirá los siguientes endpoints:
- `GET /api/reports/nearby?lat={lat}&lon={lon}&radius={radius}`: Consulta de incidentes geolocalizados en el radio especificado.
- `GET /api/reports`: Consulta de reportes del propio usuario autenticado para computar el contador de reportes activos.
