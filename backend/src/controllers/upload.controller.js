const uploadService = require('../services/upload.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getPresignedUrl = asyncHandler(async (req, res) => {
  const result = await uploadService.generatePresignedUrl({
    userId: req.user.userId,
    ...req.body,
  });
  sendSuccess(res, { message: 'Presigned URL generated', data: result });
});

const uploadDirect = asyncHandler(async (req, res) => {
  const result = await uploadService.uploadDirect(req.file, req.user.userId, req.body.purpose);
  sendSuccess(res, { message: 'File uploaded successfully', data: result });
});

const getUploadMetadata = asyncHandler(async (req, res) => {
  const result = await uploadService.getUploadMetadata(req.params.key);
  sendSuccess(res, { message: 'Upload metadata retrieved', data: result });
});

module.exports = {
  getPresignedUrl,
  uploadDirect,
  getUploadMetadata,
};
