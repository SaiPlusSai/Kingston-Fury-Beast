const { PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { getS3Client } = require('./clients');
const { awsInfrastructure } = require('../config/aws');
const { AppError } = require('../errors/AppError');
const { HTTP_STATUS } = require('../constants/httpStatus');
const logger = require('../utils/logger');

class S3Service {
  constructor() {
    this.client = getS3Client();
    this.reportBucket = awsInfrastructure.s3.bucketName;
    this.profileBucket = awsInfrastructure.s3.profileBucketName;
  }

  getBucketForPurpose(purpose = 'report') {
    return purpose === 'profile' ? this.profileBucket : this.reportBucket;
  }

  async getPresignedUploadUrl({ key, contentType, purpose = 'report' }) {
    try {
      const bucket = this.getBucketForPurpose(purpose);
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
      });
      const uploadUrl = await getSignedUrl(this.client, command, {
        expiresIn: awsInfrastructure.s3.presignedUrlExpiresIn,
      });
      const publicUrl = `https://${bucket}.s3.${awsInfrastructure.region}.amazonaws.com/${key}`;
      return { uploadUrl, publicUrl, key, expiresIn: awsInfrastructure.s3.presignedUrlExpiresIn };
    } catch (error) {
      logger.error('S3 presigned URL generation failed', { error: error.message });
      throw new AppError('Failed to generate upload URL', HTTP_STATUS.SERVICE_UNAVAILABLE, 'AWS_SERVICE_ERROR');
    }
  }

  async deleteObject(key) {
    try {
      const bucket = key.startsWith('profiles/') ? this.profileBucket : this.reportBucket;
      await this.client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    } catch (error) {
      logger.warn('S3 delete failed', { key, error: error.message });
    }
  }

  async objectExists(key) {
    try {
      const bucket = key.startsWith('profiles/') ? this.profileBucket : this.reportBucket;
      await this.client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = new S3Service();
