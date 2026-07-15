"use client";

import { useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Zap, AlertTriangle, CheckCircle, Info, RefreshCw, Battery } from "lucide-react";
import SaveToProjectButton from "@/components/calculadora/SaveToProjectButton";

interface Resultado {
  kva_seleccionado: number;
  s_requerida: number;
  s_diseno: number;
  factor_carga_pct: number;
  corriente_primaria: number;
  corriente_secundaria: number;
  perdidas_totales_kw: number;
  eficiencia_estimada_pct: number;
  regulacion_pct: number;
  capacidad_estado: string;
  capacidad_color: string;
  justificacion: string;
  tabla_referencia: string;
}

export default function TransformadoresTab() {
  const [potenciaTotal, setPotenciaTotal] = useState<number>(50);
  const [factorPotencia, setFactorPotencia] = useState<number>(0.9);
  const [tensionPrimaria, setTensionPrimaria] = useState<number>(13200);
  const [tensionSecundaria, setTensionSecundaria] = useState<number>(208);
  const [tipo, setTipo] = useState<string>("seco");
  const [sistema, setSistema] = useState<string>("trifasico");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/calculos/transformadores`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ potencia_total_kw: potenciaTotal, factor_potencia: factorPotencia, tension_primaria: tensionPrimaria, tension_secundaria: tensionSecundaria, tipo, sistema }),
      });
      if (!res.ok) throw new Error("Error en el servidor");
      setResult(await res.json());
    } catch { setError("No se pudo conectar con el backend."); }
    finally { setLoading(false); }
  };

  const capColor = (c: string) => {
    if (c === "verde") return "bg-emerald-50 border-emerald-200 text-emerald-700";
    if (c === "amarillo") return "bg-yellow-50 border-yellow-200 text-yellow-700";
    return "bg-red-50 border-red-200 text-red-700";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-800 font-display">Transformadores</h3>
          <p className="text-xs text-slate-400 mt-1">Selección según carga NTC 2050 Art. 450.</p>
        </div>
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Potencia Total (kW)</label>
              <input type="number" min={0.1} value={potenciaTotal} onChange={(e) => setPotenciaTotal(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Factor de Potencia</label>
              <input type="number" min={0.1} max={1} step={0.01} value={factorPotencia} onChange={(e) => setFactorPotencia(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tensión Primaria (V)</label>
              <input type="number" value={tensionPrimaria} onChange={(e) => setTensionPrimaria(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tensión Secundaria (V)</label>
              <input type="number" value={tensionSecundaria} onChange={(e) => setTensionSecundaria(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none">
              <option value="seco">Seco</option><option value="liquido">Líquido</option>
            </select>
            <select value={sistema} onChange={(e) => setSistema(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none">
              <option value="trifasico">Trifásico</option><option value="monofasico">Monofásico</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-slate-950 font-bold py-3 text-sm transition-all disabled:opacity-50 cursor-pointer">
            {loading ? <><RefreshCw className="h-4.5 w-4.5 animate-spin" /> Calculando...</> : <><Zap className="h-4.5 w-4.5" /> Seleccionar Trafo</>}
          </button>
        </form>
      </div>

      <div className="lg:col-span-7 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div><h4 className="font-bold text-sm">Error</h4><p className="text-xs mt-1">{error}</p></div>
          </div>
        )}
        {result ? (
          <>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Transformador Seleccionado</span>
                  <h2 className="text-3xl font-extrabold text-slate-800 font-display mt-0.5">{result.kva_seleccionado} kVA</h2>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${capColor(result.capacidad_color)}`}>
                  <CheckCircle className="h-3.5 w-3.5" /> {result.capacidad_estado}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400">Factor de Carga</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.factor_carga_pct}%</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400">I Primaria</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.corriente_primaria} A</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400">I Secundaria</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.corriente_secundaria} A</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400">Pérdidas Estimadas</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.perdidas_totales_kw} kW</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400">Eficiencia</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.eficiencia_estimada_pct}%</span>
                </div>
              </div>
            </div>
                        <div className="mb-4 flex justify-end">
              <SaveToProjectButton
                calculationType="transformadores"
                title={`Transformador - ${result.kva_seleccionado}kVA`}
                inputData={{ potenciaTotal, factorPotencia, tensionPrimaria, tensionSecundaria, tipo, sistema }}
                resultData={result}
              />
            </div>

<div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <Info className="h-4.5 w-4.5 text-primary" /><h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Memoria Justificativa</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">&ldquo;{result.justificacion}&rdquo;</p>
              <div className="text-3xs font-extrabold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-200/60">{result.tabla_referencia}</div>
            </div>
          </>
        ) : (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl h-96 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Battery className="h-10 w-10 text-slate-600 stroke-[1.5] mb-3" />
            <h4 className="font-bold font-display">Transformadores</h4>
            <p className="text-xs mt-1 max-w-sm">Selecciona el transformador adecuado según la carga del sistema.</p>
          </div>
        )}
      </div>
    </div>
  );
}