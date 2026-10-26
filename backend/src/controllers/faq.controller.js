const faqService = require('../services/faq.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Controller to manage FAQ items (Admin)
 */
const getFaqs = asyncHandler(async (req, res) => {
  const { category, search, isActive, limit } = req.query;
  const faqs = await faqService.getFaqs({
    category,
    search,
    isActive,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  sendSuccess(res, {
    message: 'FAQs retrieved successfully',
    data: {
      count: faqs.length,
      faqs,
    },
  });
});

const getFaqById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const faq = await faqService.getFaqById(id);

  if (!faq) {
    return res.status(404).json({
      success: false,
      message: `FAQ with id "${id}" not found`,
      data: null,
    });
  }

  sendSuccess(res, {
    message: 'FAQ retrieved successfully',
    data: faq,
  });
});

const createFaq = asyncHandler(async (req, res) => {
  const created = await faqService.createFaq(req.body);

  sendSuccess(res, {
    statusCode: 201,
    message: 'FAQ created successfully',
    data: created,
  });
});

const updateFaq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await faqService.updateFaq(id, req.body);

  sendSuccess(res, {
    message: 'FAQ updated successfully',
    data: updated,
  });
});

const deleteFaq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await faqService.deleteFaq(id);

  sendSuccess(res, {
    message: 'FAQ deleted successfully',
    data: result,
  });
});

module.exports = {
  getFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
};
