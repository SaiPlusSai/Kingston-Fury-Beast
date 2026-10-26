## Purpose

Especificar los requisitos técnicos fundamentales de la infraestructura base, el andamiaje nativo Bare Workflow y las herramientas de calidad de HALO Mobile para el Sprint 1.

## ADDED Requirements

### Requirement: RF-MOB-CORE-001 - Estructura Base y Tooling TypeScript

El sistema SHALL proveer la estructura de proyecto móvil autónoma dentro de `mobile/` configurada con React Native 0.74.5, Expo SDK 51 y TypeScript en modo estricto.

- El archivo `tsconfig.json` debe extender la configuración base de Expo (`expo/tsconfig.base`) y habilitar comprobación estricta de tipos.
- El archivo `package.json` debe contener los scripts operativos: `start`, `android`, `ios`, `lint`, `format`, `type-check`.

#### Scenario: Compilación estricta de TypeScript sin errores
- **WHEN** el desarrollador o agente ejecuta `npx tsc --noEmit` en el subdirectorio `mobile/`
- **THEN** el compilador de TypeScript valida todos los tipos estáticos y finaliza con código de salida 0 sin advertencias ni errores.

### Requirement: RF-MOB-CORE-002 - Calidad Estática con ESLint, Prettier y Gitignore

El sistema SHALL implementar las reglas de estilo y análisis estático de código para React Native y Expo, asegurando la consistencia en el monorepo.

- Configuración de ESLint en `.eslintrc.cjs` utilizando `eslint-config-expo`.
- Configuración de formato en `.prettierrc` con indentación de 2 espacios, comillas simples y punto y coma.
- Archivo `.gitignore` con exclusiones de `node_modules/`, `.expo/`, carpetas de build y artefactos temporales.

#### Scenario: Validación estática de código sin infracciones
- **WHEN** se ejecuta `npm run lint` en `mobile/`
- **THEN** el analizador ESLint examina el código fuente y finaliza con 0 errores.

### Requirement: RF-MOB-CORE-003 - Empaquetado y Ejecución en Metro Bundler

El sistema SHALL permitir el arranque del empaquetador Metro y la resolución determinística del bundle JavaScript de la aplicación móvil.

- El punto de entrada `index.js` debe registrar el componente raíz `App.tsx` mediante `registerRootComponent`.
- El componente `App.tsx` debe renderizar la pantalla inicial de bienvenida con diseño adaptable.
- El empaquetador Metro debe compilar y exportar el bundle para Android sin fallos de importación.

#### Scenario: Generación exitosa del bundle JavaScript
- **WHEN** se ejecuta la exportación del bundle con `npx expo export --platform android`
- **THEN** Metro genera los artefactos de distribución y los assets estáticos sin excepciones de módulos no encontrados.

### Requirement: RF-MOB-CORE-004 - Soporte de Andamiaje Nativo (Expo Bare Workflow)

El sistema SHALL mantener la configuración de Expo en `app.json` configurada para permitir la generación del andamiaje nativo (`android/` e `ios/`) mediante Expo Prebuild (Continuous Native Generation).

- `app.json` debe definir `name`, `slug`, `version`, `orientation`, `icon`, `splash` y el identificador de paquete Android `com.kingstonfurybeast.halo`.
- El proyecto debe admitir la generación de carpetas nativas sin requerir herramientas propietarias externas.

#### Scenario: Verificación de metadatos y andamiaje nativo
- **WHEN** se examina la configuración en `app.json` y la estructura nativa generada por prebuild
- **THEN** se comprueba la presencia de las carpetas `android/` e `ios/` con sus respectivos manifiestos y archivos de configuración de compilación.
