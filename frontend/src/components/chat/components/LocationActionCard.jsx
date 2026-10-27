import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, Loader2, Compass } from 'lucide-react';

const MACRODISTRITOS = [
  'Centro',
  'Sur (Calacoto/Obrajes)',
  'Cotahuma',
  'Max Paredes',
  'Periférica',
  'San Antonio',
  'Mallasa',
];

export default function LocationActionCard({ onSelectLocation, disabled = false }) {
  const [isLocating, setIsLocating] = useState(false);
  const [gpsFound, setGpsFound] = useState(null);

  const handleGetGps = () => {
    if (!navigator.geolocation) {
      onSelectLocation('Ubicación: La Paz (Centro)');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        const coordsText = `GPS: [${latitude.toFixed(4)}, ${longitude.toFixed(4)}] - La Paz`;
        setGpsFound(coordsText);
        setTimeout(() => {
          onSelectLocation(coordsText);
        }, 500);
      },
      () => {
        setIsLocating(false);
        onSelectLocation('Ubicación aproximada: La Paz, Macrodistrito Centro');
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="w-full my-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs animate-in fade-in duration-200">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          Ubicación del Incidente
        </span>
      </div>

      {/* GPS One-Tap */}
      <button
        type="button"
        disabled={disabled || isLocating}
        onClick={handleGetGps}
        className="w-full mb-2.5 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
      >
        {isLocating ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Detectando coordenadas GPS...</span>
          </>
        ) : gpsFound ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{gpsFound}</span>
          </>
        ) : (
          <>
            <Navigation className="w-3.5 h-3.5" />
            <span>Usar mi ubicación actual en La Paz</span>
          </>
        )}
      </button>

      {/* Macrodistritos */}
      <div>
        <p className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
          <Compass className="w-3 h-3" />
          <span>O selecciona tu Macrodistrito:</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {MACRODISTRITOS.map((dist) => (
            <button
              key={dist}
              type="button"
              disabled={disabled || isLocating}
              onClick={() => onSelectLocation(`Macrodistrito ${dist}`)}
              className="text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg transition-all active:scale-95"
            >
              {dist}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
