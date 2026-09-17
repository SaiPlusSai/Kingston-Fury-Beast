const { v4: uuidv4 } = require('uuid');
const s3Service = require('../aws/s3.service');
const { awsInfrastructure } = require('../config/aws');
const { BadRequestError } = require('../errors/AppError');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getS3Client } = require('../aws/clients');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = () => awsInfrastructure.s3.maxSizeMb * 1024 * 1024;
const PROFILE_MAX_FILE_SIZE_BYTES = () => awsInfrastructure.s3.profileMaxSizeMb * 1024 * 1024;

class UploadService {
  validateFileMetadata({ contentType, fileSize, purpose = 'report' }) {
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      throw new BadRequestError('Invalid file type. Allowed: JPEG, PNG, WEBP');
    }
    const maxSize = purpose === 'profile' ? PROFILE_MAX_FILE_SIZE_BYTES() : MAX_FILE_SIZE_BYTES();
    const maxLabel = purpose === 'profile' ? awsInfrastructure.s3.profileMaxSizeMb : awsInfrastructure.s3.maxSizeMb;
    if (fileSize && fileSize > maxSize) {
      throw new BadRequestError(`File size exceeds ${maxLabel}MB limit`);
    }
  }

  buildS3Key(userId, fileName, purpose = 'report') {
    const extension = fileName.split('.').pop() || 'jpg';
    const folder = purpose === 'profile' ? 'profiles' : 'reports';
    return `${folder}/${userId}/${uuidv4()}.${extension}`;
  }

  async generatePresignedUrl({ userId, fileName, contentType, fileSize, purpose = 'report' }) {
    this.validateFileMetadata({ contentType, fileSize, purpose });

    const key = this.buildS3Key(userId, fileName, purpose);

    // Instead of using presigned URLs, we just return dummy uploadUrl for frontend compatibility
    // if the frontend hasn't been updated, or the frontend can use direct.
    // We will update frontend to use direct.
    return s3Service.getPresignedUploadUrl({ key, contentType, purpose });
  }

  async uploadDirect(file, userId, purpose = 'report') {
    if (!file) throw new BadRequestError('No file provided');
    this.validateFileMetadata({ contentType: file.mimetype, fileSize: file.size, purpose });

    const key = this.buildS3Key(userId, file.originalname || 'image.jpg', purpose);
    const bucket = awsInfrastructure.s3.bucketName; // Use main bucket for everything
    
    await getS3Client().send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));
    
    const publicUrl = `https://${bucket}.s3.${awsInfrastructure.region}.amazonaws.com/${key}`;
    return { publicUrl, key };
  }

  async getUploadMetadata(key) {
    const exists = await s3Service.objectExists(key);
    return { key, exists };
  }
}

module.exports = new UploadService();
