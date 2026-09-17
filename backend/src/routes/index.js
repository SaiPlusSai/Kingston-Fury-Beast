const express = require('express');
const authRoutes = require('./auth.routes');
const reportRoutes = require('./report.routes');
const uploadRoutes = require('./upload.routes');
const notificationRoutes = require('./notification.routes');
const locationRoutes = require('./location.routes');
const adminRoutes = require('./admin.routes');
const supportRoutes = require('./support.routes');
const healthRoutes = require('./health.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/reports', reportRoutes);
router.use('/uploads', uploadRoutes);
router.use('/notifications', notificationRoutes);
router.use('/location', locationRoutes);
router.use('/admin', adminRoutes);
router.use('/support', supportRoutes);

module.exports = router;
