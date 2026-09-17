# ADR-007 — Ecosistema de Clientes: React 19 SPA para Web y React Native con Expo para Movil

## Estado
**Aceptado**

## Contexto
UrbanShield requiere presencia tanto en terminales de escritorio institucionales (centros de comando, monitoreo de autoridades y gestion de reportes) como en dispositivos moviles ciudadanos en la via publica (reporte in-situ con GPS, camara y notificaciones push).

## Problema
Como maximizar la reutilizacion de codigo, habilidades del equipo y contratos de API entre la aplicacion web y la aplicacion movil sin duplicar esfuerzos ni sacrificar acceso a hardware nativo?

## Decisión
Mantener el Frontend Web como una SPA en React 19 + Vite + MapLibre GL JS, y desarrollar la App Movil en React Native utilizando Expo (Bare Workflow / Prebuild). Ambos clientes compartiran exactamente los mismos contratos REST y WebSocket del backend.

## Justificación técnica
1. Transferencia Directa de Conocimiento: El equipo domina React y JavaScript moderno. React Native permite aprovechar esta curva de aprendizaje sin necesidad de capacitarse en Dart (Flutter) o Swift/Kotlin nativos.\n2. Expo Prebuild / Bare Workflow: Provee la comodidad y velocidad de desarrollo de Expo (EAS Build, hot reloading) permitiendo al mismo tiempo inyectar librerias nativas con codigo Java/Obj-C como react-native-maps y geolocalizacion en background.\n3. Reutilizacion de Logica de Dominio: Los clientes de API (Axios/fetch), formateadores de fechas, validadores de formularios y esquemas de datos son compartibles entre web y movil.\n4. Despliegue Web Estatico de Bajo Costo: El frontend web compilado con Vite se aloja en S3 + CloudFront por menos de  USD/mes.

## Alternativas consideradas
- Alternativa 1: Flutter. Descartada porque requeriria que todo el equipo aprendiese Dart y reescribiera modelos y servicios en un semestre academico ya ajustado.\n- Alternativa 2: Desarrollo Nativo Separado (Kotlin + Swift). Descartada por exigir duplicar el esfuerzo de desarrollo y mantenimiento con un equipo de 4 personas.\n- Alternativa 3: PWA (Progressive Web App). Descartada debido a limitaciones severas de acceso a camara de alta resolucion, notificaciones push en iOS y precision de GPS en background.

## Consecuencias positivas
- Consistencia visual y funcional total entre plataformas.\n- Un solo backend para atender a todos los clientes.\n- Experiencia nativa real y fluida para el ciudadano en su smartphone.

## Consecuencias negativas
- Necesidad de mantener dos repositorios de frontend (frontend_urbanshield y mobile_urbanshield).\n- Configuracion de certificados de firma y empaquetado para Google Play Store y Apple App Store.

## Riesgos
- Desincronizacion en la version de contratos de API consumidos por web y movil.

## Mitigaciones
- Mantener la especificacion OpenAPI (openapi.yaml) en el backend como unica fuente de verdad y versionar los endpoints (/api/v1/).

## Componentes afectados
frontend_urbanshield, nuevo repositorio mobile_urbanshield, contratos de API en backend.
