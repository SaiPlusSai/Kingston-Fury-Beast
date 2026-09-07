export const CATEGORY_META = {
  incendio: { label: 'Incendio', emoji: '🔥' },
  inundacion: { label: 'Inundación', emoji: '🌊' },
  delito: { label: 'Delito / Robo', emoji: '🚨' },
  accidente: { label: 'Accidente de Tránsito', emoji: '🚗' },
  bloqueo: { label: 'Bloqueo Vial', emoji: '🚧' },
  otros: { label: 'Otros', emoji: '📍' },
};

export const STATUS_LABELS = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  dispatched: 'Despachado',
  resolved: 'Resuelto',
  cancelled: 'Cancelado',
};

export const STATUS_TO_API = {
  Pendiente: 'pending',
  'En Progreso': 'in_progress',
  Despachado: 'dispatched',
  Resuelto: 'resolved',
  Cancelado: 'cancelled',
};

export const PRIORITY_LABELS = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
};

export const PRIORITY_TO_API = {
  critica: 'critical',
  alta: 'high',
  media: 'medium',
  baja: 'low',
};

export const getCategoryMeta = (category) =>
  CATEGORY_META[category] || { label: category, emoji: '📍' };

export const getStatusLabel = (status) => STATUS_LABELS[status] || status;

export const getStatusBadgeVariant = (status) => {
  const label = getStatusLabel(status);
  if (label === 'En Progreso') return 'warning';
  if (label === 'Resuelto') return 'success';
  if (label === 'Pendiente') return 'danger';
  if (label === 'Despachado') return 'accent';
  return 'default';
};

export const formatReportForList = (report) => {
  const meta = getCategoryMeta(report.category);
  return {
    id: report.reportId,
    title: report.title,
    type: meta.label,
    emoji: meta.emoji,
    date: new Date(report.createdAt).toLocaleString('es-BO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    status: getStatusLabel(report.status),
    statusRaw: report.status,
    location: report.location || `${report.latitude?.toFixed(4)}, ${report.longitude?.toFixed(4)}`,
    priority: PRIORITY_LABELS[report.priority] || report.priority,
    reporter: report.reporterName || report.reporter || report.userId || 'Ciudadano',
    raw: report,
  };
};

export const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';
