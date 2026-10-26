---
name: mobile-expo-bare-suite
description: Governs the React Native and Expo Bare Workflow development lifecycle, native prebuild, Metro diagnostics, TypeScript/ESLint checks, testing strategy with Jest/RNTL, and native hardware mocks for HALO Mobile in mobile/.
---

# Mobile Expo Bare Suite — HALO (Urban Shield)

This skill governs the architecture, development lifecycle, native scaffolding, quality verification, automated testing, and OpenSpec workflows for the **HALO Mobile** application located in `mobile/`.

---

## 1. Dual OpenSpec Architecture & Working Directory

This monorepo utilizes **two independent OpenSpec roots**:
1. **Root OpenSpec (`openspec/`)**: Governs backend, frontend, prediction service, and master system contracts.
2. **Mobile OpenSpec (`mobile/openspec/`)**: Governs the mobile citizen application, its active changes (e.g. `mobile-foundation`, `mobile-auth-navigation`), and mobile-specific tasks.

### Crucial Execution Rule
To interact with mobile specifications, **always switch to the `mobile/` directory**:
```powershell
cd mobile
openspec doctor    # Must confirm Location ends with \mobile
openspec list      # Lists mobile changes
openspec validate --all
cd ..
```
Never execute unscoped OpenSpec commands from the repository root when intending to interact with mobile specifications, as the CLI will resolve the root OpenSpec instead.

---

## 2. React Native & TypeScript Conventions

### 2.1 Language and Compilation Rules
- **TypeScript Strict Mode**: Configured in `mobile/tsconfig.json` extending `expo/tsconfig.base`. Never use `any`; use strictly typed interfaces and union types for navigation routes, API models, and store states.
- **Component Architecture**: Functional components with `React.FC<Props>` or explicit prop types.
- **Hooks over Classes**: Use custom hooks (`useAuth`, `useReports`, `useWebSocket`, `useLocation`) to encapsulate asynchronous workflows and domain logic.
- **Directory Structure (`mobile/src/`)**:
  ```
  mobile/src/
  ├── api/             # Axios client, interceptors, endpoints, error mappers
  ├── assets/          # Icons, splash images, brand assets
  ├── components/      # Reusable UI components (Button, Input, Card, Modal, MapMarker)
  ├── constants/       # Colors, layout dimensions, theme constants, categories
  ├── context/         # React Context providers (AuthContext, ThemeContext)
  ├── hooks/           # Custom domain and hardware hooks
  ├── navigation/      # RootNavigator, AuthStack, MainTabs, type declarations
  ├── screens/         # Screen components (Auth, Dashboard, Reports, Chat, Profile)
  ├── services/        # Hardware services (location, storage, notifications, offline)
  ├── store/           # Zustand stores for global client state
  ├── types/           # Global TypeScript definitions and navigation route params
  └── utils/           # Formatters, date helpers, sanitizers
  ```

---

## 3. Expo Bare Workflow & Native Lifecycle

### 3.1 Continuous Native Generation (CNG)
UrbanShield Mobile follows the **Expo Bare Workflow with Continuous Native Generation**:
- App configuration is authoritatively defined in `mobile/app.json`.
- Native code in `mobile/android/` and `mobile/ios/` is generated via `npx expo prebuild`.
- Native plugins (such as `react-native-maps`, `expo-location`, `expo-image-picker`) must be declared in `app.json` under `plugins` with their respective native permissions.

### 3.2 Prebuild Command Runbook
```powershell
cd mobile
# Generate/regenerate native Android scaffolding cleanly without re-running npm install
npx expo prebuild --clean --no-install
```
*Note for Windows*: Prebuild on Windows generates `android/`. iOS native project generation is automatically skipped by Expo CLI on non-macOS systems and is handled in CI or macOS environments.

---

## 4. Diagnostics: Metro Bundler & Native Modules

### 4.1 Metro Diagnostics & Cache Clearing
If Metro exhibits stale bundling, missing modules, or module resolution errors:
```powershell
cd mobile
# Start Metro with a clean cache
npx expo start -c

# Export verification to test bundling without interactive prompts
npx expo export --platform android --output-dir dist_verify
Remove-Item -Recurse -Force dist_verify
```

### 4.2 Native Module Autolinking Inspection
To inspect which native libraries are discovered by the Expo autolinking system:
```powershell
cd mobile
npx expo-modules-autolinking resolve -p android
```

---

## 5. Quality, Type-Checking & Formatting Runbooks

Always run these three commands before declaring any mobile task ready:

```powershell
cd mobile

# 1. Strict TypeScript check (zero errors allowed)
npx tsc --noEmit

# 2. ESLint verification (adheres to eslint-config-expo)
npm run lint

# 3. Prettier check (ensures style compliance)
npx prettier --check "**/*.{js,jsx,ts,tsx,json,md}"

cd ..
```

To automatically fix formatting or autofixable lint issues:
```powershell
cd mobile
npm run format
npm run lint:fix
cd ..
```

---

## 6. Testing Strategy: Jest, RNTL & Native Hardware Mocks

### 6.1 Testing Stack
- **Test Runner**: Jest (`jest-expo` preset)
- **Component Testing**: `@testing-library/react-native` (RNTL)
- **Hook Testing**: `renderHook` from `@testing-library/react-native`

### 6.2 Standard Hardware Mocks
When writing unit and integration tests, never access real native hardware. Use the standard mock definitions located in `mobile/src/__mocks__/`:

#### Mock: `expo-secure-store`
```typescript
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => null),
  setItemAsync: jest.fn(async (key: string, value: string) => Promise.resolve()),
  deleteItemAsync: jest.fn(async (key: string) => Promise.resolve()),
}));
```

#### Mock: `expo-location`
```typescript
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: {
      latitude: -16.5000,
      longitude: -68.1500,
      altitude: 3600,
      accuracy: 5,
    },
    timestamp: Date.now(),
  })),
  Accuracy: { Highest: 6 },
}));
```

#### Mock: `@react-native-community/netinfo`
```typescript
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(async () => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
  addEventListener: jest.fn(() => jest.fn()),
}));
```

#### Mock: `expo-notifications`
```typescript
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(async () => ({ data: 'ExponentPushToken[mock-token-123]' })),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));
```

---

## 7. Network Integration & Resilience Strategy

### 7.1 HTTP Client & Token Refresh Flow
- Use an Axios instance configured with `baseURL` pointing to AWS API Gateway.
- Request Interceptor: Reads `accessToken` from `expo-secure-store` and attaches `Authorization: Bearer <token>`.
- Response Interceptor: Catches `401 Unauthorized`. If a 401 occurs, it enqueues pending requests, uses `refreshToken` to call `POST /api/auth/refresh`, updates `expo-secure-store`, and retries the failed requests. If refresh fails, it clears tokens and redirects to Login.

### 7.2 WebSocket Client & Reconnection Backoff
- Native `WebSocket` client connecting to `WSS_URL/?token=<jwt>`.
- Heartbeat ping-pong every 30 seconds.
- Exponential backoff reconnection with jitter (1s, 2s, 4s, 8s, up to 30s) on unexpected disconnection.
- Network state listener via NetInfo: triggers immediate reconnect when device recovers internet connectivity.

---

## 8. Verification Tier Matrix: Execution Realities

To ensure technical honesty and prevent false test reports, every verification must be classified into one of the following 5 tiers:

| Tier | Verification Method | Capability & Scope | Host Environment Reality |
|---|---|---|---|
| **Tier 1: Static** | `npx tsc --noEmit`<br>`npm run lint` | Syntax, type safety, interface contracts, and ESLint rule adherence. | Fully executable on any machine with Node.js. |
| **Tier 2: Bundle** | `npx expo export --platform android` | Metro dependency graph resolution, asset linkage, and Hermes bytecode emission. | Fully executable locally; guarantees JS bundle integrity without native compilation. |
| **Tier 3: Prebuild** | `npx expo prebuild --clean --no-install` | Generation of native project manifests, gradle scripts, and native folder structure. | Executable on Windows for Android; iOS requires macOS. |
| **Tier 4: Native Build** | `./gradlew assembleRelease`<br>`eas build --platform android` | Full Java/Kotlin/C++ native compilation into an APK / AAB. | Requires JDK 17 (Host has Java 25) and Android SDK. Run via EAS Build or in Docker/CI. |
| **Tier 5: Runtime** | Physical Device (Expo Go / APK)<br>Android Emulator (AVD) | Visual UI rendering, gestures, camera hardware, GPS chip, and OS notifications. | Requires physical device scanning Metro QR code, or local AVD emulator with ADB. |

> [!IMPORTANT]
> Never claim a Tier 4 or Tier 5 verification has passed unless an actual native build was performed or a device/emulator was physically driven and logged. For local CI without Android SDK, Tier 1, 2, and 3 provide 100% verifiable proof of code validity.
