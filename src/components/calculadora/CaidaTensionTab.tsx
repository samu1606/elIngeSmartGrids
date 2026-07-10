"use client";

import { useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Zap, AlertTriangle, CheckCircle, Info, RefreshCw, Plus, Trash2, TrendingDown } from "lucide-react";

interface Tramo {
  longitud_m: number;
  corriente_a: number;
  calibre: string;
  material: string;
}

interface Resultado {
  detalle_tramos: any[];
  caida_total_v: number;
  caida_total_pct: number;
  cumple_ramales_3pct: boolean;
  cumple_total_5pct: boolean;
  cumple: boolean;
  justificacion: string;
  tabla_referencia: string;
}

const CALIBRES = ["14 AWG", "12 AWG", "10 AWG", "8 AWG", "6 AWG", "4 AWG", "3 AWG", "2 AWG", "1 AWG", "1/0 AWG", "2/0 AWG", "3/0 AWG", "4/0 AWG", "250 kcmil", "350 kcmil", "500 kcmil"];

export default function CaidaTensionTab() {
  const [tramos, setTramos] = useState<Tramo[]>([
    { longitud_m: 15, corriente_a: 20, calibre: "12 AWG", material: "cu" },
  ]);
  const [tensionNominal, setTensionNominal] = useState<number>(208);
  const [sistema, setSistema] = useState<string>("trifasico");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Nuevo tramo
  const [nLong, setNLong] = useState<number>(10);
  const [nCorriente, setNCorriente] = useState<number>(15);
  const [nCalibre, setNCalibre] = useState<string>("12 AWG");
  const [nMaterial, setNMaterial] = useState<string>("cu");

  const agregarTramo = () => {
    setTramos([...tramos, { longitud_m: nLong, corriente_a: nCorriente, calibre: nCalibre, material: nMaterial }]);
  };
  const eliminarTramo = (idx: number) => setTramos(tramos.filter((_, i) => i !== idx));

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/calculos/caida-tension`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tramos, tension_nominal: tensionNominal, sistema }),
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
          <h3 className="text-lg font-bold text-slate-800 font-display">Caída de Tensión</h3>
          <p className="text-xs text-slate-400 mt-1">Calcula la caída acumulada en múltiples tramos.</p>
        </div>

        {/* Nuevo tramo */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Longitud (m)</label>
              <input type="number" min={0.1} value={nLong} onChange={(e) => setNLong(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Corriente (A)</label>
              <input type="number" min={0.1} value={nCorriente} onChange={(e) => setNCorriente(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={nCalibre} onChange={(e) => setNCalibre(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none">
              {CALIBRES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={nMaterial} onChange={(e) => setNMaterial(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none">
              <option value="cu">Cobre</option>
              <option value="al">Aluminio</option>
            </select>
          </div>
          <button type="button" onClick={agregarTramo}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 text-xs transition-all">
            <Plus className="h-4 w-4" /> Agregar Tramo
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tensión Nominal (V)</label>
            <input type="number" value={tensionNominal} onChange={(e) => setTensionNominal(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Sistema</label>
            <select value={sistema} onChange={(e) => setSistema(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none">
              <option value="trifasico">Trifásico</option>
              <option value="monofasico">Monofásico</option>
            </select>
          </div>
        </div>

        <button type="button" onClick={handleCalculate} disabled={loading || tramos.length === 0}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-slate-950 font-bold py-3 text-sm transition-all disabled:opacity-50 cursor-pointer">
          {loading ? <><RefreshCw className="h-4.5 w-4.5 animate-spin" /> Calculando...</> : <><Zap className="h-4.5 w-4.5" /> Calcular Caída</>}
        </button>
      </div>

      <div className="lg:col-span-7 space-y-6">
        {tramos.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Tramos ({tramos.length})</h4>
            <div className="space-y-2">
              {tramos.map((t, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg text-xs">
                  <div className="font-semibold text-slate-700">Tramo {i + 1}</div>
                  <div className="text-slate-500">{t.longitud_m}m · {t.corriente_a}A · {t.calibre} · {t.material === "cu" ? "Cu" : "Al"}</div>
                  <button onClick={() => eliminarTramo(i)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
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
                  <span className="text-xs font-bold text-slate-400 uppercase">Caída Total</span>
                  <h2 className="text-3xl font-extrabold text-slate-800 font-display mt-0.5">{result.caida_total_v} V ({result.caida_total_pct}%)</h2>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${result.cumple ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                  {result.cumple ? <><CheckCircle className="h-3.5 w-3.5" /> Cumple</> : <><AlertTriangle className="h-3.5 w-3.5" /> No Cumple</>}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400">Ramales (≤3%)</span>
                  <span className={`text-base font-extrabold mt-1 block ${result.cumple_ramales_3pct ? "text-emerald-600" : "text-red-600"}`}>{result.cumple_ramales_3pct ? "Sí" : "No"}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400">Total (≤5%)</span>
                  <span className={`text-base font-extrabold mt-1 block ${result.cumple_total_5pct ? "text-emerald-600" : "text-red-600"}`}>{result.cumple_total_5pct ? "Sí" : "No"}</span>
                </div>
              </div>
              {result.detalle_tramos && result.detalle_tramos.length > 0 && (
                <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-5 bg-slate-50 border-b border-slate-100 p-2.5 font-bold text-slate-400">
                    <span>Tramo</span><span>Long (m)</span><span>I (A)</span><span>Caída (V)</span><span className="text-right">%</span>
                  </div>
                  {result.detalle_tramos.map((t, i) => (
                    <div key={i} className="grid grid-cols-5 p-2.5 border-b border-slate-100 text-slate-700">
                      <span>{t.tramo}</span><span>{t.longitud_m}</span><span>{t.corriente_a}</span><span>{t.caida_v}</span><span className="text-right font-semibold">{t.caida_pct}%</span>
                    </div>
                  ))}
                </div>
              )}
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
            <TrendingDown className="h-10 w-10 text-slate-600 stroke-[1.5] mb-3" />
            <h4 className="font-bold font-display">Caída de Tensión</h4>
            <p className="text-xs mt-1 max-w-sm">Agrega tramos de circuito para calcular la caída de tensión acumulada.</p>
          </div>
        )}
      </div>
    </div>
  );
}