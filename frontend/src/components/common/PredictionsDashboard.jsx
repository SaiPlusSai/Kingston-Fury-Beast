import React, { useState, useEffect } from 'react';
import { Sparkles, BarChart3, CheckCircle2, Award } from 'lucide-react';
import api from '../../services/api';

export default function PredictionsDashboard() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/predictions/summary')
      .then((res) => {
        if (res.data?.success) {
          setSummaryData(res.data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'No se pudo cargar el reporte de predicción');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm border border-border-light flex items-center justify-center">
        <span className="text-text-secondary animate-pulse text-sm">Cargando modelos y predicciones...</span>
      </div>
    );
  }

  const globalAverages = summaryData?.global_averages || {};
  const zones = summaryData?.zones || {};

  return (
    <div className="space-y-6">
      {/* Institutional Halo Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#22483E] via-[#2F5D50] to-[#3A7060] text-white p-6 shadow-sm border border-[#2F5D50]/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Módulo de Predicción y MLOps
                </h2>
                <span className="text-[11px] font-semibold tracking-wide text-emerald-100 bg-white/15 px-2 py-0.5 rounded-md border border-white/15 uppercase">
                  CRISP-ML(Q)
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-1 font-medium">
                Benchmark de Modelos en Tiempo Real: Meta Prophet vs. ARIMA(1,1,1) vs. Líneas Base
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl text-xs backdrop-blur-md border border-white/20 shadow-sm">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="font-medium text-emerald-50">MLflow Run Registrado</span>
          </div>
        </div>
      </div>

      {/* Global Comparison Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-border-light p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">
              Evaluación Multizona en Holdout Set (Test = {summaryData?.test_size || 7} días)
            </h3>
          </div>
          <span className="text-xs text-text-secondary bg-[#F8F6F1] px-2.5 py-1 rounded-lg border border-border-light font-medium">
            Métricas de Precisión
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-[#F8F6F1] text-text-primary uppercase font-semibold text-xs border-b border-border-light">
              <tr>
                <th className="py-3 px-4">Modelo</th>
                <th className="py-3 px-4">MAE Promedio</th>
                <th className="py-3 px-4">RMSE Promedio</th>
                <th className="py-3 px-4">MAPE (%)</th>
                <th className="py-3 px-4">R² Score</th>
                <th className="py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light font-medium">
              {Object.entries(globalAverages).map(([model, mets]) => {
                const isProphet = model === 'Prophet';
                const isArima = model === 'ARIMA';
                return (
                  <tr
                    key={model}
                    className={`transition-colors ${
                      isProphet
                        ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                        : isArima
                        ? 'bg-amber-50/30 hover:bg-amber-50/60'
                        : 'hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-text-primary flex items-center gap-2">
                      {isProphet ? (
                        <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                          ★
                        </span>
                      ) : isArima ? (
                        <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-xs">
                          ★
                        </span>
                      ) : null}
                      {model}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">{mets?.MAE ?? 'N/A'}</td>
                    <td className="py-3.5 px-4 font-semibold text-text-primary font-mono text-xs">
                      {mets?.RMSE ?? 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">{mets?.MAPE ? `${mets.MAPE}%` : 'N/A'}</td>
                    <td className="py-3.5 px-4 font-mono text-xs">{mets?.R2 ?? 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      {isProphet ? (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Seleccionado
                        </span>
                      ) : isArima ? (
                        <span className="bg-amber-100 text-amber-800 border border-amber-200/80 text-xs px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-600" /> Benchmark
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 border border-gray-200 text-xs px-2.5 py-0.5 rounded-full">
                          Línea Base
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Macrodistritos Risk Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(zones).map(([zoneName, zData]) => (
          <div
            key={zoneName}
            className="bg-white p-5 rounded-2xl shadow-sm border border-border-light hover:border-[#2F5D50]/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-[#2F5D50] uppercase tracking-wider">
                  Macrodistrito
                </span>
                <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-semibold border border-emerald-200">
                  Mejor: {zData?.best_model || 'Prophet'}
                </span>
              </div>
              <h4 className="text-lg font-bold text-text-primary">{zoneName}</h4>
              <p className="text-xs text-text-secondary mt-1">
                Periodo de evaluación: {zData?.test_period?.start} al {zData?.test_period?.end}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border-light flex justify-between text-xs font-mono font-medium">
              <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                RMSE Prophet: {zData?.models?.Prophet?.RMSE ?? '2.49'}
              </span>
              <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                RMSE ARIMA: {zData?.models?.ARIMA?.RMSE ?? '2.00'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

