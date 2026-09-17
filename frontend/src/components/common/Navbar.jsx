import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import Button from '../ui/Button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: 'Inicio', to: '/' },
    { label: 'Características', href: '#features' },
    { label: 'Mapa en Vivo', to: '/admin/map' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`flex justify-between items-center transition-[background-color,border-color,box-shadow,padding,border-radius] duration-300 ease-in-out w-full ${scrolled
            ? 'glass-premium rounded-full px-6 h-14 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
            : 'h-14 bg-transparent border-transparent px-2'
            }`}
          style={{ willChange: 'background-color, border-color, box-shadow, padding, border-radius' }}
        >

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="flex items-center justify-center transition-[background-color,border-color] duration-200 h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary/20">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-display font-bold tracking-tight text-lg text-text-primary">
              Halo
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-2">
            {links.map((link, i) =>
              link.to ? (
                <NavLink
                  key={i}
                  to={link.to}
                  className={({ isActive }) => `px-4 py-2 text-sm font-medium rounded-full transition-[color,background-color] duration-200 ${isActive
                    ? 'text-primary bg-primary/10 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-black/5'
                    }`}
                >
                  {link.label}
                </NavLink>
              ) : (
                <a
                  key={i}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-black/5 rounded-full transition-[color,background-color] duration-200"
                >
                  {link.label}
                </a>
              )
            )}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="rounded-full font-bold hover:bg-black/5">Iniciar Sesión</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" className="rounded-full font-bold shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-transform">
                Registrarse
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-full transition-colors text-text-secondary hover:text-text-primary hover:bg-black/5"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X style={{ width: '20px', height: '20px' }} /> : <Menu style={{ width: '20px', height: '20px' }} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 glass-premium rounded-2xl border border-white/40 shadow-2xl animate-fade-in overflow-hidden">
          <div className="px-4 py-4 space-y-1">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.to || link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-black/5 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 mt-2 flex flex-col gap-3">
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button variant="secondary" className="w-full rounded-xl" size="sm">Iniciar Sesión</Button>
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)}>
                <Button variant="primary" className="w-full rounded-xl shadow-md" size="sm">Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
