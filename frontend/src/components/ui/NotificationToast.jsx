import React, { useEffect, useState } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const TYPE_CONFIG = {
  alert: { icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10 border-danger/25' },
  update: { icon: CheckCircle,  color: 'text-success', bg: 'bg-success/10 border-success/25' },
  info:   { icon: Info,         color: 'text-primary', bg: 'bg-primary/10 border-primary/25' },
};

const NotificationToast = () => {
  const { newArrival, dismissToast } = useNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!newArrival) { setVisible(false); return; }
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(dismissToast, 300); // wait for fade-out
    }, 5000);
    return () => clearTimeout(t);
  }, [newArrival, dismissToast]);

  if (!newArrival) return null;

  const cfg = TYPE_CONFIG[newArrival.type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] max-w-sm w-full transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className={`flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md bg-white/95 ${cfg.bg}`}>
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
          <Icon className={`h-4 w-4 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">{newArrival.title}</p>
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed line-clamp-2">
            {newArrival.message}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setVisible(false); setTimeout(dismissToast, 300); }}
          className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-black/5 transition-colors flex-shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
