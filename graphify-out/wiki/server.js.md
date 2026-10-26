# server.js

> 12 nodes

## Key Concepts

- **server.js** (13 connections) — `backend/src/server.js`
- **logger.js** (13 connections) — `backend/src/utils/logger.js`
- **startServer()** (3 connections) — `backend/src/server.js`
- **gracefulShutdown()** (1 connections) — `backend/src/server.js`
- **formatMessage()** (1 connections) — `backend/src/utils/logger.js`
- **app** (1 connections) — `backend/src/server.js`
- **{ env }** (1 connections) — `backend/src/server.js`
- **logger** (1 connections) — `backend/src/server.js`
- **{ runDiagnostics }** (1 connections) — `backend/src/server.js`
- **server** (1 connections) — `backend/src/server.js`
- **{ env }** (1 connections) — `backend/src/utils/logger.js`
- **logger** (1 connections) — `backend/src/utils/logger.js`

## Relationships

- [env.js](env.js.md) (4 shared connections)
- [clients.js](clients.js.md) (3 shared connections)
- [AppError.js](AppError.js.md) (2 shared connections)
- [app.js](app.js.md) (1 shared connections)
- [aws/location.service.js](aws-location.service.js.md) (1 shared connections)
- [s3.service.js](s3.service.js.md) (1 shared connections)
- [sns.service.js](sns.service.js.md) (1 shared connections)
- [error.middleware.js](error.middleware.js.md) (1 shared connections)

## Source Files

- `backend/src/server.js`
- `backend/src/utils/logger.js`

## Audit Trail

- EXTRACTED: 26 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*