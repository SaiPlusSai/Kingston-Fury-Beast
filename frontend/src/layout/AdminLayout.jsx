import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FileText, Map, Inbox, Settings, User } from 'lucide-react';
import Sidebar from '../components/common/Sidebar';
import TopHeader from '../components/common/TopHeader';

const adminLinks = [
  { path: '/admin', label: 'Dashboard Analítico', icon: LayoutDashboard, exact: true },
  { path: '/admin/reports', label: 'Gestión de Reportes', icon: FileText, exact: false },
  { path: '/admin/history', label: 'Historial de Reportes', icon: FileText, exact: false },
  { path: '/admin/map', label: 'Mapa de Monitoreo', icon: Map, exact: false },
  { path: '/admin/inbox', label: 'Bandeja de Soporte', icon: Inbox, exact: false },
  { path: '/admin/profile', label: 'Mi Perfil', icon: User, exact: false },
  { path: '/admin/settings', label: 'Configuración', icon: Settings, exact: false },
];

const pageTitles = {
  '/admin': 'Dashboard Analítico',
  '/admin/reports': 'Gestión de Emergencias',
  '/admin/history': 'Historial de Reportes',
  '/admin/map': 'Monitoreo en Tiempo Real',
  '/admin/inbox': 'Bandeja de Soporte',
  '/admin/profile': 'Mi Perfil',
  '/admin/settings': 'Configuración',
};

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getTitle = () => pageTitles[location.pathname] || 'Administración Halo';

  return (
    <div className="flex h-screen bg-primary-bg overflow-hidden" style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>
      <Sidebar
        links={adminLinks}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-300">
        <TopHeader onMenuClick={() => setIsSidebarOpen(true)} title={getTitle()} />

        {/* Map gets a full-bleed, overflow-hidden surface; other pages keep padding. */}
        <main className={`flex-1 min-h-0 relative ${location.pathname === '/admin/map' ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 sm:p-6 lg:p-8'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

