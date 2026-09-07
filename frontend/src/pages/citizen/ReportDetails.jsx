import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, AlertTriangle, Image as ImageIcon, Calendar, Radio, ShieldCheck, CheckCircle, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { getReport, deleteReport } from '../../services/reportsApi';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getApiErrorMessage } from '../../services/api';
import {
  formatDate,
  getCategoryMeta,
  getStatusBadgeVariant,
  getStatusLabel,
  PRIORITY_LABELS,
} from '../../utils/reportFormatters';
import toast from 'react-hot-toast';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: raw, loading, error } = useAsyncData(() => getReport(id), [id]);

  if (loading) {
    return <p className="text-text-secondary p-6">Cargando reporte...</p>;
  }

  if (error || !raw) {
    return (
      <div className="p-6">
        <p className="text-danger mb-4">{error || 'Reporte no encontrado'}</p>
        <Link to="/reports"><Button variant="secondary">Volver</Button></Link>
      </div>
    );
  }

  const report = {
    id: raw.reportId,
    title: raw.title,
    category: getCategoryMeta(raw.category).label,
    status: getStatusLabel(raw.status),
    statusRaw: raw.status,
    priority: PRIORITY_LABELS[raw.priority] || raw.priority,
    date: formatDate(raw.createdAt),
    location: raw.location || `${raw.latitude?.toFixed(4)}, ${raw.longitude?.toFixed(4)}`,
    coords: `${Math.abs(raw.latitude).toFixed(4)}° ${raw.latitude < 0 ? 'S' : 'N'}, ${Math.abs(raw.longitude).toFixed(4)}° ${raw.longitude < 0 ? 'W' : 'E'}`,
    description: raw.description,
    imageUrls: raw.imageUrls || (raw.imageUrl ? [raw.imageUrl] : []),
    upvotes: Array.isArray(raw.upvotes) ? raw.upvotes.length : 0,
    downvotes: Array.isArray(raw.downvotes) ? raw.downvotes.length : 0,
  };

  const totalVotes = report.upvotes + report.downvotes;
  const trustPercentage = totalVotes > 0 ? Math.round((report.upvotes / totalVotes) * 100) : 0;

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este reporte de forma permanente?')) return;
    try {
      await deleteReport(report.id);
      navigate('/reports', { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const timelineSteps = [
    {
      id: 1,
      type: 'action',
      title: 'Reporte Enviado',
      desc: 'El incidente fue registrado en el sistema.',
      time: formatDate(raw.createdAt),
      done: true,
    }
  ];

  if (raw.status === 'in_progress' || raw.status === 'dispatched') {
    timelineSteps.push({
      id: 2,
      type: 'system',
      title: 'En Atención',
      desc: 'Las autoridades están gestionando y respondiendo a este reporte.',
      time: formatDate(raw.updatedAt),
      done: true,
    });
  }

  if (raw.status === 'resolved') {
    // Si saltó directo a resuelto, añadimos el intermedio para dar contexto, o solo mostramos resuelto.
    timelineSteps.push({
      id: 3,
      type: 'success',
      title: 'Resuelto',
      desc: 'El incidente ha sido atendido y marcado como resuelto.',
      time: formatDate(raw.updatedAt),
      done: true,
    });
  } else if (raw.status === 'pending') {
    timelineSteps.push({
      id: 2,
      type: 'system',
      title: 'En Espera',
      desc: 'El reporte está en la cola para ser asignado a una unidad.',
      time: 'Pendiente',
      done: false,
    });
  }

  const statusBadge = <Badge variant={getStatusBadgeVariant(raw.status)} dot>{report.status}</Badge>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <Link to="/reports" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors mb-1">
        <ArrowLeft className="h-4 w-4" />
        Volver a Mis Reportes
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold text-text-muted bg-secondary-bg px-2 py-0.5 rounded-lg border border-border-light">{report.id}</span>
            {statusBadge}
            <Badge variant="danger">{report.priority}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-text-primary font-display">{report.title}</h1>
          <p className="text-text-secondary text-sm mt-1 flex items-center gap-1.5">
            <span>Categoría:</span>
            <span className="font-semibold text-text-primary">{report.category}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} size="sm" onClick={handleDelete}>
            Eliminar
          </Button>
          <Button variant="muted" leftIcon={<AlertTriangle className="h-4 w-4" />} size="sm">
            Añadir Info
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─── Main Content ─── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Metadata */}
          <Card>
            <CardHeader><CardTitle>Detalles del Incidente</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <p className="text-text-primary leading-relaxed">{report.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border-light">
                {[
                  { icon: Calendar, label: 'Fecha y Hora', value: report.date, color: 'text-primary' },
                  { icon: MapPin, label: 'Ubicación', value: report.location, color: 'text-accent' },
                  { icon: Radio, label: 'Coordenadas GPS', value: report.coords, color: 'text-success' },
                  { icon: Clock, label: 'Última Actualización', value: 'Hace 10 minutos', color: 'text-warning' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary-bg/40 border border-border-light">
                    <div className="h-9 w-9 rounded-lg bg-primary-bg/50 flex items-center justify-center flex-shrink-0">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-0.5">{item.label}</p>
                      <p className="text-sm font-medium text-text-primary">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Evidence */}
          <Card>
            <CardHeader><CardTitle>Evidencia Fotográfica</CardTitle></CardHeader>
            <CardContent>
              {report.imageUrls && report.imageUrls.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {report.imageUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group relative overflow-hidden rounded-xl border border-border-light hover:border-primary/40 transition-all"
                      >
                        <img
                          src={url}
                          alt={`Evidencia ${idx + 1}`}
                          className="w-full h-48 object-cover rounded-xl group-hover:scale-[1.02] transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div
                          style={{ display: 'none' }}
                          className="w-full h-48 flex flex-col items-center justify-center text-text-muted bg-secondary-bg/60 rounded-xl"
                        >
                          <ImageIcon className="h-8 w-8 mb-2" />
                          <p className="text-xs">No se pudo cargar la imagen</p>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-xl flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-lg transition-opacity">
                            Ver completa
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted text-center">Haz clic para ver las imágenes en tamaño completo</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-text-muted border-2 border-dashed border-border-light rounded-xl">
                  <ImageIcon className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm font-medium">Sin evidencia fotográfica</p>
                  <p className="text-xs mt-1 opacity-70">El ciudadano no adjuntó imágenes al reporte</p>
                </div>
              )}

              {/* Nivel de Confianza / Validación */}
              <h4 className="font-semibold text-text-primary text-sm mb-2 mt-6 border-t border-border-light pt-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" />
                Validación de la Comunidad
              </h4>
              
              {totalVotes === 0 ? (
                <p className="text-xs text-text-muted mt-2">Aún no hay votos de la comunidad para este reporte.</p>
              ) : (
                <div className="mt-3">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-text-secondary">Nivel de Credibilidad</span>
                    <span className="font-bold text-text-primary">{trustPercentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-border-light rounded-full overflow-hidden flex">
                    <div className="h-full bg-success transition-all duration-500" style={{ width: `${trustPercentage}%` }} />
                    <div className="h-full bg-danger transition-all duration-500" style={{ width: `${100 - trustPercentage}%` }} />
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-md">
                      <ThumbsUp className="h-3.5 w-3.5" /> {report.upvotes} Confirmaciones
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-danger bg-danger/10 px-2 py-1 rounded-md">
                      <ThumbsDown className="h-3.5 w-3.5" /> {report.downvotes} Rechazos
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Timeline ─── */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <CardTitle>Línea de Tiempo</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border-light" />

                <div className="space-y-5">
                  {timelineSteps.map((step) => (
                    <div key={step.id} className="relative flex items-start gap-4 pl-10">
                      {/* Node */}
                      <div className={`absolute left-0 top-0 h-9 w-9 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        step.done
                          ? step.type === 'action'
                            ? 'bg-danger/20 border-danger text-danger'
                            : step.type === 'system'
                              ? 'bg-primary/20 border-primary text-primary'
                              : 'bg-success/20 border-success text-success'
                          : 'bg-secondary-bg border-border text-text-muted'
                      }`}>
                        {step.done
                          ? step.type === 'action' ? <ShieldCheck className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />
                          : <Clock className="h-4 w-4" />
                        }
                      </div>

                      {/* Content */}
                      <div className={`flex-1 pb-5 last:pb-0 ${!step.done ? 'opacity-50' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-text-muted">{step.time}</span>
                          {step.done && <span className="h-1 w-1 rounded-full bg-text-muted" />}
                        </div>
                        <p className="text-sm font-semibold text-text-primary">{step.title}</p>
                        <p className="text-xs text-text-secondary mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
