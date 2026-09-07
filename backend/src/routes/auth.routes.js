const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authRateLimiter } = require('../middlewares/rateLimit.middleware');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  logoutSchema,
  updateProfileSchema,
  updatePasswordSchema,
} = require('../validators/auth.validator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/logout', authenticate, validate(logoutSchema), authController.logout);
router.get('/me', authenticate, authController.getProfile);
router.put('/me', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.put('/password', authenticate, validate(updatePasswordSchema), authController.updatePassword);

module.exports = router;
