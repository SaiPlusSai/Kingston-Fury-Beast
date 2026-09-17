const createActivityLogEntity = ({
  activityId,
  entityType,
  entityId,
  action,
  performedBy,
  metadata = {},
  createdAt,
}) => ({
  activityId,
  entityType,
  entityId,
  action,
  performedBy,
  metadata,
  createdAt,
});

module.exports = {
  createActivityLogEntity,
};
