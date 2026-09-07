const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
const { awsInfrastructure, getAwsClientConfig } = require('../src/config/aws');

const s3Client = new S3Client(getAwsClientConfig());

const corsRules = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['PUT', 'POST', 'GET', 'HEAD'],
      AllowedOrigins: ['http://localhost:5173', 'http://127.0.0.1:5173', '*'],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3600,
    },
  ],
};

async function fixCors() {
  const buckets = [
    awsInfrastructure.s3.bucketName,
    awsInfrastructure.s3.profileBucketName,
  ].filter(Boolean);

  if (buckets.length === 0) {
    console.log('No S3 buckets configured in environment variables.');
    return;
  }

  for (const bucket of buckets) {
    console.log(`Setting CORS for bucket: ${bucket}...`);
    try {
      await s3Client.send(
        new PutBucketCorsCommand({
          Bucket: bucket,
          CORSConfiguration: corsRules,
        })
      );
      console.log(`✅ CORS successfully updated for ${bucket}`);
    } catch (err) {
      console.error(`❌ Failed to update CORS for ${bucket}:`, err.message);
    }
  }
}

fixCors();
