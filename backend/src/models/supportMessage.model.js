const createSupportMessageEntity = ({
  supportMessageId,
  userId,
  subject,
  message,
  status = 'open',
  response = null,
  repliedBy = null,
  repliedAt = null,
  createdAt,
  updatedAt,
}) => ({
  supportMessageId,
  userId,
  subject,
  message,
  status,
  response,
  repliedBy,
  repliedAt,
  createdAt,
  updatedAt,
});

module.exports = {
  createSupportMessageEntity,
};
