## Purpose

Especificar los requerimientos de consulta, filtrado, paginación y visualización detallada con timeline de incidentes reportados por los ciudadanos en HALO Mobile.

## ADDED Requirements

### Requirement: RF-MOB-009 - Lista de Reportes del Usuario

La app móvil SHALL listar todos los incidentes creados por el ciudadano autenticado, permitiendo aplicar filtros por categoría y estado, y recargar datos mediante pull-to-refresh y scroll infinito.

#### Scenario: Carga y paginación de reportes
- **WHEN** el ciudadano ingresa a "Mis Reportes" y se desplaza hacia el final de la lista
- **THEN** la app solicita el siguiente lote de 20 reportes usando paginación por cursor y los concatena fluidamente sin saltos visuales

#### Scenario: Filtrado en tiempo real
- **WHEN** el usuario selecciona el filtro de estado "En Progreso"
- **THEN** la lista se actualiza inmediatamente mostrando únicamente los reportes que coincidan con dicho estado

#### Scenario: Actualización manual con pull-to-refresh
- **WHEN** el usuario tira de la lista hacia abajo
- **THEN** se refresca el primer lote de datos desde el backend y se oculta el indicador de recarga al finalizar

### Requirement: RF-MOB-010 - Detalle de Reporte y Timeline

La app móvil SHALL presentar una vista detallada de cualquier incidente, visualizando su ubicación en mapa, fotos adjuntas, información descriptiva y una línea de tiempo cronológica con todas las actualizaciones de las autoridades.

#### Scenario: Visualización del timeline cronológico
- **WHEN** el usuario abre el detalle de un reporte con historial de investigación
- **THEN** se renderizan en orden temporal los hitos de creación, asignación de personal y cambios de estado con fecha y descripción de la acción

#### Scenario: Visualización y zoom de evidencia fotográfica
- **WHEN** el ciudadano toca una fotografía en el carrusel de evidencia
- **THEN** se abre el visor a pantalla completa con soporte de zoom táctil (pinch-to-zoom)
