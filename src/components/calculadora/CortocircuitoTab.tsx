"use client";

import { useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Zap, AlertTriangle, CheckCircle, Info, RefreshCw, ShieldAlert } from "lucide-react";
import SaveToProjectButton from "@/components/calculadora/SaveToProjectButton";

interface Resultado {
  icc_trafo: number;
  icc_punto_carga: number;
  z_trafo: number;
  z_alimentador: number;
  aic_requerido: number;
  nivel_cortocircuito: string;
  riesgo: string;
  justificacion: string;
  tabla_referencia: string;
}

const CALIBRES = ["14 AWG", "12 AWG", "10 AWG", "8 AWG", "6 AWG", "4 AWG", "3 AWG", "2 AWG", "1 AWG", "1/0 AWG", "2/0 AWG", "3/0 AWG", "4/0 AWG", "250 kcmil", "350 kcmil", "500 kcmil"];

export default function CortocircuitoTab() {
  const [potenciaTrafo, setPotenciaTrafo] = useState<number>(100);
  const [impedanciaZ, setImpedanciaZ] = useState<number>(5);
  const [longitudAlim, setLongitudAlim] = useState<number>(30);
  const [calibreAlim, setCalibreAlim] = useState<string>("2 AWG");
  const [material, setMaterial] = useState<string>("cu");
  const [sistema, setSistema] = useState<string>("trifasico");
  const [tension, setTension] = useState<number>(208);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/calculos/cortocircuito`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ potencia_trafo_kva: potenciaTrafo, impedancia_z_pct: impedanciaZ, longitud_alimentador_m: longitudAlim, calibre_alimentador: calibreAlim, material, sistema, tension }),
      });
      if (!res.ok) throw new Error("Error en el servidor");
      setResult(await res.json());
    } catch { setError("No se pudo conectar con el backend."); }
    finally { setLoading(false); }
  };

  const riskColor = (riesgo: string) => {
    if (riesgo === "verde") return "bg-emerald-50 border-emerald-200 text-emerald-700";
    if (riesgo === "amarillo") return "bg-yellow-50 border-yellow-200 text-yellow-700";
    if (riesgo === "naranja") return "bg-orange-50 border-orange-200 text-orange-700";
    return "bg-red-50 border-red-200 text-red-700";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-800 font-display">Cortocircuito</h3>
          <p className="text-xs text-slate-400 mt-1">Método de impedancia simplificado.</p>
        </div>
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Potencia Trafo (kVA)</label>
              <input type="number" min={1} value={potenciaTrafo} onChange={(e) => setPotenciaTrafo(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Impedancia Z (%)</label>
              <input type="number" min={0.1} step={0.1} value={impedanciaZ} onChange={(e) => setImpedanciaZ(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Long. Alimentador (m)</label>
              <input type="number" min={0} value={longitudAlim} onChange={(e) => setLongitudAlim(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Calibre Alimentador</label>
              <select value={calibreAlim} onChange={(e) => setCalibreAlim(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none">
                {CALIBRES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <select value={material} onChange={(e) => setMaterial(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none">
              <option value="cu">Cobre</option><option value="al">Aluminio</option>
            </select>
            <select value={sistema} onChange={(e) => setSistema(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none">
              <option value="trifasico">Trifásico</option><option value="monofasico">Monofásico</option>
            </select>
            <input type="number" value={tension} onChange={(e) => setTension(Number(e.target.value))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" placeholder="V" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-slate-950 font-bold py-3 text-sm transition-all disabled:opacity-50 cursor-pointer">
            {loading ? <><RefreshCw className="h-4.5 w-4.5 animate-spin" /> Calculando...</> : <><Zap className="h-4.5 w-4.5" /> Calcular Icc</>}
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
                  <span className="text-xs font-bold text-slate-400 uppercase">Icc en Punto de Carga</span>
                  <h2 className="text-3xl font-extrabold text-slate-800 font-display mt-0.5">{result.icc_punto_carga.toLocaleString()} A</h2>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${riskColor(result.riesgo)}`}>
                  <ShieldAlert className="h-3.5 w-3.5" /> {result.nivel_cortocircuito}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400">Icc Trafo</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.icc_trafo.toLocaleString()} A</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400">Z Alimentador</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.z_alimentador} Ω</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400">AIC Requerido</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.aic_requerido.toLocaleString()} A</span>
                </div>
              </div>
            </div>
                        <div className="mb-4 flex justify-end">
              <SaveToProjectButton
                calculationType="cortocircuito"
                title={`Cortocircuito - Icc=${result.icc}A`}
                inputData={{ voltajeNominal, potenciaCorto, longitudCircuito, calibreConductor, material, tipoSistema }}
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
            <ShieldAlert className="h-10 w-10 text-slate-600 stroke-[1.5] mb-3" />
            <h4 className="font-bold font-display">Cortocircuito</h4>
            <p className="text-xs mt-1 max-w-sm">Calcula la corriente de cortocircuito disponible en el punto de carga.</p>
          </div>
        )}
      </div>
    </div>
  );
}