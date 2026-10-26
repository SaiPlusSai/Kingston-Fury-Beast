# Diseño Técnico: Infraestructura Base de HALO Mobile (Sprint 1)

## 1. Arquitectura de Directorios en `mobile/`

El subproyecto se organiza de forma autónoma dentro del monorepo, evitando dependencias circulares con `backend/` o `frontend/`:

```text
mobile/
├── android/                   # Andamiaje nativo Android (Bare Workflow / Prebuild)
├── ios/                       # Andamiaje nativo iOS (Bare Workflow / Prebuild)
├── assets/                    # Iconos y assets estáticos de Expo
├── openspec/                  # Raíz de especificaciones exclusiva de Mobile
│   ├── config.yaml
│   └── changes/mobile-foundation/
├── src/                       # Código fuente modular (expandible en Sprints 2 y 3)
│   └── types/                 # Tipos compartidos iniciales
├── .eslintrc.cjs              # Configuración ESLint (eslint-config-expo)
├── .gitignore                 # Exclusiones de Git
├── .prettierrc                # Configuración Prettier
├── AGENTS.md                  # Instrucciones locales para Antigravity
├── App.tsx                    # Componente raíz inicial
├── app.json                   # Configuración declarativa de Expo
├── babel.config.js            # Configuración Babel
├── index.js                   # Entry point con registerRootComponent
├── package.json               # Dependencias e infraestructura de scripts
└── tsconfig.json              # Configuración TypeScript
```

## 2. Decisiones Arquitectónicas (ADR Locales)

### ADR-MOB-001: Adopción de Expo SDK 51 sobre Expo SDK 52
- **Contexto**: Se requiere compatibilidad garantizada con los paquetes comunitarios planificados en la spec maestra (mapas, cámara, notificaciones) y con el entorno host actual (Node 20).
- **Decisión**: Utilizar Expo SDK 51 (`React Native 0.74.5`, `React 18.2.0`).
- **Justificación**: Mantiene la arquitectura estable (Old Architecture por defecto), evitando los riesgos de incompatibilidad de librerías nativas con TurboModules y Bridgeless que introduce SDK 52 por defecto en Windows.

### ADR-MOB-002: Expo Bare Workflow mediante Continuous Native Generation (Prebuild)
- **Contexto**: El requerimiento de ClickUp exige Expo Bare Workflow.
- **Decisión**: Generar y mantener las carpetas nativas `android/` e `ios/` mediante `npx expo prebuild`.
- **Justificación**: Cumple con el criterio de Bare Workflow dando acceso completo al código nativo Android e iOS, mientras preserva `app.json` como manifiesto centralizado para la regeneración limpia si fuera necesario.

### ADR-MOB-003: Paquete Autónomo en Monorepo
- **Contexto**: El repositorio contiene múltiples aplicaciones sin orquestador global de workspaces.
- **Decisión**: `mobile/` posee su propio `package.json`, su propio `node_modules/` y su propia suite de linters.
- **Justificación**: Evita conflictos entre las versiones de React (Web usa React 19.2, Mobile usa React 18.2).

## 3. Estrategia de Verificación en el Host

Dado que el host Windows dispone de **Java 25** (incompatible con Gradle 8.6 que requiere JDK 17) y carece de Android SDK local:
- Las pruebas de verificación técnica se basan en **validación estática estricta (TypeScript + ESLint)** y **generación determinística del bundle con Metro**.
- La ejecución en emulador físico o emulador AVD queda formalmente documentada como sujeta al uso de Expo Go en dispositivo móvil o builds en la nube mediante EAS Build.
