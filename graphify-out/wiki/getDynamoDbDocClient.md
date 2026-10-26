# getDynamoDbDocClient

> 20 nodes

## Key Concepts

- **getDynamoDbDocClient()** (19 connections) — `backend/src/aws/clients.js`
- **disconnect.js** (11 connections) — `backend/src/websocket/disconnect.js`
- **faqHandler.js** (11 connections) — `backend/src/websocket/handlers/faqHandler.js`
- **statusHandler.js** (10 connections) — `backend/src/websocket/handlers/statusHandler.js`
- **@aws-sdk/lib-dynamodb** (9 connections) — `backend/package.json`
- **handler()** (3 connections) — `backend/src/websocket/disconnect.js`
- **removeConnection()** (3 connections) — `backend/src/websocket/disconnect.js`
- **.constructor()** (2 connections) — `backend/src/aws/dynamodb.service.js`
- **faqHandler()** (2 connections) — `backend/src/websocket/handlers/faqHandler.js`
- **statusHandler()** (2 connections) — `backend/src/websocket/handlers/statusHandler.js`
- **{ DeleteCommand }** (1 connections) — `backend/src/websocket/disconnect.js`
- **{ env }** (1 connections) — `backend/src/websocket/disconnect.js`
- **{ getDynamoDbDocClient }** (1 connections) — `backend/src/websocket/disconnect.js`
- **DEFAULT_FAQS** (1 connections) — `backend/src/websocket/handlers/faqHandler.js`
- **{ env }** (1 connections) — `backend/src/websocket/handlers/faqHandler.js`
- **{ getDynamoDbDocClient }** (1 connections) — `backend/src/websocket/handlers/faqHandler.js`
- **{ ScanCommand }** (1 connections) — `backend/src/websocket/handlers/faqHandler.js`
- **{ env }** (1 connections) — `backend/src/websocket/handlers/statusHandler.js`
- **{ GetCommand, QueryCommand }** (1 connections) — `backend/src/websocket/handlers/statusHandler.js`
- **{ getDynamoDbDocClient }** (1 connections) — `backend/src/websocket/handlers/statusHandler.js`

## Relationships

- [clients.js](clients.js.md) (6 shared connections)
- [stateMachine.js](stateMachine.js.md) (6 shared connections)
- [env.js](env.js.md) (6 shared connections)
- [connect.js](connect.js.md) (5 shared connections)
- [handleMessage.js](handleMessage.js.md) (5 shared connections)
- [AppError.js](AppError.js.md) (3 shared connections)
- [backend/package.json](backend-package.json.md) (1 shared connections)

## Source Files

- `backend/package.json`
- `backend/src/aws/clients.js`
- `backend/src/aws/dynamodb.service.js`
- `backend/src/websocket/disconnect.js`
- `backend/src/websocket/handlers/faqHandler.js`
- `backend/src/websocket/handlers/statusHandler.js`

## Audit Trail

- EXTRACTED: 56 (98%)
- INFERRED: 1 (2%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*