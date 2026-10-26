# Diseño Técnico: Dashboard Ciudadano y Mapa de Incidentes (Sprint 3)

## 1. Arquitectura de Componentes de la Pantalla Principal

```
HomeScreen (Layout Vertical con Scroll)
├── Header (Logotipo HALO + Saludo al Usuario + Badge Notificaciones)
├── MapContainer (60% de viewport en modo estándar)
│   ├── MapView (react-native-maps / Google Maps Provider en Android)
│   ├── UserLocationMarker (Punto azul con radio de precisión)
│   ├── IncidentMarkers (Marcadores vectoriales coloreados por severidad)
│   └── QuickReportFAB (Botón flotante absoluto sobre la esquina inferior derecha)
├── SummaryCardsCarousel (ScrollView horizontal)
│   ├── ActiveUserReportsCard
│   ├── NearbyIncidentsTodayCard
│   └── EmergencyAlertsCard
└── RecentIncidentsList (Lista vertical con cálculo de distancia haversine)
```

---

## 2. Decisiones Arquitectónicas Locales

### ADR-MOB-006: Estrategia de Renderizado de Mapas Nativos
- **Contexto**: Se requiere renderizado fluido a 60 FPS en Android e iOS sin dependencias de WebView que consuman batería y memoria excesivas.
- **Decisión**: Utilizar `react-native-maps` configurando `PROVIDER_GOOGLE` en Android y el mapa estándar de MapKit en iOS.
- **Consecuencias**: Requiere configurar la clave de Google Maps SDK en `app.json` bajo `android.config.googleMaps.apiKey`. Para pruebas locales y CI, se usa un mock de `react-native-maps`.

### ADR-MOB-007: Fallback de Coordenadas Urbanas
- **Contexto**: Cuando el usuario revoca o deniega permisos de GPS, la app no debe crashear ni mostrar una pantalla en blanco (RNF-MOB-021).
- **Decisión**: Definir una constante `DEFAULT_CITY_COORDINATES` (centro cívico de la ciudad) hacia la cual el mapa transiciona suavemente, permitiendo navegar visualmente los incidentes.

---

## 3. Plugins de Expo y Permisos en `app.json`

Se declaran los permisos de geolocalización en primer plano en `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "HALO necesita tu ubicación para mostrar incidentes cercanos y reportar emergencias."
        }
      ]
    ]
  }
}
```

---

## 4. Estrategia de Pruebas y Validación

1. **Pruebas Unitarias (Jest)**:
   - Utilidad de cálculo de distancia entre coordenadas (Haversine formula).
   - Hook `useNearbyReports` simulando respuestas del backend y estados de carga (skeletons).
2. **Pruebas de Componentes (RNTL)**:
   - Renderizado de `HomeScreen` con mock de `expo-location` y mock de `react-native-maps`.
   - Verificación de que el FAB redirige al flujo de creación de reportes.
3. **Validación Estática y de Empaquetado**:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npx expo export --platform android`
