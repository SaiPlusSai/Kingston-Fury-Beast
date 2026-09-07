import React, { useMemo, useState } from 'react';
import Card, { CardContent } from '../../components/ui/Card';
import { useAsyncData } from '../../hooks/useAsyncData';
import { listReports } from '../../services/reportsApi';
import Badge from '../../components/ui/Badge';
import { Clock, CheckCircle, ShieldAlert, XCircle, Search, ThumbsUp, ThumbsDown } from 'lucide-react';
import Input from '../../components/ui/Input';
import { getCategoryMeta } from '../../utils/reportFormatters';
import { ReportListItemSkeleton } from '../../components/ui/Skeleton';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'warning', icon: Clock },
  in_progress: { label: 'En Progreso', color: 'accent', icon: ShieldAlert },
  resolved: { label: 'Resuelto', color: 'success', icon: CheckCircle },
};

const AdminHistory = () => {
  const { data, loading, error } = useAsyncData(() => listReports({ limit: 100 }), []);
  const reports = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.items) ? data.items : []));
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reports
      .filter((report) => {
        const matchesSearch = !term || [
          report.title,
          report.category,
          report.location,
          report.reportId,
          report.reporterName,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

        const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reports, search, statusFilter, categoryFilter]);

  const categoryOptions = useMemo(() => {
    const standardCategories = ['incendio', 'inundacion', 'delito', 'accidente', 'bloqueo', 'otros'];
    const dbCategories = reports.map((report) => report.category).filter(Boolean);
    const set = new Set([...standardCategories, ...dbCategories]);
    return Array.from(set).map((category) => ({ value: category, label: getCategoryMeta(category).label || category }));
  }, [reports]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary font-display flex items-center gap-2">
            Historial de Reportes
          </h2>
          <p className="text-text-secondary text-sm mt-1">Registro inmutable de todos los incidentes (incluidos cancelados).</p>
        </div>
        <div className="w-full md:w-64">
          <Input 
            placeholder="Buscar por ID o título..." 
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-border-light bg-secondary-bg/50 px-4 py-2 text-sm">
          <option value="all">Todos los estados</option>
          {Object.keys(statusConfig).map((key) => (
            <option key={key} value={key}>{statusConfig[key].label}</option>
          ))}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-xl border border-border-light bg-secondary-bg/50 px-4 py-2 text-sm">
          <option value="all">Todas las categorías</option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardContent className="p-0 flex-1 overflow-auto">
          {error && (
            <div className="p-12 text-center flex flex-col items-center text-danger">
              <XCircle className="h-8 w-8 mb-4" />
              <p>Error al cargar el historial: {error}</p>
            </div>
          )}
          {loading && !error ? (
            <div className="p-4 space-y-3">
              <ReportListItemSkeleton />
              <ReportListItemSkeleton />
              <ReportListItemSkeleton />
              <ReportListItemSkeleton />
              <ReportListItemSkeleton />
            </div>
          ) : !error && (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted sticky top-0 z-10 border-b border-border-light shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold text-text-secondary">ID / Fecha</th>
                  <th className="px-6 py-4 font-semibold text-text-secondary">Incidente</th>
                  <th className="px-6 py-4 font-semibold text-text-secondary">Autor</th>
                  <th className="px-6 py-4 font-semibold text-text-secondary">Validación Social</th>
                  <th className="px-6 py-4 font-semibold text-text-secondary text-right">Estado Oficial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light bg-primary-bg">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-text-muted">No se encontraron reportes.</td>
                  </tr>
                ) : (
                  filteredReports.map(report => {
                    const st = statusConfig[report.status] || statusConfig.pending;
                    const StatusIcon = st.icon;
                    const upvotes = Array.isArray(report.upvotes) ? report.upvotes.length : 0;
                    const downvotes = Array.isArray(report.downvotes) ? report.downvotes.length : 0;
                    
                    return (
                      <tr key={report.reportId} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-xs text-text-primary font-semibold">{report.reportId}</p>
                          <p className="text-[11px] text-text-muted mt-0.5">{new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-text-primary">{report.title || report.category}</p>
                          <p className="text-xs text-text-muted mt-0.5 truncate max-w-[250px]">{report.location}</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-text-secondary">
                          <p className="font-semibold text-text-primary">{report.reporterName || report.reporter || 'Ciudadano'}</p>
                          <p className="text-[11px] text-text-muted">{report.userId?.slice(0, 8)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-4">
                            <span className="flex items-center gap-1.5 text-success font-bold text-xs"><ThumbsUp className="h-3.5 w-3.5"/> {upvotes}</span>
                            <span className="flex items-center gap-1.5 text-danger font-bold text-xs"><ThumbsDown className="h-3.5 w-3.5"/> {downvotes}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Badge variant={st.color} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px]">
                            <StatusIcon className="h-3.5 w-3.5" />
                            {st.label}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHistory;
