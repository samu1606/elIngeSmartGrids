"use client";

import { useState } from "react";
import { Lightbulb, Loader2, Info } from "lucide-react";

import { getApiUrl } from "@/lib/api";

interface IluminacionResult {
  area: number;
  lux_objetivo: number;
  luminarias: number;
  distribucion: string;
  carga_total: number;
  cu_usado: number;
  llf_usado: number;
  tabla_referencia: string;
}

export default function IluminacionTab() {
  const [largo, setLargo] = useState<number>(10);
  const [ancho, setAncho] = useState<number>(5);
  const [lux, setLux] = useState<number>(500);
  const [lumens, setLumens] = useState<number>(3000);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IluminacionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = getApiUrl();

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/calculos/iluminacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          largo: largo,
          ancho: ancho,
          lux_objetivo: lux,
          lumens_lampara: lumens,
        }),
      });

      if (!res.ok) throw new Error("Error en el cálculo");
      const data: IluminacionResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con la API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Formulario */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 font-display mb-4">Dimensiones y Requerimientos</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Largo (m)</label>
                <input type="number" value={largo} onChange={(e) => setLargo(Number(e.target.value))} min="1" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ancho (m)</label>
                <input type="number" value={ancho} onChange={(e) => setAncho(Number(e.target.value))} min="1" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nivel Iluminación (Lux)</label>
              <input type="number" value={lux} onChange={(e) => setLux(Number(e.target.value))} min="10" step="10" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              <p className="text-3xs text-slate-500 mt-1">Oficinas ~500, Pasillos ~100</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Flujo Luminoso / Lámpara (Lm)</label>
              <input type="number" value={lumens} onChange={(e) => setLumens(Number(e.target.value))} min="100" step="100" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>

            <button onClick={handleCalculate} disabled={loading} className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-slate-800 font-bold py-3 px-4 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-70">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lightbulb className="h-5 w-5" />}
              Calcular Iluminación
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="lg:col-span-2">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 font-medium flex items-center gap-2">
            <Info className="h-5 w-5" />
            {error}
          </div>
        )}

        {result ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-fade-in">
            <h3 className="text-lg font-bold text-slate-800 font-display mb-6 border-b pb-4">
              Resultados del Diseño (Método de Lúmenes)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Luminarias (Und)</p>
                <p className="text-4xl font-black text-emerald-600 font-display">{result.luminarias}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Distribución Sugerida</p>
                <p className="text-2xl font-bold text-slate-800 font-display">{result.distribucion}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Área Total</p>
                <p className="text-2xl font-bold text-slate-800 font-display">{result.area} m²</p>
              </div>
            </div>

            <div className="mt-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Variables Fijas de Diseño</p>
                <p className="text-sm text-blue-700 mt-1">
                  Coeficiente de Utilización (CU) = {result.cu_usado} | Factor de Pérdida de Luz (LLF) = {result.llf_usado}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-12 text-slate-500">
            <p className="font-medium text-center">Ingresa los datos para determinar la cantidad de luminarias necesarias.</p>
          </div>
        )}
      </div>
    </div>
  );
}
