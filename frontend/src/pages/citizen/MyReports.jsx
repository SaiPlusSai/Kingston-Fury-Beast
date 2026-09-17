import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Eye, Clock, MapPin, AlertCircle, Grid, List, Plus } from 'lucide-react';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { listReports } from '../../services/reportsApi';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatReportForList, getStatusBadgeVariant } from '../../utils/reportFormatters';
import { ReportListItemSkeleton, CardSkeleton } from '../../components/ui/Skeleton';

const MyReports = () => {
  const [search, setSearch] = useState('');
  const [view, setView] = useState('table');
  const { data, loading, error } = useAsyncData(() => listReports({ limit: 50 }), []);

  const reports = useMemo(
    () => (data?.data || []).map(formatReportForList),
    [data],
  );

  const filtered = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {error && <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-3 py-2">{error}</p>}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary font-display">Mis Reportes</h2>
          <p className="text-text-secondary text-sm mt-1">Historial y estado de tus emergencias reportadas.</p>
        </div>
        <Link to="/report/new">
          <Button leftIcon={<Plus className="h-4 w-4" />} size="sm">Nuevo Reporte</Button>
        </Link>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-3 flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 w-full">
            <Input placeholder="Buscar por ID, título..." leftIcon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} className="py-2" />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
            <select className="text-sm bg-transparent border border-border text-text-secondary rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 shadow-sm">
              <option>Todos los estados</option>
              <option>En Progreso</option>
              <option>Pendiente</option>
              <option>Resuelto</option>
            </select>
            <Button variant="muted" size="sm" leftIcon={<SlidersHorizontal className="h-4 w-4" />}>Filtros</Button>
            <div className="flex items-center gap-1 p-1 bg-muted border border-border-light rounded-xl">
              {[{ icon: List, v: 'table' }, { icon: Grid, v: 'grid' }].map(({ icon: Icon, v }) => (
                <button key={v} onClick={() => setView(v)}
                  className={`p-1.5 rounded-lg transition-colors ${view === v ? 'bg-[var(--color-card-bg)] text-primary shadow-sm border border-border' : 'text-text-muted hover:text-text-secondary'}`}>
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table View */}
      {view === 'table' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider font-semibold text-text-muted border-b border-border-light bg-muted/60">
                  <th className="px-5 py-3 text-left">Reporte</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Ubicación</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Fecha</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-right pr-5">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-16 text-center">
                    <AlertCircle className="h-10 w-10 text-text-muted mx-auto mb-3 opacity-30" />
                    <p className="text-text-secondary text-sm">No se encontraron reportes.</p>
                  </td></tr>
                ) : loading ? (
                  <tr><td colSpan={5} className="p-0 border-none bg-transparent">
                    <ReportListItemSkeleton />
                    <ReportListItemSkeleton />
                    <ReportListItemSkeleton />
                  </td></tr>
                ) : filtered.map((report) => (
                  <tr key={report.id} className="hover:bg-hover transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{report.emoji}</span>
                        <div>
                          <p className="font-semibold text-text-primary">{report.title}</p>
                          <p className="text-xs text-text-muted font-mono">{report.id} · {report.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-text-secondary hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-sm"><MapPin className="h-3.5 w-3.5" />{report.location}</div>
                    </td>
                    <td className="px-4 py-4 text-text-secondary hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm"><Clock className="h-3.5 w-3.5" />{report.date}</div>
                    </td>
                    <td className="px-4 py-4"><Badge variant={getStatusBadgeVariant(report.statusRaw)} dot>{report.status}</Badge></td>
                    <td className="px-4 py-4 pr-5 text-right">
                      <Link to={`/reports/${report.id}`}><Button variant="ghost" size="xs" leftIcon={<Eye className="h-3.5 w-3.5" />}>Ver</Button></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border-light bg-muted/30 flex items-center justify-between">
            <span className="text-xs text-text-muted">Mostrando {filtered.length} de {reports.length} reportes</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="xs" disabled>Anterior</Button>
              <Button variant="primary" size="xs" className="h-7 w-7 p-0 text-xs">1</Button>
              <Button variant="ghost" size="xs" className="h-7 w-7 p-0 text-xs">2</Button>
              <Button variant="ghost" size="xs">Siguiente</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : filtered.map((report) => (
            <Card key={report.id} hover>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl">{report.emoji}</span>
                  <Badge variant={getStatusBadgeVariant(report.statusRaw)} dot>{report.status}</Badge>
                </div>
                <h3 className="font-semibold text-text-primary mb-1">{report.title}</h3>
                <p className="text-xs font-mono text-text-muted mb-3">{report.id}</p>
                <div className="space-y-1.5 text-xs text-text-secondary mb-4">
                  <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{report.location}</p>
                  <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{report.date}</p>
                </div>
                <Link to={`/reports/${report.id}`}>
                  <Button variant="secondary" className="w-full" size="sm" leftIcon={<Eye className="h-4 w-4" />}>Ver Detalles</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReports;
