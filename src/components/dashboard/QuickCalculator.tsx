"use client";

import { useState } from "react";
import { Zap, Loader2, Play } from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function QuickCalculator() {
  const [tension, setTension] = useState("208");
  const [corriente, setCorriente] = useState("10");
  const [fp, setFp] = useState("0.9");
  const [sistema, setSistema] = useState("trifasico");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    activa: number;
    aparente: number;
  } | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const apiBaseUrl = getApiUrl();

    try {
      const response = await fetch(`${apiBaseUrl}/api/calculos/potencia`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tension: Number(tension),
          corriente: Number(corriente),
          factor_potencia: Number(fp),
          sistema: sistema,
        }),
      });

      if (!response.ok) {
        throw new Error("Error en el servidor de cálculos.");
      }

      const data = await response.json();
      setResult({
        activa: Number((data.potencia_activa_w / 1000).toFixed(2)), // Watts to kW
        aparente: Number((data.potencia_aparente_va / 1000).toFixed(2)), // VA to kVA
      });
    } catch (err: any) {
      setError(err.message || "No se pudo conectar con el servidor de cálculos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
      <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary fill-primary/10" />
        <h3 className="font-bold text-slate-800 font-display">Calculadora de Potencia Rápida</h3>
      </div>

      <form onSubmit={handleCalculate} className="p-6 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-3xs text-red-650 font-medium leading-relaxed">
            {error}
          </div>
        )}

        {/* Tension & Corriente inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-3xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Tensión (V)
            </label>
            <input
              type="number"
              value={tension}
              onChange={(e) => setTension(e.target.value)}
              required
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary/60 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-3xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Corriente (A)
            </label>
            <input
              type="number"
              value={corriente}
              onChange={(e) => setCorriente(e.target.value)}
              required
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary/60 focus:bg-white"
            />
          </div>
        </div>

        {/* FP & Sistema inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-3xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Factor de Potencia
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={fp}
              onChange={(e) => setFp(e.target.value)}
              required
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary/60 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-3xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Sistema
            </label>
            <select
              value={sistema}
              onChange={(e) => setSistema(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-750 outline-none focus:border-primary/60 focus:bg-white cursor-pointer"
            >
              <option value="trifasico">Trifásico</option>
              <option value="monofasico">Monofásico</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-slate-950 hover:bg-primary-dark active:scale-[0.98] disabled:scale-100 disabled:opacity-50 transition-all duration-200 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculando...
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-slate-950" />
              Calcular Potencia
            </>
          )}
        </button>

        {/* Results Panel */}
        {result && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 pt-3 mt-4 animate-fade-in space-y-3">
            <span className="text-3xs text-slate-500 font-bold uppercase tracking-wider block border-b border-slate-200/80 pb-1.5">
              Resultados Técnicos
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-3xs text-slate-500 font-semibold uppercase tracking-wider">Potencia Activa</span>
                <p className="text-xl font-black text-slate-800 font-display mt-0.5">{result.activa} kW</p>
              </div>
              <div>
                <span className="text-3xs text-slate-500 font-semibold uppercase tracking-wider">Potencia Aparente</span>
                <p className="text-xl font-black text-slate-800 font-display mt-0.5">{result.aparente} kVA</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
