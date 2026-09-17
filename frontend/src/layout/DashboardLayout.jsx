import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PlusCircle, FileText, Bell, User, Settings, HelpCircle, Map as MapIcon } from 'lucide-react';
import Sidebar from '../components/common/Sidebar';
import TopHeader from '../components/common/TopHeader';

const citizenLinks = [
  { path: '/dashboard', label: 'Panel Principal', icon: Home, exact: true },
  { path: '/radar', label: 'Radar Ciudadano', icon: MapIcon, exact: false },
  { path: '/report/new', label: 'Nuevo Reporte', icon: PlusCircle, exact: false },
  { path: '/reports', label: 'Mis Reportes', icon: FileText, exact: false },
  { path: '/notifications', label: 'Notificaciones', icon: Bell, exact: false },
  { path: '/profile', label: 'Mi Perfil', icon: User, exact: false },
  { path: '/settings', label: 'Configuración', icon: Settings, exact: false },
  { path: '/help', label: 'Ayuda', icon: HelpCircle, exact: false },
];

const pageTitles = {
  '/dashboard': 'Panel Ciudadano',
  '/radar': 'Radar de la Comunidad',
  '/report/new': 'Crear Reporte',
  '/reports': 'Mis Reportes',
  '/notifications': 'Notificaciones',
  '/profile': 'Mi Perfil',
  '/settings': 'Configuración',
  '/help': 'Centro de Ayuda',
};

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname;
    if (pageTitles[path]) return pageTitles[path];
    if (path.startsWith('/reports/')) return 'Detalles del Reporte';
    return 'Halo';
  };

  return (
    <div className="flex h-screen bg-primary-bg overflow-hidden" style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>
      <Sidebar links={citizenLinks} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-300">
        <TopHeader onMenuClick={() => setIsSidebarOpen(true)} title={getTitle()} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
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

export default DashboardLayout;
