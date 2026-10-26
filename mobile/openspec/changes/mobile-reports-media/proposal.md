# Propuesta: Creación de Reportes, Captura Multimedia y Evidencia en S3 (Sprint 4)

## 1. Alcance del Sprint

Este cambio aborda la implementación de la pantalla y el flujo de reporte ciudadano (**CreateReportScreen**), cubriendo la tarea **T-5.4** del plan maestro y el requerimiento funcional **RF-MOB-008**.

### Componentes Incluidos
- **Selector Visual de Categorías**: 7 categorías oficiales con paleta de colores institucional e iconografía accesible.
- **Campos de Texto y Validación**: Título (5 a 100 caracteres) y descripción detallada (20 a 1000 caracteres) con validación en tiempo real.
- **Geolocalización Asistida con Mini-Mapa**: Visualización de la ubicación actual con un marcador (pin) arrastrable para micro-ajustes manuales por parte del ciudadano.
- **Módulo de Evidencia Fotográfica (`expo-image-picker`)**:
  - Captura directa con la cámara del dispositivo (`launchCameraAsync`).
  - Selección desde la galería de imágenes (`launchImageLibraryAsync`).
  - Compresión automática en el cliente (calidad 0.7, resolución máxima 1920px, peso < 1MB).
  - Previsualización en miniaturas con opción de eliminación.
- **Carga Directa a Amazon S3 (ADR-009)**: Solicitud de pre-signed upload URLs contra `POST /api/uploads/presigned-url` y subida directa mediante petición HTTP PUT binaria sin transitar por la memoria de la función Lambda.
- **Selector de Urgencia y Parámetros Opcionales**: Niveles Bajo, Medio, Alto y Crítico; contador de personas afectadas y switch de anonimato.

### Exclusiones de este Sprint
- Modo de guardado offline y sincronización diferida (Sprint 7).
- Navegación al historial y detalle completo de actividades (Sprint 5).

---

## 2. Dependencias y Módulos a Incorporar

| Módulo / Paquete | Versión Compatible (Expo SDK 51) | Propósito |
|---|---|---|
| `expo-image-picker` | `~15.0.7` | Acceso a cámara y galería nativa del dispositivo |
| `expo-image-manipulator` | `~12.0.5` | Compresión, redimensionamiento y optimización de fotos |

---

## 3. Trazabilidad con Contratos del Backend (OpenSpec Raíz)

La aplicación consumirá:
- `POST /api/uploads/presigned-url`: Obtención de URL pre-firmada S3 con esquema `{ fileName, contentType, purpose: 'report' }`.
- `PUT {uploadUrl}`: Subida binaria del archivo a S3 con encabezado `Content-Type`.
- `POST /api/reports`: Registro formal del incidente con coordenadas, categoría, descripción y URLs de fotos adjuntas.
