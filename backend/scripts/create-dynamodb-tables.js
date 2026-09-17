const { CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { getDynamoDbClient } = require('../src/aws/clients');
const { TABLE_SCHEMAS } = require('../src/database/tableDefinitions');

async function createTables() {
  const client = getDynamoDbClient();
  for (const [key, def] of Object.entries(TABLE_SCHEMAS)) {
    const params = {
      TableName: def.TableName,
      AttributeDefinitions: def.AttributeDefinitions,
      KeySchema: def.KeySchema,
      BillingMode: 'PAY_PER_REQUEST',
    };

    if (def.GlobalSecondaryIndexes) {
      params.GlobalSecondaryIndexes = def.GlobalSecondaryIndexes.map((gsi) => ({
        IndexName: gsi.IndexName,
        KeySchema: gsi.KeySchema,
        Projection: gsi.Projection,
        // PAY_PER_REQUEST doesn't require ProvisionedThroughput
      }));
    }

    try {
      console.log(`Creating table ${def.TableName}...`);
      const cmd = new CreateTableCommand(params);
      const res = await client.send(cmd);
      console.log(`CreateTable initiated for ${def.TableName}:`, res.TableDescription?.TableStatus || 'CREATING');
    } catch (err) {
      console.error(`Failed to create table ${def.TableName}:`, err.message);
    }
  }
}

createTables().then(() => console.log('Done')).catch((e) => { console.error(e); process.exit(1); });
