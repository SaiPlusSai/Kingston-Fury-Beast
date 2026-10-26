import React from 'react';
import { AlertTriangle, Activity, CheckCircle, Clock, TrendingUp, Users, Flame, ShieldAlert, Waves, Car, Construction } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../services/adminApi';
import { listReports } from '../../services/reportsApi';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatReportForList, getStatusLabel } from '../../utils/reportFormatters';
import Badge from '../../components/ui/Badge';
import PredictionsDashboard from '../../components/common/PredictionsDashboard';

const getStatusBadge = (status) => {
  switch (status) {
    case 'En Progreso': return <Badge variant="warning" dot>{status}</Badge>;
    case 'Resuelto': return <Badge variant="success" dot>{status}</Badge>;
    case 'Pendiente': return <Badge variant="danger" dot>{status}</Badge>;
    case 'Despachado': return <Badge variant="accent" dot>{status}</Badge>;
    default: return <Badge dot>{status}</Badge>;
  }
};

const AdminDashboard = () => {
  const { data, loading, error } = useAsyncData(() => getDashboard(), []);
  const stats = data?.stats || {};
  const criticalReports = (data?.criticalReports || []).map(formatReportForList);

  // Real data for trend chart
  const { data: reportsResp } = useAsyncData(() => listReports({ limit: 1000 }), []);
  const allReports = Array.isArray(reportsResp) ? reportsResp : (Array.isArray(reportsResp?.data) ? reportsResp.data : (reportsResp?.items || []));

  const [startDate, setStartDate] = React.useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = React.useState(new Date().toISOString().split('T')[0]);

  const biHourlyData = new Array(12).fill(0);
  allReports.forEach(r => {
    if (!r.createdAt) return;
    const dateStr = r.createdAt.split('T')[0];
    if (dateStr >= startDate && dateStr <= endDate) {
      const hour = new Date(r.createdAt).getHours();
      biHourlyData[Math.floor(hour / 2)]++;
    }
  });
  const maxIncidents = Math.max(...biHourlyData, 1);
  const chartBars = biHourlyData.map(count => ({ count, height: (count / maxIncidents) * 100 }));

  const cityNames = { SCZ: 'Santa Cruz', LP: 'La Paz', CBBA: 'Cochabamba', SCR: 'Sucre', TJA: 'Tarija', ORU: 'Oruro', PTS: 'Potosí', TRN: 'Trinidad', BEN: 'Beni', PND: 'Pando', UNK: 'Zona Desconocida' };
  const zoneStats = {};
  allReports.forEach(r => {
    if (r.status === 'resolved' || r.status === 'deleted' || r.status === 'cancelled') return;

    let exactZone = r.exactZone || (r.location ? r.location.split(',')[0].trim() : '');
    let zoneKey = exactZone || cityNames[r.city] || 'Otros';
    zoneStats[zoneKey] = (zoneStats[zoneKey] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase">Total Incidentes</p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">{stats.totalReports || 0}</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Activity className="h-6 w-6" /></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase">En Atención</p>
              <h3 className="text-2xl font-bold text-warning mt-1">{stats.inProgressReports || 0}</h3>
            </div>
            <div className="p-3 bg-warning/10 rounded-xl text-warning"><Clock className="h-6 w-6" /></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase">Resueltos</p>
              <h3 className="text-2xl font-bold text-success mt-1">{stats.resolvedReports || 0}</h3>
            </div>
            <div className="p-3 bg-success/10 rounded-xl text-success"><CheckCircle className="h-6 w-6" /></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase">Críticos</p>
              <h3 className="text-2xl font-bold text-danger mt-1">{stats.criticalReports || 0}</h3>
            </div>
            <div className="p-3 bg-danger/10 rounded-xl text-danger"><AlertTriangle className="h-6 w-6" /></div>
          </CardContent>
        </Card>
      </div>

      {/* Module: Predictions and MLOps Evaluation Dashboard (BUILD-13) */}
      <PredictionsDashboard />

      {/* Analytics and Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Reportes Críticos Recientes</CardTitle></CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary-bg text-text-muted uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Título</th>
                    <th className="py-2.5 px-4">Categoría</th>
                    <th className="py-2.5 px-4">Estado</th>
                    <th className="py-2.5 px-4">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {criticalReports.slice(0, 5).map((rep) => (
                    <tr key={rep.id} className="hover:bg-secondary-bg/50">
                      <td className="py-2.5 px-4 font-medium text-text-primary">{rep.title}</td>
                      <td className="py-2.5 px-4">{rep.category}</td>
                      <td className="py-2.5 px-4">{getStatusBadge(rep.status)}</td>
                      <td className="py-2.5 px-4">
                        <Link to={`/admin/reports/${rep.id}`} className="text-primary hover:underline">Ver</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Por Categoría</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              {[
                { icon: Flame, label: 'Incendio', key: 'incendio', color: 'text-danger', bar: 'bg-danger' },
                { icon: Waves, label: 'Inundación', key: 'inundacion', color: 'text-blue-500', bar: 'bg-blue-400' },
                { icon: ShieldAlert, label: 'Delito / Robo', key: 'delito', color: 'text-purple-500', bar: 'bg-purple-400' },
                { icon: Car, label: 'Accidente de Tránsito', key: 'accidente', color: 'text-warning', bar: 'bg-warning' },
                { icon: Construction, label: 'Bloqueo Vial', key: 'bloqueo', color: 'text-orange-500', bar: 'bg-orange-500' },
                { icon: AlertTriangle, label: 'Otros', key: 'otros', color: 'text-primary', bar: 'bg-primary' },
              ].map((cat, i) => {
                const count = data?.analytics?.byCategory?.[cat.key] || 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <cat.icon className={`h-4 w-4 flex-shrink-0 ${cat.color}`} />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-primary font-medium">{cat.label}</span>
                        <span className="text-text-muted">{count}</span>
                      </div>
                      <div className="h-1.5 bg-secondary-bg rounded-full overflow-hidden">
                        <div className={`h-full ${cat.bar}`} style={{ width: `${Math.min((count / Math.max(stats.totalReports || 1, 1)) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
