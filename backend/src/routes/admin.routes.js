const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/dashboard', adminController.getDashboard);
router.get('/monitoring', adminController.getMonitoring);
router.get('/activity', adminController.getActivityFeed);
router.get('/emergency-summary', adminController.getEmergencySummary);

module.exports = router;
