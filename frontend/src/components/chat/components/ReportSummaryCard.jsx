import React, { useState } from 'react';
import { Award, CheckCircle2, PhoneCall, Copy, Check, PlusCircle } from 'lucide-react';

const EMERGENCY_LINES = [
  { name: '110', label: 'Policía Nacional' },
  { name: '119', label: 'Bomberos Antofagasta' },
  { name: '114', label: 'Emergencias GAMLP' },
];

export default function ReportSummaryCard({ reportId, onNewReport }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!reportId) return;
    navigator.clipboard.writeText(reportId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full my-3 p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 shadow-xs animate-in zoom-in-95 duration-200">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            ¡Reporte Registrado con Éxito!
          </h4>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Award className="w-3 h-3 text-amber-500" />
            Insignia: Guardián de La Paz
          </span>
        </div>
      </div>

      {reportId && (
        <div className="mb-3 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="block text-[9px] uppercase font-mono text-slate-400">Código de RASTREO</span>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
              {reportId}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1 transition"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px]">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 opacity-60" />
                <span className="text-[10px]">Copiar</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Emergency numbers */}
      <div className="mb-2.5">
        <p className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
          <PhoneCall className="w-3 h-3 text-rose-500" />
          <span>Llamadas de emergencia directas:</span>
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {EMERGENCY_LINES.map((line) => (
            <a
              key={line.name}
              href={`tel:${line.name}`}
              className="p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center hover:border-rose-400 transition"
            >
              <span className="block text-xs font-bold text-rose-600 dark:text-rose-400">{line.name}</span>
              <span className="block text-[8px] text-slate-400 truncate">{line.label}</span>
            </a>
          ))}
        </div>
      </div>

      {onNewReport && (
        <button
          type="button"
          onClick={onNewReport}
          className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-medium text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Hacer otro reporte o consulta</span>
        </button>
      )}
    </div>
  );
}
