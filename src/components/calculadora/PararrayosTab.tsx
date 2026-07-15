"use client";

import { useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Zap, AlertTriangle, CheckCircle, Info, RefreshCw, CloudLightning } from "lucide-react";
import SaveToProjectButton from "@/components/calculadora/SaveToProjectButton";

interface Resultado {
  nivel_proteccion: string;
  angulo_proteccion_grados: number;
  radio_proteccion_m: number;
  area_cobertura_uno_m2: number;
  num_pararrayos: number;
  separacion_entre_m: number;
  cumple_retie: boolean;
  estado_retie: string;
  descargas_esperadas_por_anio: number;
  justificacion: string;
  tabla_referencia: string;
}

export default function PararrayosTab() {
  const [tipoEstructura, setTipoEstructura] = useState<string>("residencial");
  const [altura, setAltura] = useState<number>(12);
  const [area, setArea] = useState<number>(200);
  const [nivelProteccion, setNivelProteccion] = useState<string>("IV");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/calculos/pararrayos`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo_estructura: tipoEstructura, altura_m: altura, area_m2: area, nivel_proteccion: nivelProteccion }),
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
          <h3 className="text-lg font-bold text-slate-800 font-display">Pararrayos</h3>
          <p className="text-xs text-slate-400 mt-1">Protección contra rayos RETIE Art. 17.</p>
        </div>
        <form onSubmit={handleCalculate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tipo de Estructura</label>
            <select value={tipoEstructura} onChange={(e) => setTipoEstructura(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none">
              <option value="residencial">Residencial</option>
              <option value="comercial">Comercial</option>
              <option value="industrial">Industrial</option>
              <option value="repetidores">Repetidores/Torres</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Altura (m)</label>
              <input type="number" min={0.1} value={altura} onChange={(e) => setAltura(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Área (m²)</label>
              <input type="number" min={0.1} value={area} onChange={(e) => setArea(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Nivel de Protección</label>
            <select value={nivelProteccion} onChange={(e) => setNivelProteccion(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none">
              <option value="I">Nivel I (Máxima protección)</option>
              <option value="II">Nivel II (Alta protección)</option>
              <option value="III">Nivel III (Media protección)</option>
              <option value="IV">Nivel IV (Básica)</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-slate-950 font-bold py-3 text-sm transition-all disabled:opacity-50 cursor-pointer">
            {loading ? <><RefreshCw className="h-4.5 w-4.5 animate-spin" /> Calculando...</> : <><Zap className="h-4.5 w-4.5" /> Calcular Protección</>}
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
                  <span className="text-xs font-bold text-slate-400 uppercase">Pararrayos Requeridos</span>
                  <h2 className="text-3xl font-extrabold text-slate-800 font-display mt-0.5">{result.num_pararrayos} {result.num_pararrayos === 1 ? "Unidad" : "Unidades"}</h2>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${result.cumple_retie ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                  {result.cumple_retie ? <><CheckCircle className="h-3.5 w-3.5" /> Cumple RETIE</> : <><AlertTriangle className="h-3.5 w-3.5" /> {result.estado_retie}</>}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400">Ángulo Protección</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.angulo_proteccion_grados}°</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400">Radio Cobertura</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.radio_proteccion_m} m</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400">Separación</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.separacion_entre_m} m</span>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600">
                <span className="font-bold">Área cubierta por unidad: </span>{result.area_cobertura_uno_m2.toLocaleString()} m² · <span className="font-bold">Descargas esperadas: </span>{result.descargas_esperadas_por_anio}/año
              </div>
            </div>
                        <div className="mb-4 flex justify-end">
              <SaveToProjectButton
                calculationType="pararrayos"
                title={`Pararrayos - Nivel ${result.nivel_proteccion}`}
                inputData={{ tipoEdificio, altura, area, nivelCeraunico, tipoProteccion }}
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
            <CloudLightning className="h-10 w-10 text-slate-600 stroke-[1.5] mb-3" />
            <h4 className="font-bold font-display">Pararrayos</h4>
            <p className="text-xs mt-1 max-w-sm">Diseña la protección contra rayos según RETIE Art. 17.</p>
          </div>
        )}
      </div>
    </div>
  );
}