const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { getAwsClientConfig } = require('../src/config/aws');

const client = new DynamoDBClient(getAwsClientConfig());

async function checkTables() {
  try {
    const data = await client.send(new ListTablesCommand({}));
    console.log('Tables:', data.TableNames);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
checkTables();
