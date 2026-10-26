# AuthService

> 30 nodes

## Key Concepts

- **AuthService** (18 connections) — `backend/src/services/auth.service.js`
- **.refreshToken()** (17 connections) — `backend/src/services/auth.service.js`
- **.register()** (11 connections) — `backend/src/services/auth.service.js`
- **.login()** (7 connections) — `backend/src/services/auth.service.js`
- **.resetPassword()** (7 connections) — `backend/src/services/auth.service.js`
- **generateActivityId()** (6 connections) — `backend/src/helpers/idHelper.js`
- **toPublicUser()** (6 connections) — `backend/src/models/user.model.js`
- **._generateTokens()** (6 connections) — `backend/src/services/auth.service.js`
- **._logActivity()** (6 connections) — `backend/src/services/auth.service.js`
- **ConflictError** (5 connections) — `backend/src/errors/AppError.js`
- **.forgotPassword()** (5 connections) — `backend/src/services/auth.service.js`
- **Tareas de Implementación: Autenticación y Navegación (Sprint 2)** (4 connections) — `mobile/openspec/changes/mobile-auth-navigation/tasks.md`
- **createUserEntity()** (3 connections) — `backend/src/models/user.model.js`
- **.logout()** (3 connections) — `backend/src/services/auth.service.js`
- **._storeRefreshToken()** (3 connections) — `backend/src/services/auth.service.js`
- **signPasswordResetToken()** (3 connections) — `backend/src/utils/jwt.js`
- **user.model.js** (3 connections) — `backend/src/models/user.model.js`
- **Requirement: RF-MOB-004 - Renovación Automática de Token** (3 connections) — `mobile/openspec/changes/mobile-auth-navigation/specs/auth-navigation/spec.md`
- **._getPasswordResetToken()** (2 connections) — `backend/src/services/auth.service.js`
- **._getRefreshToken()** (2 connections) — `backend/src/services/auth.service.js`
- **._removePasswordResetToken()** (2 connections) — `backend/src/services/auth.service.js`
- **._removeRefreshToken()** (2 connections) — `backend/src/services/auth.service.js`
- **._storePasswordResetToken()** (2 connections) — `backend/src/services/auth.service.js`
- **Scenario: Expiración definitiva de sesión** (2 connections) — `mobile/openspec/changes/mobile-auth-navigation/specs/auth-navigation/spec.md`
- **Scenario: Renovación transparente exitosa** (2 connections) — `mobile/openspec/changes/mobile-auth-navigation/specs/auth-navigation/spec.md`
- *... and 5 more nodes in this community*

## Relationships

- [auth.service.js](auth.service.js.md) (18 shared connections)
- [support.service.js](support.service.js.md) (4 shared connections)
- [idHelper.js](idHelper.js.md) (3 shared connections)
- [nowISO](nowISO.md) (3 shared connections)
- [AppError.js](AppError.js.md) (2 shared connections)
- [report.service.js](report.service.js.md) (2 shared connections)
- [Propuesta: Autenticación, Sesión Segura y Navegación Principal (Sprint 2)](Propuesta-_Autenticación,_Sesión_Segura_y_Navegación_Principal_Sprint_2.md) (2 shared connections)
- [ADDED Requirements](ADDED_Requirements.md) (2 shared connections)
- [connect.js](connect.js.md) (1 shared connections)
- [@aws-sdk/client-cognito-identity-provider](@aws-sdk-client-cognito-identity-provider.md) (1 shared connections)
- [Mobile Expo Bare Suite — HALO (Urban Shield)](Mobile_Expo_Bare_Suite_—_HALO_Urban_Shield.md) (1 shared connections)
- [Diseño Técnico: Autenticación, Sesión y Navegación (Sprint 2)](Diseño_Técnico-_Autenticación,_Sesión_y_Navegación_Sprint_2.md) (1 shared connections)

## Source Files

- `backend/src/errors/AppError.js`
- `backend/src/helpers/idHelper.js`
- `backend/src/models/user.model.js`
- `backend/src/services/auth.service.js`
- `backend/src/utils/jwt.js`
- `mobile/openspec/changes/mobile-auth-navigation/specs/auth-navigation/spec.md`
- `mobile/openspec/changes/mobile-auth-navigation/tasks.md`

## Audit Trail

- EXTRACTED: 77 (87%)
- INFERRED: 12 (13%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*