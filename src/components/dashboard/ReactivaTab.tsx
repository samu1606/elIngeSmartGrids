"use client";

import { useState } from "react";
import { Activity, Loader2, Info, AlertTriangle } from "lucide-react";

import { getApiUrl } from "@/lib/api";

interface ReactivaResult {
  qc: number;
  capacitancia: number;
  s_antes: number;
  s_despues: number;
  ahorro: number;
  penalizacion: boolean;
  tabla_referencia: string;
}

export default function ReactivaTab() {
  const [kw, setKw] = useState<number>(50);
  const [fpActual, setFpActual] = useState<number>(0.75);
  const [fpObjetivo, setFpObjetivo] = useState<number>(0.95);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReactivaResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = getApiUrl();

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/calculos/reactiva`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          potencia_kw: kw,
          fp_actual: fpActual,
          fp_objetivo: fpObjetivo,
        }),
      });

      if (!res.ok) throw new Error("Error en el cálculo");
      const data: ReactivaResult = await res.json();
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
          <h3 className="text-lg font-bold text-slate-800 font-display mb-4">Datos del Sistema</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Potencia Activa (kW)</label>
              <input type="number" value={kw} onChange={(e) => setKw(Number(e.target.value))} min="1" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">FP Actual</label>
              <input type="number" value={fpActual} onChange={(e) => setFpActual(Number(e.target.value))} min="0.1" max="1" step="0.01" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">FP Objetivo</label>
              <input type="number" value={fpObjetivo} onChange={(e) => setFpObjetivo(Number(e.target.value))} min="0.8" max="1" step="0.01" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>

            <button onClick={handleCalculate} disabled={loading} className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-slate-800 font-bold py-3 px-4 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-70">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Activity className="h-5 w-5" />}
              Calcular Banco (kVAR)
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
              Diseño del Banco de Condensadores
            </h3>
            
            {result.penalizacion && (
              <div className="mb-6 bg-orange-50 text-orange-700 p-4 rounded-xl border border-orange-200 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Alerta de Penalización</p>
                  <p className="text-sm mt-1">El factor de potencia actual está por debajo de 0.90, lo cual genera cobros por energía reactiva (CREG 015).</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Potencia Reactiva Req.</p>
                <p className="text-4xl font-black text-emerald-600 font-display">{result.qc} <span className="text-xl">kVAR</span></p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Capacitancia Equiv.</p>
                <p className="text-2xl font-bold text-slate-800 font-display">{result.capacitancia} µF</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Potencia Aparente (Antes)</p>
                <p className="font-bold text-slate-800">{result.s_antes} kVA</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Potencia Aparente (Después)</p>
                <p className="font-bold text-emerald-600">{result.s_despues} kVA</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Ahorro en Capacidad</p>
                <p className="font-bold text-blue-600">{result.ahorro} kVA</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-12 text-slate-500">
            <p className="font-medium text-center">Ingresa los datos para determinar el banco de condensadores requerido.</p>
          </div>
        )}
      </div>
    </div>
  );
}
