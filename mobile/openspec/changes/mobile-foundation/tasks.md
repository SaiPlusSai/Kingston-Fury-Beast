# Tareas de Implementación: Infraestructura Base de HALO Mobile (Sprint 1)

Todas las tareas corresponden a la infraestructura mínima del Sprint 1 y deben ser completadas y verificadas antes de marcarse como concluidas.

---

## Fase 1: Scaffolding y Dependencias Base

- [x] **T-MOB-0.1:** Inicializar el manifiesto `mobile/package.json` con dependencias mínimas de Expo SDK 51, React Native 0.74.5, React 18.2.0 y scripts operativos (`start`, `android`, `ios`, `lint`, `format`, `type-check`).
  - **Verificación:** `npm install` ejecutado con éxito (código de salida 0), 197 paquetes resueltos y ejecutables vinculados en `node_modules/.bin`.

- [x] **T-MOB-0.2:** Configurar `mobile/tsconfig.json` con soporte para React Native, JSX y comprobación estricta de tipos.
  - **Verificación:** `npm run type-check` (`tsc --noEmit`) ejecutó con éxito (código de salida 0) sin errores de tipos.

## Fase 2: Configuración de Calidad y Metadatos

- [x] **T-MOB-0.3:** Configurar `.eslintrc.cjs`, `.prettierrc` y `.gitignore` dentro de `mobile/`.
  - **Verificación:** `npm run lint` ejecutó con éxito (código de salida 0) sin advertencias ni errores. `npm run format` formateó todos los archivos fuente bajo estándares Prettier.

- [x] **T-MOB-0.4:** Crear `mobile/app.json` con metadatos del proyecto (`name: "HALO Mobile"`, `slug: "halo-mobile"`, `package: "com.kingstonfurybeast.halo"`), iconos y splash.
  - **Verificación:** `npx expo config --type public` ejecutó con éxito (código de salida 0), validando `bundleIdentifier` y `package: com.kingstonfurybeast.halo`.

## Fase 3: Punto de Entrada y Empaquetado

- [x] **T-MOB-0.5:** Crear `mobile/index.js` y `mobile/App.tsx` con el componente raíz inicial de bienvenida.
  - **Verificación:** `npm run type-check` valida `App.tsx` y `index.js` con tipado estricto sin errores.

- [x] **T-MOB-0.6:** Verificar el empaquetador Metro y la generación del bundle JavaScript para la plataforma móvil.
  - **Verificación:** `npx expo export --platform android` generó exitosamente el bytecode Hermes (`index-*.hbc`, 1.49 MB) empaquetando 542 módulos con código de salida 0.

## Fase 4: Andamiaje Nativo (Bare Workflow)

- [x] **T-MOB-0.7:** Ejecutar `npx expo prebuild` en `mobile/` para generar las carpetas nativas `android/` e `ios/`.
  - **Verificación:** Carpeta nativa `mobile/android/` generada con `build.gradle`, `settings.gradle`, `gradlew` y estructura nativa Android. (Generación de iOS omitida por el CLI en Windows, reservada para entorno macOS/Linux según estándar de Expo).
