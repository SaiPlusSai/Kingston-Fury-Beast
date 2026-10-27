import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Wrench,
  HeartPulse,
  HelpCircle,
} from 'lucide-react';

const CATEGORIES = [
  { id: '1', label: 'Seguridad / Robo', icon: ShieldAlert, color: 'hover:border-rose-500 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { id: '2', label: 'Accidente de Tránsito', icon: AlertTriangle, color: 'hover:border-amber-500 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { id: '3', label: 'Infraestructura / Bache', icon: Wrench, color: 'hover:border-sky-500 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  { id: '4', label: 'Incendio / Fuga', icon: Flame, color: 'hover:border-orange-500 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  { id: '5', label: 'Emergencia Médica', icon: HeartPulse, color: 'hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { id: '6', label: 'Otro Incidente', icon: HelpCircle, color: 'hover:border-slate-500 hover:bg-slate-500/10 text-slate-600 dark:text-slate-400' },
];

export default function QuickCategoryChips({ onSelect, disabled = false }) {
  return (
    <div className="w-full my-2 animate-in fade-in duration-200">
      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <span>⚡</span> Selecciona la categoría:
      </p>

      <div className="grid grid-cols-2 gap-1.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(`${cat.id}. ${cat.label}`)}
              className={`flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs text-left transition-all duration-150 active:scale-95 hover:shadow-xs group ${cat.color} ${
                disabled ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium truncate leading-tight">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
