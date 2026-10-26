# Tareas de Implementación: Creación de Reportes y Multimedia (Sprint 4)

Todas las tareas corresponden al Sprint 4 y se encuentran en estado planificado (`- [ ]`), pendientes de aprobación para su implementación.

---

## Fase 1: Servicios Multimedia y Subida a S3

- [ ] **T-MOB-4.1:** Configurar `expo-image-picker` y `expo-image-manipulator` en `mobile/app.json` declarando permisos de cámara y galería.
  - **Verificación:** `npx expo config --type public` valida los permisos nativos configurados.

- [ ] **T-MOB-4.2:** Implementar el servicio `mediaService.ts` para captura de fotos, compresión a < 1MB y redimensionamiento inteligente.
  - **Verificación:** Prueba unitaria con mock de `expo-image-picker` valida el procesamiento y retorno de URIs de archivos locales.

- [ ] **T-MOB-4.3:** Implementar el cliente de carga `s3Uploader.ts` que solicita pre-signed URLs contra `POST /api/uploads/presigned-url` y ejecuta la subida PUT a S3 con reporte de progreso.
  - **Verificación:** Prueba unitaria con Axios Mock verifica la obtención de la URL y la subida binaria.

## Fase 2: Componentes del Formulario de Reporte

- [ ] **T-MOB-4.4:** Implementar el selector interactivo de categorías `CategorySelector.tsx` con soporte para las 7 categorías oficiales y estados accesibles.
  - **Verificación:** Prueba de componente en RNTL verifica la selección de categoría y actualización de estilos.

- [ ] **T-MOB-4.5:** Implementar el mini-mapa interactivo `LocationPicker.tsx` con pin arrastrable y actualización reactiva de coordenadas.
  - **Verificación:** `npx tsc --noEmit` valida los tipos de coordenadas y la interfaz de cambio de posición.

- [ ] **T-MOB-4.6:** Implementar el carrusel de evidencia fotográfica `EvidenceAttachments.tsx` con previsualizaciones, barra de progreso y botón de eliminación.
  - **Verificación:** Prueba de RNTL verifica que se respeta el límite máximo de 3 imágenes adjuntas.

## Fase 3: Integración de Pantalla y Envío

- [ ] **T-MOB-4.7:** Integrar `CreateReportScreen.tsx` orquestando validación de campos, subida de fotos y persistencia en `POST /api/reports`.
  - **Verificación:** `npx expo export --platform android` empaqueta la pantalla de creación sin errores de compilación ni librerías faltantes.
