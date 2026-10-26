---
name: localstack-aws-runner
description: Manages the local AWS emulation environment using LocalStack and Docker Compose. Use when running tests locally without AWS credentials, seeding DynamoDB tables, or testing S3/SNS integration.
---

# LocalStack AWS Emulation Runner — HALO

This skill provides procedures for initializing, inspecting, and managing the local AWS emulation stack using LocalStack.

## Configuration Files

- Docker Compose configuration: `docker-compose.localstack.yml`
- Initial bash resource script: `localstack-init/01_init_resources.sh`
- Node.js initialization script: `backend/scripts/init-localstack.js`
- LocalStack guide: [docs/localstack_guia.md](file:///c:/Users/Viviana/Documents/GitHub/Kingston-Fury-Beast-/docs/localstack_guia.md)

## Emulated AWS Services

| Service | Local Endpoint | Port | Purpose in HALO |
|---|---|---|---|
| DynamoDB | `http://localhost:4566` | 4566 | All tables (`ReportsTable`, `UsersTable`, `WebSocketConnectionsTable`, etc.) |
| S3 | `http://localhost:4566` | 4566 | Evidence photo uploads (`halo-evidence-bucket`) |
| SNS | `http://localhost:4566` | 4566 | Critical emergency broadcasts |
| STS | `http://localhost:4566` | 4566 | Local mock credential provider |

## Lifecycle Commands

1. **Start LocalStack** (requires Docker running):
   ```powershell
   npm run localstack:up --prefix backend
   # Or directly:
   docker compose -f docker-compose.localstack.yml up -d
   ```

2. **Wait for Health Check**:
   ```powershell
   curl http://localhost:4566/_localstack/health
   ```

3. **Initialize Tables & Resources**:
   ```powershell
   npm run localstack:init --prefix backend
   ```

4. **Stop LocalStack**:
   ```powershell
   npm run localstack:down --prefix backend
   ```

## Local Development Fallback

When Docker is unavailable on the local machine:
- The backend supports offline/mock mode via `src/aws/clients.js` and dedicated unit tests with internal client mocks (e.g. `npm run test:websocket`).
- Environment variables in `backend/.env` can point to AWS dev sandbox credentials when LocalStack cannot be spawned locally.
