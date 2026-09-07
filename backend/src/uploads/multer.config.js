const multer = require('multer');
const path = require('path');
const { awsInfrastructure } = require('../config/aws');

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const maxSize = awsInfrastructure.s3.maxSizeMb * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/temp'));
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: maxSize, files: 5 },
  fileFilter,
});

module.exports = upload;
