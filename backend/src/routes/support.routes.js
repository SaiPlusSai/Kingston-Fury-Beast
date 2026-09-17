const express = require('express');
const supportController = require('../controllers/support.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const { ROLES } = require('../constants/roles');
const {
  createSupportMessageSchema,
  replySupportMessageSchema,
} = require('../validators/support.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createSupportMessageSchema), supportController.createMessage);
router.get('/mine', supportController.listMine);
router.get('/inbox', authorize(ROLES.ADMIN), supportController.inbox);
router.post('/:id/reply', authorize(ROLES.ADMIN), validate(replySupportMessageSchema), supportController.reply);
router.patch('/:id/close', authorize(ROLES.ADMIN), supportController.closeThread);

module.exports = router;
