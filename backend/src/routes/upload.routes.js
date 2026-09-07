const express = require('express');
const uploadController = require('../controllers/upload.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { presignedUrlSchema } = require('../validators/upload.validator');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.use(authenticate);

router.post('/presigned-url', validate(presignedUrlSchema), uploadController.getPresignedUrl);
router.post('/direct', upload.single('file'), uploadController.uploadDirect);
router.get('/metadata/:key(*)', uploadController.getUploadMetadata);

module.exports = router;
