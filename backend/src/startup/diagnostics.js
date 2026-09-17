const { getDynamoDbClient, getS3Client, getSnsClient, getCognitoClient, getLocationClient } = require('../aws/clients');
const { ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { HeadBucketCommand } = require('@aws-sdk/client-s3');
const { ListTopicsCommand } = require('@aws-sdk/client-sns');
const { DescribeUserPoolCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { GetMapTileCommand } = require('@aws-sdk/client-location');
const { awsInfrastructure } = require('../config/aws');
const logger = require('../utils/logger');

async function checkDynamo() {
  try {
    const client = getDynamoDbClient();
    await client.send(new ListTablesCommand({ Limit: 1 }));
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

async function checkS3() {
  if (!awsInfrastructure.s3.bucketName) return { ok: false, message: 'S3_BUCKET_NAME not configured' };
  try {
    const client = getS3Client();
    await client.send(new HeadBucketCommand({ Bucket: awsInfrastructure.s3.bucketName }));
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

async function checkSns() {
  try {
    const client = getSnsClient();
    await client.send(new ListTopicsCommand({}));
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

async function checkCognito() {
  if (!awsInfrastructure.cognito.userPoolId) return { ok: false, message: 'COGNITO_USER_POOL_ID not configured' };
  try {
    const client = getCognitoClient();
    await client.send(new DescribeUserPoolCommand({ UserPoolId: awsInfrastructure.cognito.userPoolId }));
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

async function checkLocation() {
  if (!awsInfrastructure.location.mapName && !awsInfrastructure.location.placeIndex) return { ok: false, message: 'LOCATION_MAP_NAME and LOCATION_PLACE_INDEX not configured' };
  try {
    const client = getLocationClient();
    // try a harmless GetMapTile if mapName exists
    if (awsInfrastructure.location.mapName) {
      try {
        await client.send(new GetMapTileCommand({ MapName: awsInfrastructure.location.mapName, Z: 0, X: 0, Y: 0 }));
        return { ok: true };
      } catch (err) {
        return { ok: false, message: `Map access failed: ${err.message}` };
      }
    }
    return { ok: false, message: 'Map name not configured' };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

async function runDiagnostics() {
  logger.info('Running AWS diagnostics...');
  const results = {};

  results.dynamo = await checkDynamo();
  results.s3 = await checkS3();
  results.sns = await checkSns();
  results.cognito = await checkCognito();
  results.location = await checkLocation();

  logger.info('Diagnostics results:', results);

  // Summarize and return
  const summary = Object.entries(results).map(([k, v]) => ({ service: k, ok: !!v.ok, message: v.message || null }));
  return summary;
}

module.exports = { runDiagnostics };
