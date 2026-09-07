const upload = require('../uploads/multer.config');
const { BadRequestError } = require('../errors/AppError');

const uploadSingleImage = upload.single('image');

const handleUpload = (req, res, next) => {
  uploadSingleImage(req, res, (err) => {
    if (err) {
      return next(new BadRequestError(err.message));
    }
    next();
  });
};

const uploadMultipleImages = (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      return next(new BadRequestError(err.message));
    }
    next();
  });
};

module.exports = {
  handleUpload,
  uploadMultipleImages,
};
