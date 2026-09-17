const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { getAwsClientConfig, tableSchemas } = require('../src/config/aws');

const client = new DynamoDBClient(getAwsClientConfig());

async function createTable() {
  try {
    const params = {
      ...tableSchemas.supportMessages,
      BillingMode: 'PAY_PER_REQUEST',
    };
    await client.send(new CreateTableCommand(params));
    console.log('Table created');
  } catch (err) {
    console.error('Error creating table:', err.message);
  }
}
createTable();
