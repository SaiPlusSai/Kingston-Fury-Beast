const express = require('express');
const faqController = require('../../controllers/faq.controller');
const validate = require('../../middlewares/validate.middleware');
const {
  createFaqSchema,
  updateFaqSchema,
  queryFaqSchema,
} = require('../../validators/faq.validator');

const router = express.Router();

router.get('/', validate(queryFaqSchema, 'query'), faqController.getFaqs);
router.get('/:id', faqController.getFaqById);
router.post('/', validate(createFaqSchema, 'body'), faqController.createFaq);
router.put('/:id', validate(updateFaqSchema, 'body'), faqController.updateFaq);
router.delete('/:id', faqController.deleteFaq);

module.exports = router;
