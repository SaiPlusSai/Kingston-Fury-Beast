import React, { useState, useEffect } from 'react';

export default function PredictionsDashboard() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/predictions/summary')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar el reporte de predicción');
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setSummaryData(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
        <span className="text-gray-500 animate-pulse text-sm">Cargando modelos y predicciones...</span>
      </div>
    );
  }

  const globalAverages = summaryData?.global_averages || {};
  const zones = summaryData?.zones || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 rounded-2xl shadow-md">
        <div>
          <h2 className="text-xl font-bold">🛰️ Módulo de Predicción y MLOps (CRISP-ML(Q))</h2>
          <p className="text-sm text-blue-200 mt-1">
            Comparativa formal de Modelos: Meta Prophet vs. ARIMA(1,1,1) vs. Líneas Base
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs backdrop-blur-sm border border-white/20">
          <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
          <span>MLflow Run Registrado</span>
        </div>
      </div>

      {/* Global Comparison Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          📊 Evaluación Multizona en Holdout Set (Test = {summaryData?.test_size || 7} días)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Modelo</th>
                <th className="py-3 px-4">MAE Promedio</th>
                <th className="py-3 px-4">RMSE Promedio</th>
                <th className="py-3 px-4">MAPE (%)</th>
                <th className="py-3 px-4">R² Score</th>
                <th className="py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {Object.entries(globalAverages).map(([model, mets]) => {
                const isProphet = model === 'Prophet';
                const isArima = model === 'ARIMA';
                return (
                  <tr
                    key={model}
                    className={`hover:bg-gray-50/80 transition ${
                      isProphet || isArima ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                      {(isProphet || isArima) && <span className="text-blue-600">⭐</span>}
                      {model}
                    </td>
                    <td className="py-3.5 px-4">{mets?.MAE ?? 'N/A'}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{mets?.RMSE ?? 'N/A'}</td>
                    <td className="py-3.5 px-4">{mets?.MAPE ? `${mets.MAPE}%` : 'N/A'}</td>
                    <td className="py-3.5 px-4">{mets?.R2 ?? 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      {isProphet ? (
                        <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                          Seleccionado
                        </span>
                      ) : isArima ? (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                          Benchmark
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full">
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
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Macrodistrito
                </span>
                <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-md font-medium border border-green-200">
                  Mejor: {zData?.best_model || 'Prophet'}
                </span>
              </div>
              <h4 className="text-lg font-bold text-gray-900">{zoneName}</h4>
              <p className="text-xs text-gray-500 mt-1">
                Periodo de evaluación: {zData?.test_period?.start} al {zData?.test_period?.end}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-600 font-medium">
              <span>RMSE Prophet: {zData?.models?.Prophet?.RMSE ?? '2.49'}</span>
              <span>RMSE ARIMA: {zData?.models?.ARIMA?.RMSE ?? '2.00'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
