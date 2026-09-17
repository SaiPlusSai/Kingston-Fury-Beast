import React from 'react';
import { AlertTriangle, Activity, CheckCircle, Clock, TrendingUp, Users, Flame, ShieldAlert, Waves, Car, Construction } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../services/adminApi';
import { listReports } from '../../services/reportsApi';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatReportForList, getStatusLabel } from '../../utils/reportFormatters';
import Badge from '../../components/ui/Badge';

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
    if (!exactZone || exactZone.length < 3) {
      const code = r.cityCode || 'UNK';
      exactZone = cityNames[code] || code;
    }

    const key = exactZone.toLowerCase();

    if (!zoneStats[key]) zoneStats[key] = { zone: exactZone, count: 0, criticalCount: 0 };
    zoneStats[key].count++;
    if (r.priority === 'critical') zoneStats[key].criticalCount++;
  });

  const maxZoneCount = Math.max(...Object.values(zoneStats).map(z => z.count), 1);
  const dynamicZones = Object.values(zoneStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(z => {
      let level = 'Estable';
      let color = 'text-success';
      let bg = 'bg-success/8';
      let bar = Math.min((z.count / maxZoneCount) * 100, 100);
      if (z.criticalCount > 0 || z.count >= 5) { level = 'Crítico'; color = 'text-danger'; bg = 'bg-danger/8'; }
      else if (z.count >= 2) { level = 'Moderado'; color = 'text-warning'; bg = 'bg-warning/8'; }
      return { ...z, level, color, bg, bar };
    });

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-3 py-2">{error}</p>}
      {loading && <p className="text-sm text-text-muted">Cargando panel...</p>}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary font-display">Dashboard Analítico</h2>
          <p className="text-text-muted text-sm">Visión general del estado de emergencias · Actualizado hace 2 min</p>
        </div>
        <Link to="/admin/map">
          <button className="flex items-center gap-2 px-4 py-2 bg-danger/8 border border-danger/20 rounded-xl text-danger text-sm font-medium hover:bg-danger/12 transition-colors">
            <span className="h-2 w-2 bg-danger rounded-full animate-pulse-subtle" />
            Ver Mapa en Vivo
          </button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="flex flex-wrap justify-center gap-4">
        {[
          { label: 'Incidentes Activos', value: stats.activeIncidents ?? 0, change: 'En tiempo real', icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/8 border-danger/15' },
          { label: 'Tiempo Resp. Promedio', value: stats.avgResponseTime ?? '—', change: 'Operativo', icon: Clock, color: 'text-warning', bg: 'bg-warning/8 border-warning/15' },
          { label: 'Resueltos Hoy', value: stats.resolvedToday ?? 0, change: 'Hoy', icon: CheckCircle, color: 'text-success', bg: 'bg-success/8 border-success/15' },
        ].map((kpi, i) => (
          <Card key={i} className="relative overflow-hidden w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)]">
            <div className="absolute top-0 right-0 p-4 opacity-[0.04]">
              <kpi.icon className="h-24 w-24 text-text-primary" />
            </div>
            <CardContent className="p-5 relative z-10">
              <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">{kpi.label}</p>
              <p className={`text-3xl font-bold font-display ${kpi.color}`}>{kpi.value}</p>
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${kpi.color}`}>
                <TrendingUp className="h-3 w-3" />
                {kpi.change}
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 border-b ${kpi.bg}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Tendencia de Incidentes por Hora</CardTitle>
                  <p className="text-xs text-text-muted mt-1">Acumulado del periodo seleccionado</p>
                </div>
                <div className="flex gap-2">
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-xs bg-muted border border-border-light rounded-lg px-2 py-1 text-text-secondary outline-none focus:ring-1 focus:ring-primary/30" />
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-xs bg-muted border border-border-light rounded-lg px-2 py-1 text-text-secondary outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6 flex-1 flex flex-col">
              <div className="relative w-full flex-1 flex flex-col">
                {/* Eje Y: etiquetas a la izquierda */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-text-muted pr-2">
                  {[maxIncidents, Math.floor(maxIncidents * 0.75), Math.floor(maxIncidents * 0.5), Math.floor(maxIncidents * 0.25), 0].map((v, idx) => (
                    <span key={idx} className="leading-none">{v}</span>
                  ))}
                </div>

                {/* Área del gráfico con scroll horizontal si es necesario */}
                <div className="ml-12 overflow-x-auto flex-1 flex flex-col">
                  <div className="min-w-[500px] h-full flex flex-col"> {/* Ancho mínimo para que no se aplaste */}
                    {/* Contenedor de barras */}
                    <div className="flex-1 border-b border-l border-border pt-2 flex items-end gap-1">
                      {chartBars.map((bar, i) => (
                        <div key={i} className="flex-1 min-w-[8px] h-full flex flex-col justify-end group relative">
                          <div
                            className="w-full rounded-t-sm transition-all duration-200 group-hover:brightness-110 cursor-pointer"
                            style={{
                              height: `${bar.height}%`,
                              background: bar.height > 70 ? '#E76F51' : bar.height > 50 ? '#DDA15E' : '#4C9F70',
                              opacity: 0.8
                            }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-primary text-white border border-text-primary/10 text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-medium pointer-events-none">
                              {bar.count} inc.
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Etiquetas del eje X */}
                    <div className="flex items-start gap-1 mt-1 px-0">
                      {chartBars.map((bar, i) => (
                        <div key={i} className="flex-1 text-center text-[10px] text-text-muted min-w-[8px]">
                          {i * 2}h
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Zones */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader><CardTitle>Lugares Críticos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {dynamicZones.length === 0 && <p className="text-xs text-text-muted">No hay zonas críticas reportadas.</p>}
              {dynamicZones.map((item, i) => (
                <div key={i} className="p-3 rounded-xl border border-border-light hover:border-border hover:bg-hover transition-all cursor-pointer">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold text-text-primary">{item.zone}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.bg} ${item.color}`}>{item.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary-bg rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${item.color === 'text-danger' ? 'bg-danger' : item.color === 'text-success' ? 'bg-success' : 'bg-warning'}`}
                        style={{ width: `${item.bar}%` }} />
                    </div>
                    <span className="text-xs text-text-muted font-medium">{item.count} inc.</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Table + Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Incidentes Prioritarios</CardTitle>
                <Link to="/admin/reports" className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">Ver todos →</Link>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/60 text-xs uppercase tracking-wider font-semibold text-text-muted border-b border-border-light">
                    <th className="p-3 pl-5 text-left">ID / Tipo</th>
                    <th className="p-3 text-left hidden sm:table-cell">Ubicación</th>
                    <th className="p-3 text-left">Estado</th>
                    <th className="p-3 pr-5 text-right hidden md:table-cell">Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {criticalReports.slice(0, 5).map((inc) => (
                    <tr key={inc.id} className="hover:bg-hover transition-colors">
                      <td className="p-3 pl-5">
                        <p className="font-mono text-xs font-bold text-text-muted">{inc.id}</p>
                        <p className="font-semibold text-text-primary text-sm">{inc.type}</p>
                      </td>
                      <td className="p-3 text-sm text-text-secondary hidden sm:table-cell max-w-[180px] truncate">{inc.location}</td>
                      <td className="p-3">{getStatusBadge(inc.status)}</td>
                      <td className="p-3 pr-5 text-xs text-text-muted text-right hidden md:table-cell">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {inc.date}
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
