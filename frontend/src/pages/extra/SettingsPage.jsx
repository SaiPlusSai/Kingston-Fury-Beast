import React, { useState, useEffect } from 'react';
import { Bell, Lock, Monitor, Moon, Eye, ShieldAlert } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const Toggle = ({ checked = false, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-10 h-5 bg-border rounded-full peer peer-checked:bg-primary transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-sm peer-checked:after:translate-x-5" />
  </label>
);

const defaultSettings = {
  notifications: {
    email: true,
    push: false,
    reportUpdates: true,
    nearbyAlerts: true
  },
  appearance: {
    theme: 'Claro',
    reduceAnimations: false
  }
};

const SettingsPage = () => {
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  // Load from local storage or use default
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('us_settings');
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Auto-save effect
  useEffect(() => {
    localStorage.setItem('us_settings', JSON.stringify(settings));
  }, [settings]);

  // Initial appearance load
  useEffect(() => {
    applyAppearance(settings.appearance.theme, settings.appearance.reduceAnimations);
  }, []);

  const applyAppearance = (theme, reduceAnimations) => {
    if (theme === 'Oscuro') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'Sistema') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (reduceAnimations) {
      document.documentElement.style.setProperty('--animate-duration', '0s');
    } else {
      document.documentElement.style.removeProperty('--animate-duration');
    }
  };

  const updateNotification = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
    showToast();
  };

  const updateAppearance = (key, value) => {
    const nextAppearance = { ...settings.appearance, [key]: value };
    setSettings(prev => ({
      ...prev,
      appearance: nextAppearance
    }));

    applyAppearance(nextAppearance.theme, nextAppearance.reduceAnimations);
    showToast();
  };

  const showToast = () => {
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Configuración guardada',
        message: 'Tus preferencias han sido actualizadas localmente.',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }, 500);
  };

  const themes = [
    { label: 'Claro', icon: Eye },
    { label: 'Oscuro', icon: Moon },
    { label: 'Sistema', icon: Monitor },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-text-primary font-display">Configuración</h2>
          <p className="text-text-secondary text-sm mt-1">Personaliza tu experiencia en Halo.</p>
        </div>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bell className="h-4 w-4 text-primary" />
            </span>
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 px-5 py-4">
          <div className="flex items-center justify-between py-4 border-b border-border-light">
            <div>
              <p className="text-sm font-semibold text-text-primary">Alertas de emergencia por email</p>
              <p className="text-xs text-text-muted mt-0.5">Recibe avisos críticos en tu correo.</p>
            </div>
            <Toggle checked={settings.notifications.email} onChange={e => updateNotification('email', e.target.checked)} />
          </div>
          <div className="flex items-center justify-between py-4 border-b border-border-light">
            <div>
              <p className="text-sm font-semibold text-text-primary">Notificaciones push en navegador</p>
              <p className="text-xs text-text-muted mt-0.5">Alertas en tiempo real mientras navegas.</p>
            </div>
            <Toggle checked={settings.notifications.push} onChange={e => updateNotification('push', e.target.checked)} />
          </div>
          <div className="flex items-center justify-between py-4 border-b border-border-light">
            <div>
              <p className="text-sm font-semibold text-text-primary">Actualizaciones de mis reportes</p>
              <p className="text-xs text-text-muted mt-0.5">Cuando cambie el estado de un reporte.</p>
            </div>
            <Toggle checked={settings.notifications.reportUpdates} onChange={e => updateNotification('reportUpdates', e.target.checked)} />
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-semibold text-text-primary">Alertas de zonas cercanas</p>
              <p className="text-xs text-text-muted mt-0.5">Emergencias en un radio de 5km.</p>
            </div>
            <Toggle checked={settings.notifications.nearbyAlerts} onChange={e => updateNotification('nearbyAlerts', e.target.checked)} />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Monitor className="h-4 w-4 text-accent-dark" />
            </span>
            Apariencia
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-text-primary mb-3">Tema de la aplicación</p>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((theme, i) => {
                const isActive = settings.appearance.theme === theme.label;
                return (
                  <button
                    key={i}
                    onClick={() => updateAppearance('theme', theme.label)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary/8 border-primary/30 text-primary scale-[1.02] shadow-sm' : 'border-border text-text-secondary hover:border-border-strong hover:bg-hover'
                      }`}
                  >
                    <theme.icon className="h-5 w-5" />
                    {theme.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center justify-between py-4 border-t border-border-light">
            <div>
              <p className="text-sm font-semibold text-text-primary">Reducir animaciones</p>
              <p className="text-xs text-text-muted mt-0.5">Para usuarios con sensibilidad al movimiento.</p>
            </div>
            <Toggle checked={settings.appearance.reduceAnimations} onChange={e => updateAppearance('reduceAnimations', e.target.checked)} />
          </div>
        </CardContent>
      </Card>
      <div className='mt-12'>
        <div className="mt-12 h-12"></div>
      </div>
    </div>
  );
};

export default SettingsPage;
