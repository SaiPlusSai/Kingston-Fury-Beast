---
name: mobile-expo-bare-suite
description: Manages the React Native and Expo Bare Workflow development lifecycle, Metro bundler diagnostics, TypeScript checks, and prebuild verification. Use when working on mobile app setup, native scaffolding, or running checks in mobile/.
---

# Mobile Expo Bare Suite — HALO (Urban Shield)

This skill governs the development lifecycle, native scaffolding, quality verification, and OpenSpec workflows for the **HALO Mobile** application located in `mobile/`.

---

## 1. Dual OpenSpec Architecture & Working Directory

This monorepo utilizes **two independent OpenSpec roots**:
1. **Root OpenSpec (`openspec/`)**: Governs backend, frontend, prediction service, and master system contracts.
2. **Mobile OpenSpec (`mobile/openspec/`)**: Governs the mobile citizen application, its changes (`mobile-foundation`), and mobile-specific tasks.

### Crucial Execution Rule
To interact with mobile specifications, **always switch to the `mobile/` directory**:
```powershell
cd mobile
openspec doctor    # Must confirm Location ends with \mobile
openspec list      # Must list mobile changes (e.g. mobile-foundation)
openspec validate --all
cd ..
```

---

## 2. Sprint 1 Scope & Operational Runbooks

### Runbook 1: TypeScript Strict Type-Checking
Ensures that all components, hooks, and types strictly compile:
```powershell
cd mobile
npx tsc --noEmit
```
If errors occur, verify that `tsconfig.json` correctly extends `expo/tsconfig.base` and that all imported modules have corresponding type definitions.

### Runbook 2: Code Quality and Linting
Runs ESLint with Expo's recommended rules and Prettier:
```powershell
cd mobile
npm run lint       # Runs eslint . --ext .js,.jsx,.ts,.tsx
npm run format     # Runs prettier --write .
```

### Runbook 3: Metro Bundler Export Verification
Validates that Metro resolves all modules, assets, and entry points into a production bundle without launching an interactive UI:
```powershell
cd mobile
npx expo export --platform android --output-dir dist_test
# Clean up temporary test bundle directory after verification
Remove-Item -Recurse -Force dist_test
```

### Runbook 4: Bare Workflow / Prebuild Scaffolding
Generates and verifies the native `android/` and `ios/` project directories from `app.json`:
```powershell
cd mobile
npx expo prebuild --clean --no-install
```
Verify that `mobile/android/` contains `build.gradle`, `settings.gradle`, and `app/src/main/AndroidManifest.xml`, and that `mobile/ios/` contains `Podfile`.

---

## 3. Environment & Hardware Constraints

- **Host Environment**: The Windows host runs Java 25 and lacks local Android SDK / ADB.
- **Local Native Compilations (`./gradlew`)**: Do NOT attempt to run `npx expo run:android` locally, as Gradle 8.6 does not support Java 25.
- **Device Testing**: Instruct developers to test visual features using **Expo Go** on a physical mobile device scanning the Metro QR code (`npm start`), or compile standalone APKs via **EAS Build** in the cloud.
