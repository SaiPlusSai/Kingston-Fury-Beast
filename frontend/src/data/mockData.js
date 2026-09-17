// Datos simulados de incidentes
export const INCIDENTS = [
  { id: 'INC-0001', title: 'Incendio en mercado central', type: 'Incendio', status: 'En Progreso', priority: 'Crítica', lat: -17.78, lng: -63.18, location: 'Mercado Central, Zona 1', reporter: 'Juan P.', date: '2026-05-18T10:23:00Z', description: 'Incendio de gran magnitud en el pabellón sur del mercado. Varias unidades de bomberos atendiendo.' },
  { id: 'INC-0002', title: 'Inundación en barrio sur', type: 'Inundación', status: 'Despachado', priority: 'Alta', lat: -17.80, lng: -63.20, location: 'Barrio Sur, Calle 4', reporter: 'Ana M.', date: '2026-05-18T09:10:00Z', description: 'Desborde de alcantarilla afecta 3 cuadras. Vehículos varados.' },
  { id: 'INC-0003', title: 'Accidente de tránsito múltiple', type: 'Accidente', status: 'Resuelto', priority: 'Alta', lat: -17.75, lng: -63.15, location: 'Av. Circunvalación km 5', reporter: 'Carlos R.', date: '2026-05-18T08:05:00Z', description: 'Colisión entre 3 vehículos. 2 personas con heridas leves evacuadas.' },
  { id: 'INC-0004', title: 'Robo a mano armada', type: 'Delito', status: 'Pendiente', priority: 'Alta', lat: -17.77, lng: -63.19, location: 'Banco Nacional, Av. Monseñor', reporter: 'Luis S.', date: '2026-05-18T11:30:00Z', description: 'Ciudadano reporta asalto en las cercanías del banco. Sospechosos huyeron.' },
  { id: 'INC-0005', title: 'Bloqueo vial por manifestación', type: 'Bloqueo vial', status: 'En Progreso', priority: 'Media', lat: -17.76, lng: -63.17, location: 'Plaza Central - Acceso Norte', reporter: 'María T.', date: '2026-05-18T12:00:00Z', description: 'Manifestantes bloquean el acceso norte a plaza central. Tráfico desviado.' },
];

// Usuarios simulados
export const USERS = [
  { id: 'USR-001', name: 'Juan Pérez', email: 'juan@email.com', role: 'citizen', reports: 12, trusted: true },
  { id: 'USR-002', name: 'Ana Martínez', email: 'ana@email.com', role: 'citizen', reports: 7, trusted: true },
  { id: 'USR-003', name: 'Admin Principal', email: 'admin@Halo.com', role: 'admin', reports: 0, trusted: true },
];

// Notificaciones simuladas
export const NOTIFICATIONS = [
  { id: 1, type: 'alert', title: 'Alerta de Inundación', message: 'Posible desborde en el Río Sur. Evite la zona.', time: 'Hace 5 min', isRead: false },
  { id: 2, type: 'update', title: 'Actualización de Reporte INC-0001', message: 'Tu reporte ha cambiado a estado: En Progreso.', time: 'Hace 2 horas', isRead: false },
  { id: 3, type: 'info', title: 'Mantenimiento Programado', message: 'La plataforma estará en mantenimiento el domingo a las 02:00 AM.', time: 'Ayer', isRead: true },
  { id: 4, type: 'success', title: 'Reporte Resuelto', message: 'El incidente INC-0003 ha sido marcado como resuelto.', time: 'Hace 2 días', isRead: true },
];

// Estadísticas de emergencia simuladas
export const EMERGENCY_STATS = {
  activeIncidents: 42,
  resolvedToday: 128,
  avgResponseTime: '14min',
  deployedUnits: 34,
  totalUnits: 50,
  criticalZones: 3,
};

// Categorías de incidentes
export const INCIDENT_CATEGORIES = [
  { value: 'incendio', label: 'Incendio', icon: '🔥', color: '#C8553D' },
  { value: 'inundacion', label: 'Inundación', icon: '🌊', color: '#3A8BC8' },
  { value: 'delito', label: 'Delito / Robo', icon: '🚨', color: '#9B59B6' },
  { value: 'accidente', label: 'Accidente de Tránsito', icon: '🚗', color: '#D4A373' },
  { value: 'bloqueo', label: 'Bloqueo Vial', icon: '🚧', color: '#D9932A' },
  { value: 'otros', label: 'Otros', icon: '📍', color: '#588157' },
];

// Testimonials
export const TESTIMONIALS = [
  { id: 1, name: 'Cdte. Roberto Álvarez', role: 'Bomberos Municipales', text: 'Halo ha reducido nuestro tiempo de respuesta en un 40%. La geolocalización precisa es invaluable en emergencias reales.' },
  { id: 2, name: 'Ing. Sandra Morales', role: 'Dirección de Tránsito', text: 'La plataforma nos da visibilidad total de los incidentes viales. Podemos coordinar mejor las unidades de desvío.' },
  { id: 3, name: 'Marcela Fuentes', role: 'Ciudadana activa', text: 'Reporté un incendio y en 10 minutos ya había bomberos en el lugar. Esta app definitivamente funciona.' },
];

// Actividad reciente para el feed
export const RECENT_ACTIVITY = [
  { id: 1, text: 'Nuevo reporte de Incendio en Zona Sur', time: 'Hace 2 min', type: 'danger' },
  { id: 2, text: 'Unidad B-14 despachada a INC-0001', time: 'Hace 5 min', type: 'warning' },
  { id: 3, text: 'INC-0003 marcado como resuelto', time: 'Hace 20 min', type: 'success' },
  { id: 4, text: 'Nueva alerta de inundación zona norte', time: 'Hace 35 min', type: 'danger' },
  { id: 5, text: 'Bloqueo vial liberado en Av. Principal', time: 'Hace 1 hora', type: 'success' },
];
