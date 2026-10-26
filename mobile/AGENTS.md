# AI Agent Instructions — HALO Mobile (Urban Shield)

Welcome to the **HALO Mobile** subproject. You are operating as an expert React Native and mobile systems architect for the Kingston Fury Beast team. These instructions govern all development, linting, and specification workflows within `mobile/`.

---

## 1. Subproject Overview & Architecture

**HALO Mobile** is the citizen mobile application for the HALO platform, built with **React Native** and **Expo (Bare Workflow)**.

### Tech Stack

- **Framework**: React Native 0.74.5 / Expo SDK 51 (~51.0.38)
- **Language**: TypeScript 5.3+ (strict mode enabled)
- **Workflow**: Expo Bare Workflow (Continuous Native Generation via `expo prebuild`)
- **Package Manager**: `npm` (independent `mobile/package.json` and `mobile/node_modules/`)
- **API Communication**: Consumes the serverless backend via AWS API Gateway HTTP and WebSocket API

---

## 2. Dedicated OpenSpec Root for Mobile

The mobile application maintains its **own independent OpenSpec root** located at:
`mobile/openspec/`

### Important Rule for AI Agents

When executing any OpenSpec command regarding mobile changes, tasks, or specifications, **you MUST ensure the working directory is `mobile/`**:

```powershell
# From repo root:
cd mobile; openspec status --change mobile-foundation
cd mobile; openspec validate --all

# Or if already inside mobile/:
openspec status --change mobile-foundation
openspec validate --all
```

Never execute unscoped OpenSpec commands from the repository root when intending to interact with mobile specifications, as the CLI will resolve the root OpenSpec instead.

---

## 3. Sprint 1 Scope & Quality Guardrails

1. **Strict Sprint 1 Scope**:
   - Only foundational infrastructure: TypeScript (`tsconfig.json`), ESLint (`.eslintrc.cjs`), Prettier (`.prettierrc`), `.gitignore`, `App.tsx`, `index.js`, and native scaffolding (`android/`, `ios/`).
   - **DO NOT** install or implement functional packages for future sprints (no `@react-navigation/*`, no `react-native-maps`, no `expo-location`, no `expo-image-picker`, no `expo-notifications`, no `zustand`).
2. **Quality & Validation Commands**:
   - Type-checking: `npx tsc --noEmit`
   - Linting: `npm run lint`
   - Metro bundling verification: `npx expo export --platform android`
3. **Environment Constraints**:
   - The host machine has Java 25 and lacks local Android SDK.
   - Do NOT run or claim fulfillment of local Android emulator builds (`npx expo run:android`).
   - Validate execution through Metro Bundler export and bundle integrity.
