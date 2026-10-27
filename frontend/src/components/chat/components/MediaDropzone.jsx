import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, X, ArrowRight, Image as ImageIcon } from 'lucide-react';

export default function MediaDropzone({ onAttachPhoto, onSkip, disabled = false }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <div className="w-full my-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs animate-in fade-in duration-200">
      <div className="flex items-center gap-2 mb-2">
        <Camera className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          Evidencia Fotográfica (Opcional)
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative mb-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-32 flex items-center justify-center">
          <img src={previewUrl} alt="Evidencia" className="w-full h-28 object-cover" />
          <button
            type="button"
            onClick={() => setPreviewUrl(null)}
            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="w-full mb-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center gap-1 transition"
        >
          <UploadCloud className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-600 dark:text-slate-300">Toca para subir una fotografía</span>
        </button>
      )}

      <div className="flex gap-2">
        {previewUrl && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAttachPhoto(previewUrl)}
            className="flex-1 py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-medium text-xs transition flex items-center justify-center gap-1"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Confirmar Foto</span>
          </button>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={onSkip}
          className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-300 font-medium text-xs transition flex items-center justify-center gap-1"
        >
          <span>Continuar sin foto</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-60" />
        </button>
      </div>
    </div>
  );
}
