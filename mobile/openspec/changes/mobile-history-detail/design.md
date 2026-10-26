# Diseño Técnico: Historial y Detalle de Reportes (Sprint 5)

## 1. Arquitectura de Pantallas y Componentes

```
MyReportsScreen
├── FilterBar (Chips horizontales para Estado y Categoría)
└── FlatList (Optimizado con keyExtractor, getItemLayout y onEndReached)
    ├── ReportCard (Thumbnail, Título, Badge de Estado, Distancia y Fecha)
    └── ListFooterComponent (ActivityIndicator en carga de siguiente página)

ReportDetailScreen (ScrollView con navegación Stack)
├── StatusHeader (Badge de estado oficial e ID de caso)
├── IncidentSummary (Categoría, descripción completa, nivel de urgencia)
├── StaticMapView (Mini-mapa no interactivo con pin centrado en el incidente)
├── PhotoCarousel (Carrusel horizontal con modal de zoom pantalla completa)
├── ActivityTimeline (Componente vertical de hitos con timestamps formateados)
└── ActionButtons (Acciones de interacción ciudadana)
```

---

## 2. Decisiones Arquitectónicas Locales

### ADR-MOB-009: Paginación Basada en Cursor de DynamoDB
- **Contexto**: El backend DynamoDB utiliza claves de evaluación exclusiva (`ExclusiveStartKey`/`LastEvaluatedKey`) en lugar de offsets numéricos.
- **Decisión**: El hook `useMyReports` almacena en memoria el cursor de la última página recibida y lo transmite como parámetro `lastKey` en la siguiente llamada a la API.

---

## 3. Estrategia de Pruebas y Validación

1. **Pruebas Unitarias (Jest)**:
   - Hook `useMyReports` simulando concatenación de páginas y reinicio tras pull-to-refresh.
   - Formateador cronológico del timeline de actividad.
2. **Pruebas de Componentes (RNTL)**:
   - Renderizado de lista de tarjetas y respuesta al evento `onEndReached`.
   - Renderizado de `ReportDetailScreen` y verificación de nodos del timeline.
3. **Validación Estática y de Empaquetado**:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npx expo export --platform android`
