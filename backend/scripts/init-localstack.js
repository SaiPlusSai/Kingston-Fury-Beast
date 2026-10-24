const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, CreateBucketCommand, ListBucketsCommand } = require('@aws-sdk/client-s3');
const { TABLE_SCHEMAS } = require('../src/database/tableDefinitions');

const LOCALSTACK_ENDPOINT = process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566';
const REGION = process.env.AWS_REGION || 'us-east-1';

const credentials = {
  accessKeyId: 'test',
  secretAccessKey: 'test',
};

const ddbClient = new DynamoDBClient({
  endpoint: LOCALSTACK_ENDPOINT,
  region: REGION,
  credentials,
});

const s3Client = new S3Client({
  endpoint: LOCALSTACK_ENDPOINT,
  region: REGION,
  credentials,
  forcePathStyle: true,
});

async function initLocalStack() {
  console.log(`=======================================================`);
  console.log(`Inicializando Recursos en LocalStack (${LOCALSTACK_ENDPOINT})`);
  console.log(`=======================================================\n`);

  // 1. Inicializar Tablas DynamoDB
  console.log('--- 1. Tablas DynamoDB ---');
  let existingTables = [];
  try {
    const listRes = await ddbClient.send(new ListTablesCommand({}));
    existingTables = listRes.TableNames || [];
  } catch (err) {
    console.warn('No se pudo listar tablas (¿LocalStack esta corriendo?):', err.message);
  }

  for (const [key, def] of Object.entries(TABLE_SCHEMAS)) {
    const tableName = def.TableName;
    if (existingTables.includes(tableName)) {
      console.log(`  [EXISTE] Tabla ${tableName}`);
      continue;
    }

    const params = {
      TableName: tableName,
      AttributeDefinitions: def.AttributeDefinitions,
      KeySchema: def.KeySchema,
      BillingMode: 'PAY_PER_REQUEST',
    };

    if (def.GlobalSecondaryIndexes) {
      params.GlobalSecondaryIndexes = def.GlobalSecondaryIndexes.map((gsi) => ({
        IndexName: gsi.IndexName,
        KeySchema: gsi.KeySchema,
        Projection: gsi.Projection,
      }));
    }

    try {
      await ddbClient.send(new CreateTableCommand(params));
      console.log(`  [CREADA] Tabla ${tableName}`);
    } catch (err) {
      console.error(`  [ERROR] Fallo al crear tabla ${tableName}:`, err.message);
    }
  }

  // 2. Inicializar Buckets S3
  console.log('\n--- 2. Buckets S3 ---');
  const bucketsToCreate = [
    'urbanshield-uploads-dev-local',
    'urbanshield-prediction-cache-local',
    'urbanshield-profile-photos-dev-local',
  ];

  let existingBuckets = [];
  try {
    const listB = await s3Client.send(new ListBucketsCommand({}));
    existingBuckets = (listB.Buckets || []).map((b) => b.Name);
  } catch (err) {
    console.warn('No se pudo listar buckets S3:', err.message);
  }

  for (const bucketName of bucketsToCreate) {
    if (existingBuckets.includes(bucketName)) {
      console.log(`  [EXISTE] Bucket s3://${bucketName}`);
      continue;
    }

    try {
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      console.log(`  [CREADO] Bucket s3://${bucketName}`);
    } catch (err) {
      console.error(`  [ERROR] Fallo al crear bucket ${bucketName}:`, err.message);
    }
  }

  console.log(`\n[OK] Inicializacion completada exitosamente.`);
}

if (require.main === module) {
  initLocalStack()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal initialization error:', err);
      process.exit(1);
    });
}

module.exports = { initLocalStack };
