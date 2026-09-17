import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Twitter, Github, MapPin, Mail } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-border bg-secondary-bg pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 mb-4">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="text-primary" style={{ width: '20px', height: '20px' }} />
            </div>
            <span className="font-display font-bold text-xl text-text-primary tracking-tight">
              Halo
            </span>
          </Link>
          <p className="text-sm text-text-secondary leading-relaxed">
            Plataforma inteligente de gestión de emergencias urbanas. Conectamos ciudadanos y autoridades para una ciudad más segura.
          </p>
        </div>

        {/* Platform */}
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Plataforma</h3>
          <ul className="space-y-2.5">
            {['Inicio', 'Características', 'Mapa en Vivo', 'Estadísticas'].map(item => (
              <li key={item}><a href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">{item}</a></li>
            ))}
          </ul>
        </div>

        {/* Access */}
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Acceso</h3>
          <ul className="space-y-2.5">
            {[
              { label: 'Iniciar Sesión', to: '/login' },
              { label: 'Registrarse', to: '/register' },
              { label: 'Panel de Autoridades', to: '/admin' },
              { label: 'Centro de Ayuda', to: '/help' },
            ].map(link => (
              <li key={link.label}><Link to={link.to} className="text-sm text-text-secondary hover:text-primary transition-colors">{link.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Contacto</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-text-secondary">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />Ciudad Inteligente, Zona Centro
            </li>
            <li className="flex items-center gap-2 text-sm text-text-secondary">
              <Mail className="h-4 w-4 text-primary flex-shrink-0" />info@Halo.io
            </li>
          </ul>
          <div className="flex items-center gap-3 mt-6">
            {[Twitter, Github].map((Icon, i) => (
              <a key={i} href="#"
                className="h-8 w-8 rounded-lg bg-white border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-text-muted">
        <p>&copy; {new Date().getFullYear()} Halo. Todos los derechos reservados.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-text-secondary transition-colors">Privacidad</a>
          <a href="#" className="hover:text-text-secondary transition-colors">Términos</a>
          <a href="#" className="hover:text-text-secondary transition-colors">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
