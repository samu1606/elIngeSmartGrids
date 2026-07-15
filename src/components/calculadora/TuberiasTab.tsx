"use client";

import { useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Zap, AlertTriangle, CheckCircle, Info, RefreshCw, Plus, Trash2, Ruler } from "lucide-react";
import SaveToProjectButton from "@/components/calculadora/SaveToProjectButton";

interface ConductorInput {
  calibre: string;
  tipo_aislamiento: string;
  num_conductores: number;
}

interface Resultado {
  detalle_conductores: any[];
  area_total_mm2: number;
  pct_maximo_llenado: number;
  area_requerida_mm2: number;
  tipo_tubo: string;
  diametro_seleccionado: string;
  area_tubo_mm2: number;
  pct_ocupacion: number;
  cumple: boolean;
  justificacion: string;
  tabla_referencia: string;
}

const CALIBRES = ["14 AWG", "12 AWG", "10 AWG", "8 AWG", "6 AWG", "4 AWG", "3 AWG", "2 AWG", "1 AWG", "1/0 AWG", "2/0 AWG", "3/0 AWG", "4/0 AWG"];
const TIPOS_AISLAMIENTO = ["THW", "THHN", "THWN", "TW", "UF", "XLPE"];

export default function TuberiasTab() {
  const [conductores, setConductores] = useState<ConductorInput[]>([
    { calibre: "12 AWG", tipo_aislamiento: "THW", num_conductores: 3 },
  ]);
  const [tipoTubo, setTipoTubo] = useState<string>("PVC");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [nCalibre, setNCalibre] = useState("12 AWG");
  const [nTipo, setNTipo] = useState("THW");
  const [nCant, setNCant] = useState(3);

  const agregar = () => setConductores([...conductores, { calibre: nCalibre, tipo_aislamiento: nTipo, num_conductores: nCant }]);
  const eliminar = (idx: number) => setConductores(conductores.filter((_, i) => i !== idx));

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/calculos/tuberias`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conductores, tipo_tubo: tipoTubo }),
      });
      if (!res.ok) throw new Error("Error en el servidor");
      setResult(await res.json());
    } catch { setError("No se pudo conectar con el backend."); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-800 font-display">Tuberías y Canalizaciones</h3>
          <p className="text-xs text-slate-400 mt-1">Dimensionamiento de conduit NTC 2050 Cap. 9.</p>
        </div>

        <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="grid grid-cols-3 gap-3">
            <select value={nCalibre} onChange={(e) => setNCalibre(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none">
              {CALIBRES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={nTipo} onChange={(e) => setNTipo(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none">
              {TIPOS_AISLAMIENTO.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="number" min={1} max={50} value={nCant} onChange={(e) => setNCant(Number(e.target.value))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" placeholder="Cant." />
          </div>
          <button type="button" onClick={agregar}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 text-xs transition-all">
            <Plus className="h-4 w-4" /> Agregar Conductor
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tipo de Tubería</label>
          <select value={tipoTubo} onChange={(e) => setTipoTubo(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none">
            <option value="PVC">PVC</option><option value="EMT">EMT</option><option value="RMC">RMC</option>
          </select>
        </div>

        <button type="button" onClick={handleCalculate} disabled={loading || conductores.length === 0}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-slate-950 font-bold py-3 text-sm transition-all disabled:opacity-50 cursor-pointer">
          {loading ? <><RefreshCw className="h-4.5 w-4.5 animate-spin" /> Calculando...</> : <><Zap className="h-4.5 w-4.5" /> Calcular Tubería</>}
        </button>
      </div>

      <div className="lg:col-span-7 space-y-6">
        {conductores.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Conductores ({conductores.length})</h4>
            <div className="space-y-2">
              {conductores.map((c, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg text-xs">
                  <div className="font-semibold text-slate-700">{c.calibre} {c.tipo_aislamiento}</div>
                  <div className="text-slate-500">{c.num_conductores} conductores</div>
                  <button onClick={() => eliminar(i)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

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
                  <span className="text-xs font-bold text-slate-400 uppercase">Diámetro Seleccionado</span>
                  <h2 className="text-3xl font-extrabold text-slate-800 font-display mt-0.5">{result.diametro_seleccionado}</h2>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${result.cumple ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                  {result.cumple ? <><CheckCircle className="h-3.5 w-3.5" /> Cumple</> : <><AlertTriangle className="h-3.5 w-3.5" /> No Cumple</>}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400">Área Requerida</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.area_requerida_mm2} mm²</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400">Área Tubo</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.area_tubo_mm2} mm²</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400">Ocupación</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.pct_ocupacion}%</span>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600">
                <span className="font-bold">Máximo de llenado permitido: </span>{result.pct_maximo_llenado}% ({conductores.reduce((s, c) => s + c.num_conductores, 0)} conductores)
              </div>
            </div>
                        <div className="mb-4 flex justify-end">
              <SaveToProjectButton
                calculationType="tuberias"
                title={`Tuberías - ${result.diametro}`}
                inputData={{ conductores, tipoTuberia, factorRelleno }}
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
            <Ruler className="h-10 w-10 text-slate-600 stroke-[1.5] mb-3" />
            <h4 className="font-bold font-display">Tuberías</h4>
            <p className="text-xs mt-1 max-w-sm">Agrega los conductores para dimensionar la tubería conduit.</p>
          </div>
        )}
      </div>
    </div>
  );
}