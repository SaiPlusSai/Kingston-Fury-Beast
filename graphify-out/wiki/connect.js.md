# connect.js

> 15 nodes

## Key Concepts

- **connect.js** (15 connections) — `backend/src/websocket/connect.js`
- **connection.test.js** (13 connections) — `backend/src/websocket/connection.test.js`
- **signAccessToken()** (5 connections) — `backend/src/utils/jwt.js`
- **handler()** (5 connections) — `backend/src/websocket/connect.js`
- **extractToken()** (4 connections) — `backend/src/websocket/connect.js`
- **runTests()** (4 connections) — `backend/src/websocket/connection.test.js`
- **assert()** (1 connections) — `backend/src/websocket/connection.test.js`
- **{ awsInfrastructure }** (1 connections) — `backend/src/websocket/connect.js`
- **{ env }** (1 connections) — `backend/src/websocket/connect.js`
- **{ getDynamoDbDocClient }** (1 connections) — `backend/src/websocket/connect.js`
- **{ PutCommand }** (1 connections) — `backend/src/websocket/connect.js`
- **clients** (1 connections) — `backend/src/websocket/connection.test.js`
- **{ extractToken, handler: connectHandler }** (1 connections) — `backend/src/websocket/connection.test.js`
- **{ handler: disconnectHandler }** (1 connections) — `backend/src/websocket/connection.test.js`
- **{ signAccessToken }** (1 connections) — `backend/src/websocket/connection.test.js`

## Relationships

- [getDynamoDbDocClient](getDynamoDbDocClient.md) (5 shared connections)
- [auth.service.js](auth.service.js.md) (3 shared connections)
- [auth.middleware.js](auth.middleware.js.md) (2 shared connections)
- [env.js](env.js.md) (2 shared connections)
- [clients.js](clients.js.md) (2 shared connections)
- [AuthService](AuthService.md) (1 shared connections)
- [awsInfrastructure](awsInfrastructure.md) (1 shared connections)
- [aws.js](aws.js.md) (1 shared connections)

## Source Files

- `backend/src/utils/jwt.js`
- `backend/src/websocket/connect.js`
- `backend/src/websocket/connection.test.js`

## Audit Trail

- EXTRACTED: 35 (97%)
- INFERRED: 1 (3%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*