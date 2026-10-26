# HALO Mobile (Urban Shield)

Subproyecto móvil multiplataforma (Android e iOS) para la plataforma inteligente de gestión de emergencias e incidentes urbanos HALO.

## Arquitectura y Stack

- **Framework**: React Native 0.74.5 con Expo SDK 51 (~51.0.38)
- **Workflow**: Expo Bare Workflow (Continuous Native Generation)
- **Lenguaje**: TypeScript 5.3+ (modo estricto)
- **Tooling**: ESLint, Prettier, Metro Bundler

## Especificaciones y OpenSpec

Este subproyecto mantiene su propia raíz de OpenSpec en `mobile/openspec/`.
Para ejecutar comandos de OpenSpec sobre el proyecto móvil:

```powershell
cd mobile
openspec status --change mobile-foundation
openspec validate --all
```

## Scripts Operativos

- `npm start`: Inicia el empaquetador Metro para desarrollo con Expo Go.
- `npm run type-check`: Comprueba la validez estática de tipos con `tsc --noEmit`.
- `npm run lint`: Ejecuta el análisis estático de código con ESLint.
- `npm run format`: Formatea el código con Prettier.
- `npm run prebuild`: Genera/actualiza las carpetas nativas `android/` e `ios/`.
