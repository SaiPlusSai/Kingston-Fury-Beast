---
name: backend-test-suite
description: Executes and diagnoses backend unit tests, WebSocket test suites, state machine verification, and handler diagnostics. Use whenever backend code or websocket handlers are modified.
---

# Backend Test Suite Runner — HALO

This skill provides step-by-step procedures to run, debug, and validate backend tests in the Express + Serverless environment.

## Available Test Suites

### 1. WebSocket Complete Test Suite
The WebSocket test suite tests the 4 core pillars of the HALO real-time communication channel:

```powershell
cd backend
npm run test:websocket
```

This runs:
1. `src/websocket/intentDetector.test.js`: Verifies intent classification (`greeting`, `help`, `faq`, `status`, `create`, `unknown`) against benchmark phrases. Requires >= 85% accuracy.
2. `src/websocket/stateMachine.test.js`: Simulates complete conversation lifecycle (`ASK_CATEGORY` -> `ASK_DESCRIPTION` -> `ASK_LOCATION` -> `ASK_PHOTO` -> `CONFIRM` -> `DONE`).
3. `src/websocket/connection.test.js`: Tests `$connect` and `$disconnect` handlers, JWT query parameter extraction, and DynamoDB connection tracking.
4. `src/websocket/heartbeat.test.js`: Tests keepalive/heartbeat (`ping`/`pong`) mechanisms to prevent API Gateway 10-minute idle connection termination without querying DynamoDB.

### 2. Running Individual WebSocket Tests
When working on a single module:
```powershell
cd backend
node src/websocket/intentDetector.test.js
node src/websocket/stateMachine.test.js
node src/websocket/connection.test.js
node src/websocket/heartbeat.test.js
```

## Diagnostic Checklist

If tests fail:
- Ensure dependencies are installed (`npm ci` in `backend`).
- For DynamoDB errors in local runs, verify that AWS SDK clients are mocked properly or LocalStack is initialized.
- Verify JWT mock payloads contain required claims: `userId`, `email`, `role`, and unexpired `exp`.
