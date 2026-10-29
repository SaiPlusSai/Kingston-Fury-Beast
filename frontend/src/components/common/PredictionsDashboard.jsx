import React, { useState, useEffect } from 'react';
import { Sparkles, BarChart3, CheckCircle2, Award, AlertTriangle, ShieldAlert, TrendingUp } from 'lucide-react';
import api from '../../services/api';

export default function PredictionsDashboard() {
  const [summaryData, setSummaryData] = useState(null);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/predictions/summary').catch(() => null),
      api.get('/predictions/heatmap').catch(() => null)
    ])
      .then(([summaryRes, heatmapRes]) => {
        if (summaryRes?.data?.success) {
          setSummaryData(summaryRes.data.data);
        }
        if (heatmapRes?.data?.success && Array.isArray(heatmapRes.data.points)) {
          setHeatmapPoints(heatmapRes.data.points);
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
        <span className="text-text-secondary animate-pulse text-sm">Cargando modelos y pronóstico de hotspots...</span>
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
                Pronóstico Predictivo Operativo e Inferencia de Hotspots para La Paz
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl text-xs backdrop-blur-md border border-white/20 shadow-sm">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="font-medium text-emerald-50">Modelo Activo: ARIMA(1,1,1)</span>
          </div>
        </div>
      </div>

      {/* Operative Hotspots Forecast Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-700" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
              Pronóstico de Incidentes Estimados para las Próximas 24 Horas
            </h3>
          </div>
          <span className="text-xs text-text-secondary bg-white px-2.5 py-1 rounded-lg border border-border-light shadow-sm">
            Basado en inferencia de series temporales
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {heatmapPoints.map((hp) => {
            const isHigh = hp.riskLevel === 'HIGH';
            const isMed = hp.riskLevel === 'MEDIUM';

            const badgeBg = isHigh
              ? 'bg-red-50 text-red-700 border-red-200'
              : isMed
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200';

            const barBg = isHigh ? 'bg-red-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500';

            return (
              <div
                key={hp.zoneId}
                className="bg-white p-4 rounded-xl shadow-sm border border-border-light flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-text-primary">{hp.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badgeBg}`}>
                      {isHigh ? 'Riesgo Alto' : isMed ? 'Riesgo Medio' : 'Riesgo Bajo'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-text-primary">
                      ~{hp.predictedDailyIncidents}
                    </span>
                    <span className="text-xs text-text-muted">incidentes previstos/día</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border-light">
                  <div className="flex justify-between text-[11px] text-text-secondary mb-1">
                    <span>Intensidad de Hotspot</span>
                    <span className="font-semibold">{Math.round(hp.intensity * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barBg} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.round(hp.intensity * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
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
              Benchmark Técnico de Modelos en Holdout Set (Test = {summaryData?.test_size || 7} días)
            </h3>
          </div>
          <span className="text-xs text-text-secondary bg-[#F8F6F1] px-2.5 py-1 rounded-lg border border-border-light font-medium">
            Métricas de Precisión
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9F6] text-text-muted uppercase text-[11px] font-semibold border-y border-border-light">
              <tr>
                <th className="py-3 px-4">Modelo Evaluado</th>
                <th className="py-3 px-4">MAE (Error Absoluto)</th>
                <th className="py-3 px-4">RMSE (Dispersión)</th>
                <th className="py-3 px-4">MAPE (% Error)</th>
                <th className="py-3 px-4">R² Score</th>
                <th className="py-3 px-4">Veredicto Operativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {Object.entries(globalAverages).map(([model, mets]) => {
                const isArima = model === 'ARIMA';
                const isProphet = model === 'Prophet';
                return (
                  <tr
                    key={model}
                    className={`hover:bg-[#FAF9F6]/80 transition-colors ${
                      isArima ? 'bg-amber-50/30 font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-medium text-text-primary flex items-center gap-2">
                      {isArima ? (
                        <Award className="w-4 h-4 text-amber-600" />
                      ) : isProphet ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
                      {isArima ? (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Menor Error (Producción)
                        </span>
                      ) : isProphet ? (
                        <span className="bg-blue-100 text-blue-800 border border-blue-200/80 text-xs px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-blue-600" /> Modelo Comparado
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
    </div>
  );
}
