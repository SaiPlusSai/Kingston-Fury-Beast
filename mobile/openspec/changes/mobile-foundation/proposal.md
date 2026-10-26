# Propuesta: Inicialización de Infraestructura Base de HALO Mobile (Sprint 1)

## 1. Contexto y Motivación

HALO (Urban Shield) cuenta con una arquitectura de backend serverless y una aplicación web operativa en el monorepo `Kingston-Fury-Beast`. La expansión v2 incorpora una aplicación móvil nativa multiplataforma (Android/iOS) para ciudadanos, ubicada en el subdirectorio autónomo `mobile/`.

Esta propuesta formaliza la creación de la infraestructura base del proyecto móvil para el **Sprint 1**, estableciendo las herramientas de calidad, el entorno de desarrollo y el andamiaje nativo Bare Workflow requerido por ClickUp y el ADR-003 del diseño general.

### Trazabilidad con la Raíz
- **Origen**: Este cambio materializa la tarea `T-0.2` definida en el OpenSpec de la raíz (`openspec/changes/halo-v2-expansion/tasks.md`).
- **Autoridad de Arquitectura**: Los contratos de API, especificaciones globales de incidentes y protocolos WebSocket continúan bajo la autoridad de la raíz (`openspec/specs/` y `docs/Arquitectura y Seguridad/`). `mobile/` consume dichos contratos sin redefinirlos.

## 2. Alcance (Sprint 1)

### 2.1 En Alcance
1. Inicialización del paquete móvil en `mobile/` con Expo SDK 51 (`~51.0.38`), React Native `0.74.5` y React `18.2.0`.
2. Configuración de TypeScript en modo estricto (`tsconfig.json`).
3. Herramientas de calidad estática: ESLint (`eslint-config-expo`), Prettier y `.gitignore`.
4. Configuración de `app.json` con metadatos del proyecto (`com.kingstonfurybeast.halo`).
5. Andamiaje nativo Bare Workflow mediante Expo Prebuild (generación controlada de `android/` e `ios/`).
6. Scripts en `package.json` para linting, verificación de tipos y arranque de Metro.
7. Verificación de arranque y resolución del bundle JavaScript mediante Metro Bundler.

### 2.2 Fuera de Alcance (Pospuesto a Sprints 2 y 3)
- Pantallas funcionales de login, registro, dashboard, reportes, chat y perfil.
- Configuración de React Navigation (`@react-navigation/*`).
- Integración de mapas (`react-native-maps`) y geolocalización en tiempo real (`expo-location`).
- Captura de fotos con cámara (`expo-image-picker`) y subida a S3.
- Notificaciones push (`expo-notifications`).
- Estado global (`zustand`) y almacenamiento seguro (`expo-secure-store`).
- Sincronización offline con AsyncStorage y NetInfo.

## 3. Criterios de Éxito

1. `npx tsc --noEmit` ejecuta dentro de `mobile/` sin errores de compilación ni tipos no resueltos.
2. `npm run lint` valida el código fuente sin violaciones de reglas ESLint.
3. `npx expo export --platform android` genera el bundle JavaScript de producción sin errores de resolución de módulos.
4. `openspec validate --all` ejecutado desde `mobile/` valida al 100% el cambio `mobile-foundation`.
5. La estructura nativa `android/` e `ios/` queda generada y alineada con los requerimientos de Expo Bare Workflow.

## 4. Dependencias

- **Node.js**: `v20.20.2` (verificado en el entorno).
- **npm**: `10.8.2` (gestor del proyecto).
- **OpenSpec CLI**: `1.15.0`.
