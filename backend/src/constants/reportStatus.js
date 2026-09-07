const REPORT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  DISPATCHED: 'dispatched',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
};

const REPORT_STATUS_LABELS = {
  [REPORT_STATUS.PENDING]: 'Pendiente',
  [REPORT_STATUS.IN_PROGRESS]: 'En Progreso',
  [REPORT_STATUS.DISPATCHED]: 'Despachado',
  [REPORT_STATUS.RESOLVED]: 'Resuelto',
  [REPORT_STATUS.CANCELLED]: 'Cancelado',
};

const REPORT_STATUS_LIST = Object.values(REPORT_STATUS);

module.exports = {
  REPORT_STATUS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_LIST,
};
