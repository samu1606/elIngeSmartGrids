"use client";

import { useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Zap, AlertTriangle, CheckCircle, Info, RefreshCw, DollarSign, TrendingDown } from "lucide-react";

interface ReactivaResult {
  qc: number;
  capacitancia: number;
  s_antes: number;
  s_despues: number;
  ahorro_kva: number;
  corriente_antes: number;
  corriente_despues: number;
  penalizacion: boolean;
  costo_penalizacion_mensual: number;
  retorno_inversion_meses: number;
  fp_cumple_retie: boolean;
  justificacion: string;
  tabla_referencia: string;
}

export default function ReactivaTab() {
  // Input states
  const [potenciaKw, setPotenciaKw] = useState<number>(45);
  const [fpActual, setFpActual] = useState<number>(0.78);
  const [fpObjetivo, setFpObjetivo] = useState<number>(0.96);
  const [tension, setTension] = useState<number>(208);
  const [frecuencia, setFrecuencia] = useState<number>(60);
  const [costoKwh, setCostoKwh] = useState<number>(850);

  // UI States
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ReactivaResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiUrl()}/api/calculos/reactiva`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          potencia_kw: potenciaKw,
          fp_actual: fpActual,
          fp_objetivo: fpObjetivo,
          tension,
          frecuencia,
          costo_kwh: costoKwh,
        }),
      });

      if (!response.ok) {
        throw new Error("Error en el servidor de cálculos.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el motor de cálculo. Verifica que el servidor backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Column */}
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-800 font-display">Compensación de Reactiva</h3>
          <p className="text-xs text-slate-400 mt-1">Calcula el banco de condensadores para corregir el factor de potencia.</p>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Potencia Activa (kW)</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={potenciaKw}
              onChange={(e) => setPotenciaKw(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">FP Actual</label>
              <input
                type="number"
                step="0.01"
                min="0.4"
                max="0.99"
                value={fpActual}
                onChange={(e) => setFpActual(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">FP Objetivo</label>
              <input
                type="number"
                step="0.01"
                min="0.9"
                max="1.0"
                value={fpObjetivo}
                onChange={(e) => setFpObjetivo(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tensión (V)</label>
              <select
                value={tension}
                onChange={(e) => setTension(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={208}>208 V (Trifásico)</option>
                <option value={220}>220 V (Trifásico)</option>
                <option value={440}>440 V (Trifásico)</option>
                <option value={480}>480 V (Trifásico)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Frecuencia</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFrecuencia(50)}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                    frecuencia === 50 ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  50 Hz
                </button>
                <button
                  type="button"
                  onClick={() => setFrecuencia(60)}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                    frecuencia === 60 ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  60 Hz
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Costo de Energía (COP/kWh)</label>
            <input
              type="number"
              min="100"
              value={costoKwh}
              onChange={(e) => setCostoKwh(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-slate-950 font-bold py-3 text-sm transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                <span>Calculando...</span>
              </>
            ) : (
              <>
                <Zap className="h-4.5 w-4.5 fill-slate-950/20" />
                <span>Calcular Reactiva</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-7 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 flex items-start gap-3">
            <AlertTriangle className="h-5.5 w-5.5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Error en la Conexión</h4>
              <p className="text-xs text-red-600/95 mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {result ? (
          <>
            {/* Main Result Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Banco de Condensadores</span>
                  <h2 className="text-3xl font-extrabold text-slate-800 font-display mt-0.5">
                    {result.qc} <span className="text-lg font-medium text-slate-400 font-sans">kVAR</span>
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  {result.fp_cumple_retie ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Cumple FP CREG ({fpObjetivo})</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-red-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>FP Objetivo Bajo</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Financial & ROI alert */}
              {result.penalizacion && (
                <div className="bg-rose-50 border border-rose-200/80 rounded-xl p-4 flex gap-3.5 items-start">
                  <DollarSign className="h-6.5 w-6.5 text-rose-600 shrink-0 bg-rose-100 rounded-lg p-1" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">Penalización de CREG Activa</h4>
                    <p className="text-xs text-rose-700 mt-1 font-semibold leading-relaxed">
                      Con un FP de {fpActual}, estás expuesto a cobros adicionales de reactiva estimados en{" "}
                      <span className="font-extrabold text-rose-800">${result.costo_penalizacion_mensual.toLocaleString("es-CO")} COP / mes</span>.
                    </p>
                  </div>
                </div>
              )}

              {/* Grid of details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Capacitancia Total</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.capacitancia} μF</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Ahorro Aparente</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.ahorro_kva} kVA</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Corriente Antes</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.corriente_antes} A</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Corriente Después</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.corriente_despues} A</span>
                </div>
              </div>

              {/* ROI box */}
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4 flex gap-3.5 items-start">
                <TrendingDown className="h-6.5 w-6.5 text-emerald-600 shrink-0 bg-emerald-100 rounded-lg p-1" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Retorno de Inversión (ROI)</h4>
                  <p className="text-xs text-emerald-700 mt-1 font-semibold leading-relaxed">
                    El costo del banco de condensadores se amortizará en aproximadamente{" "}
                    <span className="font-extrabold text-emerald-800">{result.retorno_inversion_meses} meses</span> debido a la eliminación de penalidades.
                  </p>
                </div>
              </div>

              {/* Extra technical details */}
              <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-100 p-2.5 font-bold text-slate-400">
                  <span>Parámetro Eléctrico</span>
                  <span className="text-right">Valor</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 text-slate-700">
                  <span>Potencia Aparente Inicial (S1)</span>
                  <span className="text-right font-semibold">{result.s_antes} kVA</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 text-slate-700">
                  <span>Potencia Aparente Corregida (S2)</span>
                  <span className="text-right font-semibold">{result.s_despues} kVA</span>
                </div>
              </div>
            </div>

            {/* Justification & Reference */}
            <div className="bg-white text-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <Info className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wider">Memoria Justificativa</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &ldquo;{result.justificacion}&rdquo;
              </p>
              <div className="flex items-center justify-between text-3xs font-extrabold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-200/60">
                <span>Normas: CREG Res. 108/97 / RETIE / NTC 2050</span>
                <span className="text-primary">{result.tabla_referencia}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl h-96 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Zap className="h-10 w-10 text-slate-600 stroke-[1.5] mb-3" />
            <h4 className="font-bold text-slate-400 font-display">Listo para Calcular</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Suministra los kW activos de la instalación y el factor de potencia actual a la izquierda para evaluar la capacidad reactiva requerida, penalidades aplicadas por CREG y estimar el ROI.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
