"use client";

import { useState } from "react";
import { Compass, Loader2, Info, CheckCircle2, AlertOctagon } from "lucide-react";

import { getApiUrl } from "@/lib/api";

interface PuestaTierraResult {
  r_total: number;
  cumple: boolean;
  limite: number;
  r_single: number;
  num_varillas: number;
  conductor_tierra: string;
  rho_usado: number;
  sugerencia: string;
  tabla_referencia: string;
}

export default function PuestaTierraTab() {
  const [resistividad, setResistividad] = useState<number>(100);
  const [longitud, setLongitud] = useState<number>(2.4);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PuestaTierraResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = getApiUrl();

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/calculos/puesta_tierra`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resistividad: resistividad,
          longitud_electrodo: longitud,
        }),
      });

      if (!res.ok) throw new Error("Error en el cálculo");
      const data: PuestaTierraResult = await res.json();
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
          <h3 className="text-lg font-bold text-slate-800 font-display mb-4">Mediciones de Terreno</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Resistividad Aparente (Ω·m)</label>
              <input type="number" value={resistividad} onChange={(e) => setResistividad(Number(e.target.value))} min="1" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              <p className="text-3xs text-slate-500 mt-1">Medida con telurómetro (Wenner/Schlumberger)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Longitud Electrodo (m)</label>
              <input type="number" value={longitud} onChange={(e) => setLongitud(Number(e.target.value))} min="1" step="0.1" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              <p className="text-3xs text-slate-500 mt-1">Estándar varilla Copperweld 5/8": 2.4m</p>
            </div>

            <button onClick={handleCalculate} disabled={loading} className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-slate-800 font-bold py-3 px-4 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-70">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Compass className="h-5 w-5" />}
              Calcular SPAT
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
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-800 font-display">
                Diseño Puesta a Tierra (SPAT)
              </h3>
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${result.cumple ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {result.cumple ? <CheckCircle2 className="h-4 w-4" /> : <AlertOctagon className="h-4 w-4" />}
                {result.cumple ? 'CUMPLE NORMATIVA' : 'RECHAZADO'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Resistencia Calculada</p>
                <p className={`text-4xl font-black font-display ${result.cumple ? 'text-emerald-600' : 'text-red-600'}`}>
                  {result.r_total} <span className="text-xl">Ω</span>
                </p>
                <p className="text-xs text-slate-500 mt-2">Límite normativo: {result.limite} Ω</p>
              </div>
              
              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Electrodos req.</span>
                  <span className="font-bold text-slate-800">{result.num_varillas} Varilla(s)</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Conductor Desnudo</span>
                  <span className="font-bold text-slate-800">{result.conductor_tierra}</span>
                </div>
              </div>
            </div>

            {!result.cumple && (
              <div className="mt-6 bg-red-50/50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                <AlertOctagon className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Acción Requerida</p>
                  <p className="text-sm text-red-700 mt-1">{result.sugerencia}</p>
                </div>
              </div>
            )}
            
            <div className="mt-4 flex items-start gap-2 text-slate-500">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-xs">Fórmula basada en {result.tabla_referencia} para electrodo vertical aislado.</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-12 text-slate-500">
            <p className="font-medium text-center">Ingresa la resistividad del terreno para estimar el diseño de puesta a tierra.</p>
          </div>
        )}
      </div>
    </div>
  );
}
