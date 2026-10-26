## Purpose

Definir los requerimientos funcionales y escenarios de prueba para la captura de evidencia, georreferenciación y creación formal de reportes de incidentes por parte de los ciudadanos en HALO Mobile.

## ADDED Requirements

### Requirement: RF-MOB-008 - Formulario de Creación de Reporte

La app móvil SHALL proveer un formulario estructurado para registrar incidentes urbanos, integrando cámara, georreferenciación precisa con pin editable y carga de evidencia a Amazon S3.

#### Scenario: Creación completa de reporte con foto y GPS
- **WHEN** el ciudadano selecciona una categoría, ingresa descripción válida, captura una foto con la cámara y presiona "Enviar Reporte"
- **THEN** la app comprime la foto, obtiene una pre-signed URL, sube el archivo a S3 y persiste el reporte en `POST /api/reports`, mostrando la pantalla de confirmación con el ID generado

#### Scenario: Ajuste manual de ubicación en mini-mapa
- **WHEN** el ciudadano arrastra el pin del mini-mapa hacia una esquina diferente
- **THEN** las coordenadas del reporte se actualizan inmediatamente con la nueva posición geográfica seleccionada

#### Scenario: Validación de campos obligatorios incompletos
- **WHEN** el usuario intenta enviar un reporte con una descripción menor a 20 caracteres o sin seleccionar categoría
- **THEN** el sistema resalta los campos faltantes con alertas visuales accesibles y previene el envío

#### Scenario: Cancelación o eliminación de evidencia adjunta
- **WHEN** el usuario toca el botón de eliminar (X) sobre una de las miniaturas de fotos capturadas
- **THEN** la foto se descarta de la lista de subida y se libera la referencia de memoria local
