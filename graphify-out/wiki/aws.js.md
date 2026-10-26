# aws.js

> 29 nodes

## Key Concepts

- **aws.js** (29 connections) — `backend/src/config/aws.js`
- **init-localstack.js** (11 connections) — `backend/scripts/init-localstack.js`
- **database.js** (10 connections) — `backend/src/config/database.js`
- **test-create-table.js** (8 connections) — `backend/scripts/test-create-table.js`
- **test-ddb.js** (7 connections) — `backend/scripts/test-ddb.js`
- **@aws-sdk/client-dynamodb** (7 connections) — `backend/package.json`
- **tableDefinitions.js** (5 connections) — `backend/src/database/tableDefinitions.js`
- **tableSchemas** (3 connections) — `backend/src/config/aws.js`
- **globalSecondaryIndexes** (2 connections) — `backend/src/config/aws.js`
- **tableNames** (2 connections) — `backend/src/config/aws.js`
- **initLocalStack()** (1 connections) — `backend/scripts/init-localstack.js`
- **createTable()** (1 connections) — `backend/scripts/test-create-table.js`
- **checkTables()** (1 connections) — `backend/scripts/test-ddb.js`
- **hasAwsCredentials()** (1 connections) — `backend/src/config/aws.js`
- **credentials** (1 connections) — `backend/scripts/init-localstack.js`
- **ddbClient** (1 connections) — `backend/scripts/init-localstack.js`
- **{ DynamoDBClient, CreateTableCommand, ListTablesCommand }** (1 connections) — `backend/scripts/init-localstack.js`
- **s3Client** (1 connections) — `backend/scripts/init-localstack.js`
- **{ S3Client, CreateBucketCommand, ListBucketsCommand }** (1 connections) — `backend/scripts/init-localstack.js`
- **{ TABLE_SCHEMAS }** (1 connections) — `backend/scripts/init-localstack.js`
- **client** (1 connections) — `backend/scripts/test-create-table.js`
- **{ DynamoDBClient, CreateTableCommand }** (1 connections) — `backend/scripts/test-create-table.js`
- **{ getAwsClientConfig, tableSchemas }** (1 connections) — `backend/scripts/test-create-table.js`
- **client** (1 connections) — `backend/scripts/test-ddb.js`
- **{ DynamoDBClient, ListTablesCommand }** (1 connections) — `backend/scripts/test-ddb.js`
- *... and 4 more nodes in this community*

## Relationships

- [clients.js](clients.js.md) (11 shared connections)
- [awsInfrastructure](awsInfrastructure.md) (4 shared connections)
- [env.js](env.js.md) (4 shared connections)
- [auth.middleware.js](auth.middleware.js.md) (2 shared connections)
- [AppError.js](AppError.js.md) (1 shared connections)
- [aws/location.service.js](aws-location.service.js.md) (1 shared connections)
- [s3.service.js](s3.service.js.md) (1 shared connections)
- [sns.service.js](sns.service.js.md) (1 shared connections)
- [auth.service.js](auth.service.js.md) (1 shared connections)
- [upload.service.js](upload.service.js.md) (1 shared connections)
- [BadRequestError](BadRequestError.md) (1 shared connections)
- [connect.js](connect.js.md) (1 shared connections)

## Source Files

- `backend/package.json`
- `backend/scripts/init-localstack.js`
- `backend/scripts/test-create-table.js`
- `backend/scripts/test-ddb.js`
- `backend/src/config/aws.js`
- `backend/src/config/database.js`
- `backend/src/database/tableDefinitions.js`

## Audit Trail

- EXTRACTED: 65 (94%)
- INFERRED: 4 (6%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*