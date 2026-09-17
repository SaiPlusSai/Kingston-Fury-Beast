import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-primary-bg p-6">
    <div className="text-center max-w-md animate-fade-in">
      <div className="mx-auto w-24 h-24 rounded-2xl bg-danger/8 border border-danger/15 flex items-center justify-center mb-8 shadow-sm">
        <ShieldAlert className="h-12 w-12 text-danger" />
      </div>
      <h1 className="text-8xl font-bold font-display mb-4 text-gradient">404</h1>
      <h2 className="text-2xl font-bold text-text-primary font-display mb-3">Zona no encontrada</h2>
      <p className="text-text-secondary leading-relaxed mb-10">
        La página que buscas no existe, fue movida o el acceso no está autorizado. Verifica la URL o regresa al inicio.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/"><Button size="md" leftIcon={<Home className="h-4 w-4" />}>Ir al Inicio</Button></Link>
        <Link to="/dashboard"><Button variant="secondary" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>Mi Panel</Button></Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
