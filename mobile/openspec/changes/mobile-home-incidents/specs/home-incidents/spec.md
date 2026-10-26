## Purpose

Especificar los requerimientos de la pantalla principal del ciudadano en HALO Mobile, incluyendo la geolocalización, el mapa interactivo de incidentes y la visualización de resúmenes urbanos.

## ADDED Requirements

### Requirement: RF-MOB-006 - Pantalla Principal (HomeScreen y Dashboard)

La app móvil SHALL mostrar un mapa interactivo a pantalla parcial centrado en la ubicación actual del ciudadano, con marcadores de incidentes cercanos, tarjetas de resumen cuantitativo y una lista de los últimos incidentes en su zona.

#### Scenario: Carga inicial con permisos de ubicación concedidos
- **WHEN** el ciudadano ingresa a la HomeScreen y autoriza el acceso a la ubicación
- **THEN** la app obtiene las coordenadas actuales con alta precisión, centra el mapa en su posición y carga los incidentes en un radio de 5 km en menos de 3 segundos

#### Scenario: Permisos de ubicación denegados
- **WHEN** el ciudadano rechaza la solicitud de permisos de GPS
- **THEN** la app centra el mapa en la coordenada urbana predeterminada (centro de la ciudad) y muestra un banner amigable invitando a habilitar la ubicación para ver incidentes cercanos

#### Scenario: Interacción con marcadores en el mapa
- **WHEN** el usuario presiona un marcador de incidente en el mapa
- **THEN** se despliega una tarjeta de información previa (callout) indicando la categoría, título y distancia estimada

#### Scenario: Acceso rápido a creación vía FAB
- **WHEN** el usuario presiona el Botón Flotante de Acción Rápida (FAB)
- **THEN** la aplicación navega directamente a la pestaña o modal de Creación de Reporte precargando las coordenadas actuales
