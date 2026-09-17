import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin, CheckCircle, Activity, Plus, Flame, Waves, Car, ShieldAlert, Construction, Clock, Bell, ThumbsUp, ThumbsDown } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { listReports, getNearbyReports } from '../../services/reportsApi';
import { useAsyncData } from '../../hooks/useAsyncData';
import { usePolling } from '../../hooks/usePolling';
import { useAuth } from '../../context/AuthContext';
import { getMapMarkers } from '../../services/locationApi';
import { formatReportForList, getStatusBadgeVariant, getCategoryMeta } from '../../utils/reportFormatters';
import AwsLocationMap from '../../components/common/AwsLocationMap';
import { ReportListItemSkeleton } from '../../components/ui/Skeleton';
import OnboardingTour from '../../components/ui/OnboardingTour';

const categoryIconMap = {
  'Incendio': { icon: Flame, color: 'text-danger', bg: 'bg-danger/8 border-danger/15' },
  'Inundación': { icon: Waves, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100' },
  'Delito': { icon: ShieldAlert, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-100' },
  'Accidente': { icon: Car, color: 'text-warning', bg: 'bg-warning/8 border-warning/15' },
  'Bloqueo vial': { icon: Construction, color: 'text-accent-dark', bg: 'bg-accent/8 border-accent/15' },
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'En Progreso': return <Badge variant="warning" dot>{status}</Badge>;
    case 'Resuelto': return <Badge variant="success" dot>{status}</Badge>;
    case 'Pendiente': return <Badge variant="danger" dot>{status}</Badge>;
    case 'Despachado': return <Badge variant="accent" dot>{status}</Badge>;
    default: return <Badge dot>{status}</Badge>;
  }
};

const getRelativeTime = (dateString) => {
  if (!dateString) return 'Hace unos momentos';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return 'Ayer';
  return `Hace ${diffDays} días`;
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

const CitizenDashboard = () => {
  const { user } = useAuth();

  // Personal reports — used for stats + sidebar list
  const { data: allData, loading, error } = useAsyncData(() => listReports({ limit: 100 }), []);
  const allReports = Array.isArray(allData) ? allData : (Array.isArray(allData?.data) ? allData.data : (allData?.items || []));
  const recentReports = allReports.slice(0, 4).map(formatReportForList);

  const [userLoc, setUserLoc] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  // All active reports for the map — polling every 15s, visible to everyone
  const { data: nearbyData, lastUpdated: mapUpdated } = usePolling(
    () => getMapMarkers(),
    [],
    15000,
  );

  const nearbyReports = Array.isArray(nearbyData) ? nearbyData : nearbyData?.markers || [];

  // Filtrar los recientes de la ciudad, ordenados por los mas recientes
  const cityActivity = [...nearbyReports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 15);

  const stats = useMemo(() => ({
    total: allReports.length,
    resolved: allReports.filter((r) => r.status === 'resolved').length,
    inProgress: allReports.filter((r) => ['in_progress', 'dispatched'].includes(r.status)).length,
    pending: allReports.filter((r) => r.status === 'pending').length,
  }), [allReports]);

  // Map markers from nearby reports (all users)
  const mapMarkers = nearbyReports
    .filter((report) => (report.latitude != null || report.lat != null) && (report.longitude != null || report.lng != null))
    .map((report) => {
      const lat = report.lat ?? report.latitude;
      const lng = report.lng ?? report.longitude;
      const status = report.status || 'pending';
      return {
        latitude: lat,
        longitude: lng,
        color: status === 'verified' ? '#16a34a' : status === 'resolved' ? '#8b5cf6' : report.priority === 'critical' ? '#dc2626' : '#f59e0b',
        popupHtml: `<strong>${report.title || report.category}</strong><br/>${report.category}`,
      };
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <OnboardingTour
        steps={[
          { targetId: 'tour-trust', title: 'Tu Reputación', content: 'Aquí verás tu Nivel de Confianza y puntos. ¡Ganas puntos al reportar incidentes verídicos y validar los de otros!' },
          { targetId: 'tour-map', title: 'Radar Ciudadano', content: 'En este mapa verás los incidentes confirmados cerca de ti en tiempo real.' },
          { targetId: 'tour-report', title: 'Crear Reportes', content: 'Si ves una emergencia, presiona aquí. Tu reporte alertará inmediatamente a la comunidad y autoridades.' }
        ]}
        onComplete={() => {}}
      />
      {error && <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-3 py-2">{error}</p>}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-text-muted text-sm">Buenos días,</p>
          <h2 className="text-2xl font-bold text-text-primary font-display">{user?.name || 'Ciudadano'} 👋</h2>
          <div className="flex items-center gap-2 mt-2" id="tour-trust">
            <Badge variant={user?.trustScore >= 80 ? 'success' : user?.trustScore < 20 ? 'danger' : 'accent'} className="px-2.5 py-1">
              <span className="flex items-center gap-1.5 font-semibold">
                {user?.trustScore >= 80 ? '🌟 Ciudadano Ejemplar' : user?.trustScore < 20 ? '⚠️ En Observación' : '⭐ Ciudadano Activo'}
                <span className="opacity-70 font-normal">| {user?.trustScore ?? 50} pts</span>
              </span>
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/notifications">
            <Button variant="secondary" size="sm" leftIcon={<Bell className="h-4 w-4" />} className="relative">
              Alertas
              {stats.pending > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  {stats.pending > 9 ? '9+' : stats.pending}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/report/new" id="tour-report">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Nuevo Reporte</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: AlertTriangle, label: 'Tus Reportes', value: String(stats.total), color: 'text-primary', bg: 'bg-primary/8 border-primary/15' },
          { icon: CheckCircle, label: 'Resueltos', value: String(stats.resolved), color: 'text-success', bg: 'bg-success/8 border-success/15' },
          { icon: Activity, label: 'En Progreso', value: String(stats.inProgress), color: 'text-warning', bg: 'bg-warning/8 border-warning/15' },
          { icon: MapPin, label: 'Pendientes', value: String(stats.pending), color: 'text-danger', bg: 'bg-danger/8 border-danger/15' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl border ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-text-primary font-display">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map Widget */}
        <div className="xl:col-span-2" id="tour-map">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex justify-between items-center">
                <CardTitle>Mapa de Incidentes en tu Zona</CardTitle>
                <span className="flex items-center gap-2 text-xs text-danger font-medium">
                  <span className="h-2 w-2 rounded-full bg-danger animate-pulse-subtle" />
                  En vivo
                  {mapUpdated && (
                    <span className="text-text-muted font-normal">
                      · {mapUpdated.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </span>
              </div>
            </CardHeader>
            <div className="relative flex-1 min-h-[400px] overflow-hidden map-placeholder rounded-b-[1.25rem] border-t border-border shadow-inner">
              <div className="absolute inset-0 z-0">
                <AwsLocationMap
                  className="absolute inset-0"
                  center={[-68.1193, -16.4897]} // Por defecto La Paz
                  zoom={13}
                  markers={mapMarkers}
                  centerOnUserLocation={true}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <Card className="flex-1">
            <CardHeader><CardTitle>Tus Reportes Recientes</CardTitle></CardHeader>
            <CardContent className="space-y-2 p-4">
              {loading && (
                <>
                  <ReportListItemSkeleton />
                  <ReportListItemSkeleton />
                  <ReportListItemSkeleton />
                </>
              )}
              {!loading && recentReports.length === 0 && (
                <p className="text-sm text-text-muted px-2">Aún no tienes reportes registrados.</p>
              )}
              {!loading && recentReports.map((incident) => {
                const config = categoryIconMap[incident.type] || { icon: Activity, color: 'text-text-muted', bg: 'bg-muted border-border' };
                const Icon = config.icon;
                return (
                  <Link to={`/reports/${incident.id}`} key={incident.id}>
                    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-hover transition-colors border border-transparent hover:border-border-light cursor-pointer">
                      <div className={`h-9 w-9 rounded-xl border ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <p className="text-sm font-semibold text-text-primary truncate">{incident.type}</p>
                          {getStatusBadge(incident.status)}
                        </div>
                        <p className="text-xs text-text-muted flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 flex-shrink-0" />{incident.location}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
              <Link to="/reports">
                <Button variant="ghost" className="w-full mt-2 text-sm text-primary hover:text-primary-dark">Ver todos mis reportes →</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-danger animate-pulse-subtle" />
                Actividad en la Ciudad
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col">
              <div className="max-h-[360px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-light [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border">
                {cityActivity.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-text-muted">Sin actividad reciente.</p>
                ) : (
                  cityActivity.map((act, i) => {
                    const upvotes = act.upvotesCount || 0;
                    const downvotes = act.downvotesCount || 0;
                    const dist = getDistance(userLoc?.lat, userLoc?.lng, act.latitude || act.lat, act.longitude || act.lng);
                    return (
                      <div
                        key={act.id}
                        className={`px-5 py-4 flex items-start gap-3 ${i < cityActivity.length - 1 ? 'border-b border-border-light' : ''} hover:bg-muted/50 transition-colors`}
                      >
                        <div className={`h-2.5 w-2.5 mt-1 rounded-full flex-shrink-0 shadow-sm ${act.priority === 'critical' ? 'bg-danger shadow-danger/40' : act.status === 'verified' ? 'bg-success shadow-success/40' : 'bg-warning shadow-warning/40'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <p className="text-sm font-semibold text-text-primary truncate">{act.title || act.category}</p>
                            <Badge variant={act.priority === 'critical' ? 'danger' : 'warning'} className="text-[10px] py-0 px-1.5 h-4.5 flex-shrink-0 border-none font-bold">
                              {act.status === 'verified' ? 'Verificado' : 'Pendiente'}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                            <p className="text-xs text-text-muted flex items-center gap-1 font-medium">
                              <Clock className="h-3 w-3" /> {getRelativeTime(act.createdAt)}
                            </p>
                            {dist && (
                              <p className="text-xs text-text-muted flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> a {dist} km
                              </p>
                            )}
                            {(upvotes > 0 || downvotes > 0) && (
                              <div className="flex items-center gap-2 text-[10px] font-bold bg-secondary-bg px-2 py-0.5 rounded-full border border-border">
                                {upvotes > 0 && <span className="text-success flex items-center gap-1"><ThumbsUp className="h-2.5 w-2.5" /> {upvotes}</span>}
                                {downvotes > 0 && <span className="text-danger flex items-center gap-1"><ThumbsDown className="h-2.5 w-2.5" /> {downvotes}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <div className="p-3 border-t border-border-light bg-secondary-bg/30 rounded-b-[1.25rem]">
                <Link to="/radar" className="block">
                  <Button variant="ghost" className="w-full text-xs font-semibold text-text-secondary hover:text-primary transition-colors">
                    Ver mapa completo →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;

