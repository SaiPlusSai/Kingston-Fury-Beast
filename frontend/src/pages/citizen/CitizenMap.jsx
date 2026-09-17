import React, { useMemo, useState } from 'react';
import { ShieldAlert, ThumbsUp, ThumbsDown, CheckCircle, Crosshair, Map as MapIcon, Maximize, Clock, MapPin, User, ArrowRight, Image as ImageIcon, ChevronLeft, ChevronRight, Filter, SlidersHorizontal, Trash2, Flame, Waves, Car, Construction, MoreHorizontal, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { getMapMarkers } from '../../services/locationApi';
import { voteReport, getPublicReport } from '../../services/reportsApi';
import { getApiErrorMessage } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';
import { useAsyncData } from '../../hooks/useAsyncData';
import AwsLocationMap from '../../components/common/AwsLocationMap';
import toast from 'react-hot-toast';

const CATEGORY_MAP = {
  incendio: {
    label: 'Incendio',
    color: '#f97316', // Orange
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`
  },
  inundacion: {
    label: 'Inundación',
    color: '#3b82f6', // Blue
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C5.8 7 7 5.6 8.5 5.6c1.5 0 2.7 1.4 4 1.4 1.3 0 2.5-1.4 4-1.4 1.5 0 2.7 1.4 4 1.4M2 12c.6.5 1.2 1 2.5 1 1.3 0 2.5-1.4 4-1.4 1.5 0 2.7 1.4 4 1.4 1.3 0 2.5-1.4 4-1.4 1.5 0 2.7 1.4 4 1.4M2 18c.6.5 1.2 1 2.5 1 1.3 0 2.5-1.4 4-1.4 1.5 0 2.7 1.4 4 1.4 1.3 0 2.5-1.4 4-1.4 1.5 0 2.7 1.4 4 1.4"/></svg>`
  },
  delito: {
    label: 'Delito / Robo',
    color: '#ef4444', // Red
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`
  },
  accidente: {
    label: 'Accidente de Tránsito',
    color: '#0ea5e9', // Celeste / Sky Blue
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`
  },
  bloqueo: {
    label: 'Bloqueo Vial',
    color: '#f59e0b', // Amber
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="8" rx="1"/><path d="M17 14v7"/><path d="M7 14v7"/><path d="M17 3v3"/><path d="M7 3v3"/><path d="M10 14 2.3 6.3"/><path d="M14 6 21.7 13.7"/><path d="M18 14 10.3 6.3"/><path d="M14 14 6.3 6.3"/></svg>`
  },
  otros: {
    label: 'Otro',
    color: '#4c9f70', // Teal/Green
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
  }
};

const CitizenMap = () => {
  const { data, loading, refetch } = usePolling(() => getMapMarkers(), [], 15000);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [voting, setVoting] = useState(false);
  const [votedMap, setVotedMap] = useState({});

  // Filtrar solo los relevantes para el ciudadano (no cancelados)
  const markers = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.markers || [];
    return list.map((m) => {
      const reportId = m.id || m.reportId;
      const upvotesCount = m.upvotesCount || 0;
      const status = (m.status === 'verified' || upvotesCount >= 3) ? 'verified' : (m.status || 'pending');
      return {
        id: reportId,
        title: m.title || m.category || 'Incidente',
        category: m.category,
        priority: m.priority || 'medium',
        status,
        lat: m.lat ?? m.latitude,
        lng: m.lng ?? m.longitude,
        upvotes: upvotesCount,
        downvotes: m.downvotesCount || 0,
        createdAt: m.createdAt || m.created_at || new Date().toISOString(),
        description: m.description || '',
      };
    }).filter(m => 
      m.lat != null && m.lng != null && m.status !== 'cancelled' && m.status !== 'resolved'
    );
  }, [data]);

  const handleVote = async (reportId, type) => {
    setVoting(true);
    try {
      await voteReport(reportId, type);
      setVotedMap(prev => ({ ...prev, [reportId]: type }));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setVoting(false);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mapCenter, setMapCenter] = useState([-63.18, -17.78]);
  const [mapZoom, setMapZoom] = useState(13);
  const [centerOnUser, setCenterOnUser] = useState(true);
  const [showLatestPanel, setShowLatestPanel] = useState(true);

  const latestReports = useMemo(() => {
    return [...markers]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  }, [markers]);

  const handleNotificationClick = (report) => {
    setCenterOnUser(false);
    if (report.lat != null && report.lng != null) {
      setMapCenter([report.lng, report.lat]);
      setMapZoom(16);
    }
    setSelectedReport(report);
    setShowDetails(false);
  };

  const filteredMarkers = useMemo(() => {
    return markers.filter((marker) => {
      // 1. Filtrar por categoría
      if (selectedCategory !== 'all') {
        const isMatch = marker.category?.toLowerCase() === selectedCategory.toLowerCase();
        if (!isMatch) return false;
      }
      
      // 2. Filtrar por estado / urgencia
      if (selectedStatus === 'critical') {
        if (marker.priority !== 'critical') return false;
      } else if (selectedStatus === 'verified') {
        if (marker.status !== 'verified') return false;
      } else if (selectedStatus === 'pending') {
        if (marker.status === 'verified') return false;
      }
      
      return true;
    });
  }, [markers, selectedCategory, selectedStatus]);

  const markerPoints = useMemo(() => filteredMarkers.map((marker) => {
    const categoryKey = marker.category?.toLowerCase() || 'otros';
    const catConfig = CATEGORY_MAP[categoryKey] || CATEGORY_MAP['otros'];
    
    // Generar el HTML para el marcador
    const markerHtml = `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <!-- Inner circle with category icon -->
        <div style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: ${catConfig.color}; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25); color: white;">
          ${catConfig.iconSvg}
        </div>
        
        <!-- Outer critical pulse -->
        ${marker.priority === 'critical' ? `
          <div style="position: absolute; inset: 0; border-radius: 50%; border: 3px solid ${catConfig.color}; opacity: 0.7; animation: pulseRing 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite; pointer-events: none; z-index: -1;"></div>
        ` : ''}

        <!-- Community Verification Badge -->
        ${marker.status === 'verified' ? `
          <div style="position: absolute; top: -1px; right: -1px; width: 12px; height: 12px; border-radius: 50%; background-color: #10b981; border: 1.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
            <svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        ` : ''}
      </div>
    `;

    return {
      latitude: marker.lat,
      longitude: marker.lng,
      html: markerHtml,
      rawData: marker,
    };
  }), [filteredMarkers]);

  return (
    <div className="relative h-full min-h-[calc(100vh-8rem)] w-full overflow-hidden bg-primary-bg rounded-3xl border border-border-light shadow-sm">
      
      {/* Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
        {/* Left card: visible on desktop, hidden on mobile */}
        <div className="hidden md:block bg-[color-mix(in_srgb,var(--color-card-bg)_95%,transparent)] backdrop-blur-md rounded-2xl shadow-lg border border-border p-4 pointer-events-auto w-full max-w-sm">
          <h3 className="font-bold text-text-primary font-display mb-1 flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <MapIcon className="h-4 w-4 text-accent" />
            </span>
            Radar de la Comunidad
          </h3>
          <p className="text-xs text-text-secondary">Valida reportes para ayudar a la comunidad y gana puntos de confianza.</p>
          
          {/* Incident Categories Legend */}
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-border/40 pt-2.5 text-xs text-text-muted">
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#f97316]"></span> Incendio</div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#3b82f6]"></span> Inundación</div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#ef4444]"></span> Delito / Robo</div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#0ea5e9]"></span> Accidente</div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#f59e0b]"></span> Bloqueo Vial</div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#4c9f70]"></span> Otro</div>
          </div>
          
          {/* States Legend */}
          <div className="mt-2.5 flex items-center gap-3 text-xs text-text-muted border-t border-border/40 pt-2">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
              </span>
              Crítico / Urgente
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-4 w-4 rounded-full bg-[#10b981] border border-white flex items-center justify-center text-white scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Verificado vecinal
            </div>
          </div>

          {/* Filters Controls (Desktop) */}
          <div className="mt-3.5 pt-3.5 border-t border-border/40 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
                <SlidersHorizontal className="h-3 w-3 text-primary" /> Filtros Activos
              </span>
              {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
                <button 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                  }}
                  className="text-[10px] font-bold text-danger hover:underline flex items-center gap-0.5"
                >
                  <Trash2 className="h-2.5 w-2.5" /> Limpiar
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-[11px] font-semibold bg-secondary-bg/60 border border-border-light rounded-xl px-2.5 py-1.5 text-text-primary outline-none focus:border-primary transition-colors cursor-pointer w-full"
              >
                <option value="all">Todas categorías</option>
                <option value="incendio">Incendio</option>
                <option value="inundacion">Inundación</option>
                <option value="delito">Delito / Robo</option>
                <option value="accidente">Accidente</option>
                <option value="bloqueo">Bloqueo Vial</option>
                <option value="otros">Otros</option>
              </select>
              
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-[11px] font-semibold bg-secondary-bg/60 border border-border-light rounded-xl px-2.5 py-1.5 text-text-primary outline-none focus:border-primary transition-colors cursor-pointer w-full"
              >
                <option value="all">Todos los estados</option>
                <option value="critical">Críticos</option>
                <option value="verified">Verificados</option>
                <option value="pending">Pendientes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile floating button */}
        <div className="md:hidden flex gap-2 pointer-events-auto">
          <Button 
            variant="secondary" 
            className="shadow-md bg-[color-mix(in_srgb,var(--color-card-bg)_90%,transparent)] backdrop-blur-sm font-bold text-xs flex items-center gap-1.5 rounded-full py-2.5 px-4 border border-border-light/80"
            onClick={() => setShowMobileFilters(true)}
          >
            <Filter className="h-4 w-4 text-primary" />
            Filtros y Leyenda
            {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse ml-0.5" />
            )}
          </Button>
        </div>

        <div className="flex flex-col gap-2 pointer-events-auto">
          <Button 
            variant="secondary" 
            size="icon" 
            className="shadow-md bg-[color-mix(in_srgb,var(--color-card-bg)_90%,transparent)] backdrop-blur-sm"
            onClick={() => setCenterOnUser(true)}
          >
            <Crosshair className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Floating Latest Incidents Panel */}
      <div className="absolute bottom-24 right-4 z-20 flex flex-col-reverse items-end gap-2 max-w-[280px] sm:max-w-xs w-full pointer-events-none">
        {/* Toggle Button */}
        <button
          onClick={() => setShowLatestPanel(!showLatestPanel)}
          className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-card-bg)_95%,transparent)] backdrop-blur-md shadow-md border border-border-light text-[10px] sm:text-xs font-bold text-text-primary hover:bg-border-light transition-all"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          {showLatestPanel ? 'Ocultar Recientes' : '3 Recientes'}
        </button>

        {/* Collapsible Panel */}
        <AnimatePresence>
          {showLatestPanel && latestReports.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className="pointer-events-auto flex flex-col gap-2.5 w-full"
            >
              {latestReports.map((report) => {
                const categoryKey = report.category?.toLowerCase() || 'otros';
                const catConfig = CATEGORY_MAP[categoryKey] || CATEGORY_MAP['otros'];
                const formattedTime = new Date(report.createdAt).toLocaleTimeString('es-BO', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <motion.div
                    key={report.id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    onClick={() => handleNotificationClick(report)}
                    className="bg-[color-mix(in_srgb,var(--color-card-bg)_95%,transparent)] backdrop-blur-md rounded-2xl p-3 border border-white/40 shadow-lg cursor-pointer flex gap-3 hover:shadow-xl transition-all"
                  >
                    {/* Incident Icon */}
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: catConfig.color }}
                      dangerouslySetInnerHTML={{ __html: catConfig.iconSvg }}
                    />
                    
                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                          {catConfig.label}
                        </span>
                        <span className="text-[9px] font-semibold text-text-muted flex-shrink-0">
                          {formattedTime}
                        </span>
                      </div>
                      <h4 className="font-bold text-text-primary text-xs truncate leading-tight mt-0.5">
                        {report.title}
                      </h4>
                      <p className="text-[10px] text-text-secondary truncate mt-0.5">
                        {report.description || 'Sin descripción'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map */}
      <AwsLocationMap 
        centerOnUserLocation={centerOnUser}
        className="absolute inset-0"
        center={mapCenter}
        zoom={mapZoom}
        markers={markerPoints}
        showNavigation={false}
        onMarkerClick={(markerData) => {
          setSelectedReport(markerData);
          setShowDetails(false);
          setCenterOnUser(false);
          if (markerData.lat != null && markerData.lng != null) {
            setMapCenter([markerData.lng, markerData.lat]);
          }
        }}
      />

      {/* Popup Validation UI */}
      <AnimatePresence>
        {selectedReport && !showDetails && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4 pointer-events-auto"
          >
            <div className="bg-[color-mix(in_srgb,var(--color-card-bg)_95%,transparent)] backdrop-blur-xl rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.15)] border-0 p-5">
              <ReportPopupContent 
                reportId={selectedReport.id} 
                onClose={() => setSelectedReport(null)} 
                votedMap={votedMap} 
                onVote={handleVote} 
                voting={voting}
                onShowDetails={() => setShowDetails(true)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Details Modal */}
      <AnimatePresence>
        {showDetails && selectedReport && (
          <ReportDetailsModal 
            reportId={selectedReport.id} 
            onClose={() => setShowDetails(false)}
            votedMap={votedMap}
            onVote={handleVote}
            voting={voting}
          />
        )}
      </AnimatePresence>

      {/* Mobile Bottom Sheet Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
            {/* Panel */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-card-bg)] rounded-t-[2rem] p-6 shadow-2xl border-t border-border/60 md:hidden max-h-[85vh] overflow-y-auto flex flex-col pointer-events-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-text-primary font-display flex items-center gap-2 text-lg">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                  Filtros y Leyenda
                </h3>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="h-8 w-8 rounded-full bg-secondary-bg flex items-center justify-center font-bold text-text-secondary hover:bg-border transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Legend Grid */}
              <div className="mb-5 bg-secondary-bg/30 p-4 rounded-2xl border border-border-light">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2.5">Tipos de Incidentes</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-text-secondary">
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#f97316]"></span> Incendio</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#3b82f6]"></span> Inundación</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#ef4444]"></span> Delito / Robo</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#0ea5e9]"></span> Accidente</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#f59e0b]"></span> Bloqueo Vial</div>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#4c9f70]"></span> Otro</div>
                </div>
                
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mt-4 mb-2.5">Estados</h4>
                <div className="flex flex-col gap-2 text-xs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger"></span>
                    </span>
                    Urgente / Crítico
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-4.5 w-4.5 rounded-full bg-[#10b981] flex items-center justify-center text-white scale-90 border border-white" style={{ width: '18px', height: '18px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                    Verificado por la comunidad
                  </div>
                </div>
              </div>

              {/* Filters Controls */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Filtrar por Categoría</label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-sm font-semibold bg-secondary-bg border border-border rounded-xl px-3 py-3 text-text-primary outline-none focus:border-primary transition-colors"
                  >
                    <option value="all">Todas las categorías</option>
                    <option value="incendio">Incendio</option>
                    <option value="inundacion">Inundación</option>
                    <option value="delito">Delito / Robo</option>
                    <option value="accidente">Accidente de Tránsito</option>
                    <option value="bloqueo">Bloqueo Vial</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Filtrar por Estado / Urgencia</label>
                  <select 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full text-sm font-semibold bg-secondary-bg border border-border rounded-xl px-3 py-3 text-text-primary outline-none focus:border-primary transition-colors"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="critical">Críticos / Urgentes</option>
                    <option value="verified">Verificados vecinales</option>
                    <option value="pending">Requieren Validación</option>
                  </select>
                </div>

                {/* Reset button if active */}
                {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
                  <Button 
                    variant="danger" 
                    className="w-full rounded-xl py-3 font-bold mt-2" 
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedStatus('all');
                    }}
                    leftIcon={<Trash2 className="h-4 w-4" />}
                  >
                    Limpiar Filtros
                  </Button>
                )}
                
                <Button 
                  variant="primary" 
                  className="w-full rounded-xl py-3 font-bold mt-2 animate-pulse" 
                  onClick={() => setShowMobileFilters(false)}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const ReportPopupContent = ({ reportId, onClose, votedMap, onVote, voting, onShowDetails }) => {
  const { data: report, loading } = useAsyncData(() => getPublicReport(reportId), [reportId]);

  if (loading || !report) {
    return <div className="p-4 text-center text-sm text-text-muted">Cargando detalles del reporte...</div>;
  }

  const upvotes = Array.isArray(report.upvotes) ? report.upvotes.length : 0;
  const downvotes = Array.isArray(report.downvotes) ? report.downvotes.length : 0;

  return (
    <>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={report.priority === 'critical' ? 'danger' : 'warning'} dot>
              {report.status === 'verified' ? 'Verificado' : 'Requiere Validación'}
            </Badge>
            {(upvotes > 0 || downvotes > 0) && (
              <div className="flex items-center gap-2 text-[10px] font-bold bg-secondary-bg px-2 py-0.5 rounded-full border border-border">
                {upvotes > 0 && <span className="text-success flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {upvotes}</span>}
                {downvotes > 0 && <span className="text-danger flex items-center gap-1"><ThumbsDown className="h-3 w-3" /> {downvotes}</span>}
              </div>
            )}
          </div>
          <h4 className="font-bold text-text-primary text-lg leading-tight">{report.title}</h4>
          <p className="text-xs text-text-muted font-mono mt-1">ID: {report.reportId.slice(0,8)}</p>
        </div>
        <button 
          onClick={onClose}
          className="h-8 w-8 rounded-full bg-secondary-bg flex items-center justify-center hover:bg-border transition-colors text-text-secondary flex-shrink-0"
        >
          ✕
        </button>
      </div>

      <div className="bg-secondary-bg/50 p-3 rounded-xl mb-4 border border-border-light text-sm">
        <p className="text-text-primary mb-2 line-clamp-3">{report.description || 'Sin descripción'}</p>
        
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-light">
          <div className="h-6 w-6 bg-primary/20 rounded-full flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0 overflow-hidden">
            {report.reporterAvatarUrl ? (
              <img src={report.reporterAvatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              report.reporterName?.[0] || 'C'
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-text-muted">Reportado por <span className="font-medium text-text-secondary">{report.reporterName || 'Ciudadano'}</span></span>
            <div className="mt-0.5">
              <Badge variant={report.reporterTrustScore >= 80 ? 'success' : report.reporterTrustScore < 20 ? 'danger' : 'accent'} className="text-[9px] py-0 px-1.5 h-3.5 border-none">
                {report.reporterTrustScore >= 80 ? 'Ciudadano Ejemplar' : report.reporterTrustScore < 20 ? 'En Observación' : 'Ciudadano Activo'} ({report.reporterTrustScore ?? 50} pts)
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {votedMap[report.reportId] ? (
        <div className="bg-success/10 border border-success/20 rounded-xl p-3 flex items-center gap-3 text-success">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">¡Gracias por validar! Tu Trust Score subirá.</span>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">¿Sigues viendo este incidente en esta ubicación?</p>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="success" 
              isLoading={voting}
              onClick={() => onVote(report.reportId, 'upvote')}
              leftIcon={<ThumbsUp className="h-4 w-4" />}
            >
              Sí, está ahí
            </Button>
            <Button 
              variant="danger" 
              isLoading={voting}
              onClick={() => onVote(report.reportId, 'downvote')}
              leftIcon={<ThumbsDown className="h-4 w-4" />}
            >
              Es falso
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border-light">
        <Button variant="secondary" className="w-full text-xs font-semibold bg-white/50 hover:bg-white" onClick={onShowDetails} rightIcon={<Maximize className="h-3.5 w-3.5" />}>
          Ver más detalles
        </Button>
      </div>
    </>
  );
};

const ReportDetailsModal = ({ reportId, onClose, votedMap, onVote, voting }) => {
  const { data: report, loading } = useAsyncData(() => getPublicReport(reportId), [reportId]);
  const [expandedImage, setExpandedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (loading || !report) return null;

  const upvotes = Array.isArray(report.upvotes) ? report.upvotes.length : 0;
  const downvotes = Array.isArray(report.downvotes) ? report.downvotes.length : 0;

  // Parse images if it's an array or comma separated string
  let images = [];
  if (report.images && Array.isArray(report.images)) {
    images = report.images;
  } else if (report.imageUrl) {
    if (report.imageUrl.includes(',')) {
      images = report.imageUrl.split(',').map(url => url.trim());
    } else {
      images = [report.imageUrl];
    }
  }

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getHeaderGradient = () => {
    if (report.priority === 'critical') return 'from-red-600 via-red-500 to-rose-600';
    
    const cat = (report.category || '').toLowerCase();
    if (cat.includes('incendio')) {
      return 'from-orange-600 via-orange-500 to-red-500';
    }
    if (cat.includes('inundacion') || cat.includes('inundación')) {
      return 'from-blue-600 via-blue-500 to-indigo-600';
    }
    if (cat.includes('delito') || cat.includes('robo') || cat.includes('asalto') || cat.includes('hurto')) {
      return 'from-red-600 via-red-500 to-rose-600';
    }
    if (cat.includes('accidente') || cat.includes('choque')) {
      return 'from-sky-600 via-sky-500 to-cyan-500'; // Celeste
    }
    if (cat.includes('bloqueo') || cat.includes('vial') || cat.includes('tránsito')) {
      return 'from-amber-600 via-amber-500 to-yellow-500';
    }
    
    return 'from-emerald-600 via-emerald-500 to-teal-600';
  };

  const headerGradient = getHeaderGradient();
  const isVerified = report.status === 'verified' || upvotes >= 3;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: 50, scale: 0.95 }} 
          animate={{ y: 0, scale: 1 }} 
          exit={{ y: 20, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          className="w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] bg-card-bg sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border-0 outline-none ring-0"
        >
          {/* Header Dinámico (Sin Imagen) */}
          <div className={`relative pt-12 sm:pt-8 pb-6 px-6 sm:px-8 w-full bg-gradient-to-br ${headerGradient} flex-shrink-0 overflow-hidden`}>
            <div className="absolute top-[-50%] right-[-10%] w-[80%] h-[150%] bg-white/10 rounded-full blur-3xl mix-blend-overlay" />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors text-white border border-white/20 shadow-lg"
            >
              ✕
            </button>
            <div className="relative z-20 flex justify-between items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge 
                    variant={isVerified ? 'success' : report.priority === 'critical' ? 'danger' : 'warning'} 
                    className={`shadow-sm border-white/20 backdrop-blur-md text-white ${
                      isVerified ? 'bg-success/30 border-success/30' : 'bg-white/20'
                    }`}
                  >
                    {isVerified ? '✓ Verificado por la comunidad' : 'Requiere Validación'}
                  </Badge>
                  <span className="text-[10px] font-bold text-white bg-white/20 px-2.5 py-1 rounded-full border border-white/20 uppercase tracking-widest backdrop-blur-sm">
                    {CATEGORY_MAP[report.category?.toLowerCase()]?.label || report.category || 'Incidente'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-display leading-tight tracking-tight drop-shadow-md">{report.title}</h2>
              </div>
              <div className="hidden sm:flex bg-black/20 backdrop-blur-md rounded-xl p-2.5 items-center gap-4 border border-white/20 text-white font-bold text-sm shadow-xl">
                <span className="flex items-center gap-1.5"><ThumbsUp className="h-4 w-4 text-success" /> {upvotes}</span>
                <span className="flex items-center gap-1.5"><ThumbsDown className="h-4 w-4 text-danger" /> {downvotes}</span>
              </div>
            </div>
          </div>

          {/* Content Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-7 custom-scrollbar bg-card-bg">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary-bg/50 border border-border-light shadow-sm hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">Reportado el</p>
                  <p className="text-sm font-semibold text-text-primary">{new Date(report.createdAt).toLocaleString('es-BO')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary-bg/50 border border-border-light shadow-sm hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">Ubicación</p>
                  <p className="text-sm font-semibold text-text-primary truncate">{report.location || `${report.lat}, ${report.lng}`}</p>
                </div>
              </div>
            </div>

            {/* Evidencia Fotográfica (Carrusel) */}
            {images.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" /> Evidencia Fotográfica
                </h3>
                <div className="relative w-full h-48 sm:h-72 rounded-2xl overflow-hidden bg-black group border border-border-light shadow-inner">
                  <img 
                    src={images[currentImageIndex]} 
                    alt={`Evidencia ${currentImageIndex + 1}`} 
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setExpandedImage(images[currentImageIndex])}
                  />
                  
                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button 
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                        {images.map((_, idx) => (
                          <div 
                            key={idx} 
                            className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} 
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                  <button 
                    onClick={() => setExpandedImage(images[currentImageIndex])}
                    className="absolute top-3 right-3 h-10 w-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Maximize className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary" /> Descripción del Incidente
              </h3>
              <div className="bg-secondary-bg rounded-2xl p-5 border border-border-light shadow-inner">
                <p className="text-text-primary leading-relaxed text-sm">{report.description || 'El ciudadano no proporcionó una descripción adicional para este reporte.'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Línea de Tiempo
              </h3>
              <div className="bg-secondary-bg/30 rounded-2xl p-5 border border-border-light">
                <div className="relative pl-6 space-y-6 before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-border">
                  <div className="relative">
                    <span className="absolute -left-6 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center border-4 border-card-bg shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </span>
                    <p className="text-sm font-bold text-text-primary">Reporte Creado</p>
                    <p className="text-xs text-text-secondary mt-0.5">{new Date(report.createdAt).toLocaleString('es-BO')}</p>
                  </div>
                  {report.status === 'verified' && (
                    <div className="relative">
                      <span className="absolute -left-6 h-6 w-6 rounded-full bg-success/20 flex items-center justify-center border-4 border-card-bg shadow-sm">
                        <CheckCircle className="h-3.5 w-3.5 text-success" />
                      </span>
                      <p className="text-sm font-bold text-text-primary">Validado por la Comunidad</p>
                      <p className="text-xs text-text-secondary mt-0.5">Alcanzó los votos necesarios de confianza</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center font-bold text-primary text-lg shadow-sm border border-border-light overflow-hidden">
                  {report.reporterAvatarUrl ? (
                    <img src={report.reporterAvatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    report.reporterName?.[0] || 'C'
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">Reportado por</p>
                  <p className="font-semibold text-text-primary">{report.reporterName || 'Ciudadano Anónimo'}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={report.reporterTrustScore >= 80 ? 'success' : 'accent'} className="shadow-sm font-bold px-3 py-1">
                  Trust Score: {report.reporterTrustScore ?? 50} pts
                </Badge>
              </div>
            </div>

          </div>

          {/* Footer actions */}
          <div className="p-4 sm:p-5 border-t border-border bg-secondary-bg/40 flex-shrink-0">
            {votedMap[report.reportId] ? (
              <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center justify-center gap-3 text-success shadow-sm">
                <CheckCircle className="h-6 w-6" />
                <span className="text-sm font-bold">Validación registrada exitosamente</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="success" 
                  className="flex-1 py-4 text-sm font-bold shadow-lg shadow-success/20 hover:-translate-y-0.5 transition-transform"
                  isLoading={voting}
                  onClick={() => onVote(report.reportId, 'upvote')}
                  leftIcon={<ThumbsUp className="h-5 w-5" />}
                >
                  Confirmar (Sí está ahí)
                </Button>
                <Button 
                  variant="danger" 
                  className="flex-1 py-4 text-sm font-bold shadow-lg shadow-danger/20 hover:-translate-y-0.5 transition-transform"
                  isLoading={voting}
                  onClick={() => onVote(report.reportId, 'downvote')}
                  leftIcon={<ThumbsDown className="h-5 w-5" />}
                >
                  Rechazar (Es falso)
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Lightbox Modal for Expanded Image */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8"
            onClick={() => setExpandedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 z-[80] h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/20"
              onClick={() => setExpandedImage(null)}
            >
              ✕
            </button>
            <img 
              src={expandedImage} 
              alt="Evidencia Ampliada" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CitizenMap;
