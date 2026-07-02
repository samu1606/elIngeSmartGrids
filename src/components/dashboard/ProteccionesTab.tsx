"use client";

import { useState } from "react";
import { ShieldAlert, Loader2, Info } from "lucide-react";

import { getApiUrl } from "@/lib/api";

interface ProteccionResult {
  corriente: number;
  corriente_design: number;
  breaker: number;
  factor_usado: string;
  ampacidad_col: string;
  tabla_referencia: string;
}

export default function ProteccionesTab() {
  const [corriente, setCorriente] = useState<number>(10);
  const [tipoCarga, setTipoCarga] = useState<"continua" | "no_continua">("continua");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProteccionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = getApiUrl();

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/calculos/protecciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corriente_carga: corriente,
          tipo_carga: tipoCarga,
        }),
      });

      if (!res.ok) throw new Error("Error en el cálculo");
      const data: ProteccionResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con la API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Columna Izquierda: Formulario */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 font-display mb-4">Parámetros</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Corriente de Carga (A)
              </label>
              <input
                type="number"
                value={corriente}
                onChange={(e) => setCorriente(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                min="0.1"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Tipo de Carga
              </label>
              <select
                value={tipoCarga}
                onChange={(e) => setTipoCarga(e.target.value as "continua" | "no_continua")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="continua">Continua (3 horas o más)</option>
                <option value="no_continua">No Continua</option>
              </select>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-slate-800 font-bold py-3 px-4 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldAlert className="h-5 w-5" />}
              Calcular Protección
            </button>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Resultados */}
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
              Protección Sugerida (ITM)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Breaker (Comercial)</p>
                <p className="text-3xl font-black text-emerald-600 font-display">{result.breaker} A</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cte Diseño</p>
                <p className="text-2xl font-bold text-slate-800 font-display">{result.corriente_design} A</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Factor Usado</p>
                <p className="text-2xl font-bold text-slate-800 font-display">{result.factor_usado}</p>
              </div>
            </div>

            <div className="mt-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Justificación Normativa</p>
                <p className="text-sm text-blue-700 mt-1">
                  Cálculo basado en <strong>{result.tabla_referencia}</strong>. 
                  Para cargas continuas se aplica un factor del 125% a la corriente nominal de diseño.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-12 text-slate-500">
            <p className="font-medium text-center">Ingresa los datos y presiona "Calcular" para ver la protección sugerida.</p>
          </div>
        )}
      </div>
    </div>
  );
}
