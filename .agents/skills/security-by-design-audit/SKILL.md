---
name: security-by-design-audit
description: Audits code, IAM policies, environment configurations, and inputs against HALO's Security by Design guidelines. Use to check for secrets, unvalidated endpoints, insecure DynamoDB calls, or missing authentication.
---

# Security by Design Audit — HALO

This skill provides an automated and manual security verification checklist aligned with [docs/Arquitectura y Seguridad/Seguridad/Analisis-Security-by-Design.md](file:///c:/Users/Viviana/Documents/GitHub/Kingston-Fury-Beast-/docs/Arquitectura%20y%20Seguridad/Seguridad/Analisis-Security-by-Design.md).

## Critical Security Principles

1. **Zero Secrets in Code**:
   - Never commit API keys, AWS credentials, JWT secrets, or DB passwords.
   - Use `.env.example` as a template; runtime secrets must be loaded via AWS Systems Manager Parameter Store or local `.env` (gitignored).

2. **Authentication & Authorization**:
   - Every protected route must use `authenticateJwt` middleware (`src/middlewares/auth.middleware.js`).
   - Every WebSocket connection in `$connect` must validate the incoming Cognito JWT via JWKS.
   - User ownership verification: Citizens may only view/modify their own reports; Admins must possess `role: "admin"` in their JWT claims.

3. **Input Validation & Sanitization**:
   - All HTTP request bodies, params, and queries must be validated with Joi schemas (`src/validators/`).
   - String inputs must be sanitized using `src/utils/sanitize.js` to prevent XSS and parameter pollution.

4. **DynamoDB Injection Prevention**:
   - Never concatenate raw user input into `KeyConditionExpression` or `FilterExpression`.
   - Always use `ExpressionAttributeNames` and `ExpressionAttributeValues` with the AWS DocumentClient.

5. **API Abuse Prevention**:
   - Rate limiting is configured via `express-rate-limit` (standard limit: 100 requests per 15 minutes per IP; chat limit: 30 requests per minute).
   - Helmet security headers and CORS whitelisting must be active in `src/app.js`.

## Audit Command Patterns

Check for potential leaked secrets or credentials:
```powershell
git grep -i "secret" -- ":!*.example" ":!*.md"
git grep -i "AKIA" -- ":!*.example"
```
Check for missing Joi validator on routes:
Inspect route files in `backend/src/routes/` and verify every mutation endpoint (`POST`, `PUT`, `PATCH`, `DELETE`) includes validation middleware.
