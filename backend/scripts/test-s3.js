const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { awsInfrastructure, getAwsClientConfig } = require('../src/config/aws');

const s3Client = new S3Client(getAwsClientConfig());

async function testPut() {
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: awsInfrastructure.s3.bucketName,
      Key: 'test.txt',
      Body: 'test',
    }));
    console.log('Upload successful');
  } catch (err) {
    console.error('Upload failed:', err.message);
  }
}
testPut();
