import React, { useMemo, useState, useEffect } from 'react';
import { Search, CheckCircle, Clock, ShieldAlert, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { listReports, resolveReport, deleteReport, updateReportStatus } from '../../services/reportsApi';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatReportForList } from '../../utils/reportFormatters';
import { getApiErrorMessage } from '../../services/api';
import { KanbanColumnSkeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

// ─── UTILS & COMPONENTS ─────────────────────────────────────────────────────────

const priorityBadge = (p) => {
  const map = { 'Crítica': 'danger', 'Alta': 'warning', 'Media': 'accent', 'Baja': 'muted' };
  return <Badge variant={map[p] || 'default'}>{p}</Badge>;
};

// Sortable Item Component
const SortableReportCard = ({ id, report, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mb-3">
      <ReportCard report={report} onDelete={onDelete} />
    </div>
  );
};

// UI for the Report Card
const ReportCard = ({ report, isOverlay, onDelete }) => {
  return (
    <Card className={`border-border-light shadow-sm hover:shadow-md transition-shadow relative group ${isOverlay ? 'scale-105 shadow-xl rotate-2 cursor-grabbing' : ''}`}>
      {onDelete && (
        <button 
          onPointerDown={(e) => { e.stopPropagation(); onDelete(report.id); }}
          className="absolute top-3 right-3 p-1.5 rounded-md bg-danger/10 text-danger opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger hover:text-white z-10"
          title="Eliminar reporte"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2 pr-8">
          <div className="flex items-center gap-2">
            <span className="text-xl">{report.emoji}</span>
            <p className="font-semibold text-text-primary text-sm line-clamp-1">{report.cat}</p>
          </div>
          {priorityBadge(report.priority)}
        </div>
        <p className="text-xs text-text-muted font-mono mb-2">ID: {report.id}</p>
        <p className="text-xs text-text-secondary line-clamp-2 mb-3">{report.loc}</p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-light">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
              {report.reporter[0]}
            </div>
            <span className="text-[10px] text-text-muted">{report.time}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Droppable Column
const DroppableColumn = ({ id, children }) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="flex-1 rounded-2xl bg-secondary-bg/30 p-3 border border-border-light/50 min-h-[150px] flex flex-col">
      {children}
    </div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────

const AdminReports = () => {
  const [search, setSearch] = useState('');
  const { data, loading } = useAsyncData(() => listReports({ limit: 100 }), []);
  
  // Kanban columns state
  const [columns, setColumns] = useState({
    pending: [],
    in_progress: [],
    resolved: []
  });

  const [activeId, setActiveId] = useState(null);
  const [activeOriginalContainer, setActiveOriginalContainer] = useState(null);

  // Initialize columns when data loads
  useEffect(() => {
    if (data?.data) {
      const formatted = data.data.map(r => {
        const f = formatReportForList(r);
        return {
          id: f.id,
          cat: f.title,
          emoji: f.emoji,
          loc: f.location,
          time: f.date,
          statusRaw: f.statusRaw, // 'new', 'dispatched', 'resolved'
          priority: f.priority,
          reporter: f.reporter || r.userId?.slice(0, 8) || 'Ciudadano',
        };
      });

      setColumns({
        pending: formatted.filter(r => ['new', 'pending', 'verified'].includes(r.statusRaw)),
        in_progress: formatted.filter(r => ['dispatched', 'in_progress'].includes(r.statusRaw)),
        resolved: formatted.filter(r => r.statusRaw === 'resolved')
      });
    }
  }, [data]);

  // Setup DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = (id) => {
    if (id in columns) return id;
    return Object.keys(columns).find((key) => columns[key].find((item) => item.id === id));
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setActiveOriginalContainer(findContainer(event.active.id));
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setColumns((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex((i) => i.id === activeId);
      const overIndex = overId in prev ? overItems.length : overItems.findIndex((i) => i.id === overId);

      return {
        ...prev,
        [activeContainer]: [...prev[activeContainer].filter((item) => item.id !== activeId)],
        [overContainer]: [
          ...prev[overContainer].slice(0, overIndex),
          activeItems[activeIndex],
          ...prev[overContainer].slice(overIndex, prev[overContainer].length),
        ],
      };
    });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    const activeContainer = findContainer(active.id);
    
    if (!over) {
      setActiveId(null);
      setActiveOriginalContainer(null);
      return;
    }
    
    const overContainer = findContainer(over.id);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const activeIndex = columns[activeContainer].findIndex((i) => i.id === active.id);
      const overIndex = columns[overContainer].findIndex((i) => i.id === over.id);

      if (activeIndex !== overIndex) {
        setColumns((prev) => ({
          ...prev,
          [overContainer]: arrayMove(prev[overContainer], activeIndex, overIndex),
        }));
      }
    }

    // Sincronización con Backend
    if (activeOriginalContainer && overContainer && activeOriginalContainer !== overContainer) {
      try {
        if (overContainer === 'resolved') {
          await resolveReport(active.id);
        } else {
          await updateReportStatus(active.id, overContainer);
        }
      } catch (err) {
        toast.error('Error al actualizar reporte: ' + getApiErrorMessage(err));
      }
    }
    
    setActiveId(null);
    setActiveOriginalContainer(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este reporte de forma permanente?')) return;
    try {
      await deleteReport(id);
      setColumns((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          next[key] = next[key].filter(r => r.id !== id);
        });
        return next;
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const activeItem = activeId ? Object.values(columns).flat().find(r => r.id === activeId) : null;

  const columnConfig = {
    pending: { title: 'Pendientes', icon: <Clock className="h-5 w-5 text-warning" />, color: 'bg-warning/10 border-warning/20' },
    in_progress: { title: 'En Progreso', icon: <ShieldAlert className="h-5 w-5 text-accent" />, color: 'bg-accent/10 border-accent/20' },
    resolved: { title: 'Resueltos', icon: <CheckCircle className="h-5 w-5 text-success" />, color: 'bg-success/10 border-success/20' }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary font-display flex items-center gap-2">
            Tablero Kanban de Reportes
          </h2>
          <p className="text-text-secondary text-sm mt-1">Arrastra los reportes para actualizar su estado al instante.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Input 
            placeholder="Buscar reporte..." 
            leftIcon={<Search className="h-4 w-4" />} 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[600px]">
          <KanbanColumnSkeleton />
          <KanbanColumnSkeleton />
          <KanbanColumnSkeleton />
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[600px]">
            {Object.keys(columns).map((colKey) => {
              const conf = columnConfig[colKey];
              const items = columns[colKey].filter(r => 
                search === '' || 
                r.cat.toLowerCase().includes(search.toLowerCase()) || 
                r.id.toLowerCase().includes(search.toLowerCase())
              );

              return (
                <div key={colKey} className="flex flex-col h-full">
                  <div className={`flex items-center gap-2 p-3 mb-4 rounded-xl border ${conf.color}`}>
                    {conf.icon}
                    <h3 className="font-bold text-sm">{conf.title}</h3>
                    <Badge variant="muted" className="ml-auto bg-white/50">{items.length}</Badge>
                  </div>

                  <DroppableColumn id={colKey}>
                    <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                      {items.map((report) => (
                        <SortableReportCard key={report.id} id={report.id} report={report} onDelete={handleDelete} />
                      ))}
                    </SortableContext>
                    {items.length === 0 && (
                      <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-xl">
                        <span className="text-xs font-medium text-text-muted">Arrastra reportes aquí</span>
                      </div>
                    )}
                  </DroppableColumn>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeItem ? <ReportCard report={activeItem} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};

export default AdminReports;
