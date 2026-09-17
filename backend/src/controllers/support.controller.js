const supportService = require('../services/support.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createMessage = asyncHandler(async (req, res) => {
  const message = await supportService.createMessage(req.user.userId, req.body);
  sendSuccess(res, { message: 'Support message created', data: message, statusCode: 201 });
});

const listMine = asyncHandler(async (req, res) => {
  const messages = await supportService.listByUser(req.user.userId);
  sendSuccess(res, { message: 'Support messages retrieved', data: messages });
});

const inbox = asyncHandler(async (req, res) => {
  const messages = await supportService.listInbox();
  sendSuccess(res, { message: 'Support inbox retrieved', data: messages });
});

const reply = asyncHandler(async (req, res) => {
  const message = await supportService.replyToMessage(req.params.id, req.user.userId, req.body.response);
  sendSuccess(res, { message: 'Support message replied', data: message });
});

const closeThread = asyncHandler(async (req, res) => {
  const message = await supportService.markClosed(req.params.id, req.user.userId);
  sendSuccess(res, { message: 'Support thread closed', data: message });
});

module.exports = {
  createMessage,
  listMine,
  inbox,
  reply,
  closeThread,
};
