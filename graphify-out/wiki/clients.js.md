# clients.js

> 39 nodes

## Key Concepts

- **clients.js** (38 connections) — `backend/src/aws/clients.js`
- **diagnostics.js** (29 connections) — `backend/src/startup/diagnostics.js`
- **getAwsClientConfig()** (11 connections) — `backend/src/config/aws.js`
- **create-dynamodb-tables.js** (9 connections) — `backend/scripts/create-dynamodb-tables.js`
- **getS3Client()** (8 connections) — `backend/src/aws/clients.js`
- **getDynamoDbClient()** (7 connections) — `backend/src/aws/clients.js`
- **runDiagnostics()** (7 connections) — `backend/src/startup/diagnostics.js`
- **getCognitoClient()** (6 connections) — `backend/src/aws/clients.js`
- **getLocationClient()** (6 connections) — `backend/src/aws/clients.js`
- **getSnsClient()** (6 connections) — `backend/src/aws/clients.js`
- **getDynamoDbClientConfig()** (4 connections) — `backend/src/config/aws.js`
- **checkCognito()** (3 connections) — `backend/src/startup/diagnostics.js`
- **checkDynamo()** (3 connections) — `backend/src/startup/diagnostics.js`
- **checkLocation()** (3 connections) — `backend/src/startup/diagnostics.js`
- **checkS3()** (3 connections) — `backend/src/startup/diagnostics.js`
- **checkSns()** (3 connections) — `backend/src/startup/diagnostics.js`
- **createTables()** (2 connections) — `backend/scripts/create-dynamodb-tables.js`
- **.constructor()** (2 connections) — `backend/src/aws/cognito.service.js`
- **.constructor()** (2 connections) — `backend/src/aws/s3.service.js`
- **.constructor()** (2 connections) — `backend/src/aws/sns.service.js`
- **backend_src_database_tabledefinitions_table_schemas** (2 connections)
- **{ CreateTableCommand }** (1 connections) — `backend/scripts/create-dynamodb-tables.js`
- **{ getDynamoDbClient }** (1 connections) — `backend/scripts/create-dynamodb-tables.js`
- **{ TABLE_SCHEMAS }** (1 connections) — `backend/scripts/create-dynamodb-tables.js`
- **{
  CognitoIdentityProviderClient,
}** (1 connections) — `backend/src/aws/clients.js`
- *... and 14 more nodes in this community*

## Relationships

- [aws.js](aws.js.md) (11 shared connections)
- [getDynamoDbDocClient](getDynamoDbDocClient.md) (6 shared connections)
- [aws/location.service.js](aws-location.service.js.md) (5 shared connections)
- [sns.service.js](sns.service.js.md) (5 shared connections)
- [awsInfrastructure](awsInfrastructure.md) (5 shared connections)
- [AppError.js](AppError.js.md) (3 shared connections)
- [upload.service.js](upload.service.js.md) (3 shared connections)
- [s3.service.js](s3.service.js.md) (3 shared connections)
- [@aws-sdk/client-cognito-identity-provider](@aws-sdk-client-cognito-identity-provider.md) (3 shared connections)
- [server.js](server.js.md) (3 shared connections)
- [connect.js](connect.js.md) (2 shared connections)
- [handleMessage.js](handleMessage.js.md) (2 shared connections)

## Source Files

- `backend/scripts/create-dynamodb-tables.js`
- `backend/src/aws/clients.js`
- `backend/src/aws/cognito.service.js`
- `backend/src/aws/s3.service.js`
- `backend/src/aws/sns.service.js`
- `backend/src/config/aws.js`
- `backend/src/startup/diagnostics.js`

## Audit Trail

- EXTRACTED: 104 (92%)
- INFERRED: 9 (8%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*