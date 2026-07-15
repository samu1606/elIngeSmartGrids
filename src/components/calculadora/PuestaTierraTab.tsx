"use client";

import { useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Zap, AlertTriangle, CheckCircle, Info, RefreshCw } from "lucide-react";
import SaveToProjectButton from "@/components/calculadora/SaveToProjectButton";

interface PuestaTierraResult {
  r_total: number;
  r_single: number;
  cumple: boolean;
  limite: number;
  num_varillas: number;
  separacion_varillas: number;
  conductor_tierra: string;
  seccion_conductor_mm2: number;
  rho_usado: number;
  estado: string;
  sugerencia: string;
  metodo_medicion: string;
  justificacion: string;
  tabla_referencia: string;
}

export default function PuestaTierraTab() {
  // Input states
  const [resistividad, setResistividad] = useState<number>(120);
  const [longitudElectrodo, setLongitudElectrodo] = useState<number>(2.4);
  const [diametroElectrodo, setDiametroElectrodo] = useState<number>(0.0159);
  const [tension, setTension] = useState<number>(208);
  const [requerimiento, setRequerimiento] = useState<number>(25);

  // UI States
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PuestaTierraResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiUrl()}/api/calculos/puesta_tierra`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resistividad,
          longitud_electrodo: longitudElectrodo,
          diametro_electrodo: diametroElectrodo,
          tension,
          requerimiento,
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
          <h3 className="text-lg font-bold text-slate-800 font-display">Sistema de Puesta a Tierra</h3>
          <p className="text-xs text-slate-400 mt-1">Calcula la resistencia de puesta a tierra con electrodos en paralelo.</p>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Resistividad del Suelo (Ω-m)</label>
            <input
              type="number"
              min="1"
              value={resistividad}
              onChange={(e) => setResistividad(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
            <p className="text-3xs text-slate-400 mt-1.5 leading-relaxed font-semibold">
              * Típicos: Tierra vegetal húmeda (~30 Ω-m), terreno arcilloso (~150 Ω-m), arena seca (~1000 Ω-m).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Varilla Long. (m)</label>
              <select
                value={longitudElectrodo}
                onChange={(e) => setLongitudElectrodo(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={1.8}>1.8 m (6 pies)</option>
                <option value={2.4}>2.4 m (8 pies)</option>
                <option value={3.0}>3.0 m (10 pies)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Varilla Diám. (pulg)</label>
              <select
                value={diametroElectrodo}
                onChange={(e) => setDiametroElectrodo(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={0.0127}>1/2 pulgada (12.7 mm)</option>
                <option value={0.0159}>5/8 pulgada (15.9 mm)</option>
                <option value={0.0191}>3/4 pulgada (19.1 mm)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tensión Red (V)</label>
              <select
                value={tension}
                onChange={(e) => setTension(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={120}>120 V</option>
                <option value={208}>208 V</option>
                <option value={220}>220 V</option>
                <option value={440}>440 V</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">R Objetivo (Ω)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={requerimiento}
                onChange={(e) => setRequerimiento(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
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
                <span>Calcular Electrodo</span>
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
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Resistencia Obtenida</span>
                  <h2 className="text-3xl font-extrabold text-slate-800 font-display mt-0.5">
                    {result.r_total.toFixed(2)} <span className="text-lg font-medium text-slate-400 font-sans">Ω</span>
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  {result.cumple ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Aprobado &lt; {requerimiento} Ω</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Mejora Requerida</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Suggestions banner */}
              {!result.cumple && (
                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex gap-3.5 items-start">
                  <AlertTriangle className="h-6.5 w-6.5 text-amber-600 shrink-0 bg-amber-100 rounded-lg p-1" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Acción Correctiva Sugerida</h4>
                    <p className="text-xs text-slate-600 mt-1 font-semibold leading-relaxed">
                      {result.sugerencia}
                    </p>
                  </div>
                </div>
              )}

              {/* Grid of details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Electrodos Necesarios</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.num_varillas} Varilla(s)</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Distancia Mínima</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.separacion_varillas.toFixed(1)} m</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Conductor Tierra</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block text-ellipsis overflow-hidden whitespace-nowrap">{result.conductor_tierra}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Resistencia 1 Rod</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.r_single.toFixed(1)} Ω</span>
                </div>
              </div>

              {/* Extra technical details */}
              <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-100 p-2.5 font-bold text-slate-400">
                  <span>Detalles de Construcción</span>
                  <span className="text-right">Medida</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 text-slate-700">
                  <span>Sección de Cable de Puesta a Tierra</span>
                  <span className="text-right font-semibold">{result.seccion_conductor_mm2} mm²</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 text-slate-700">
                  <span>Resistividad de Tierra Registrada</span>
                  <span className="text-right font-semibold">{result.rho_usado} Ω-m</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 text-slate-700">
                  <span>Método de Ensayo de Certificación</span>
                  <span className="text-right font-semibold text-slate-800">{result.metodo_medicion}</span>
                </div>
              </div>
            </div>

            {/* Justification & Reference */}
                        <div className="mb-4 flex justify-end">
              <SaveToProjectButton
                calculationType="puesta_tierra"
                title={`Puesta a Tierra - R=${result.r_total}Ω`}
                inputData={{ resistividad, longitudElectrodo, diametroElectrodo, profundidad, tipoSuelo, tipoElectrodo }}
                resultData={result}
              />
            </div>

<div className="bg-white text-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <Info className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wider">Memoria Justificativa</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &ldquo;{result.justificacion}&rdquo;
              </p>
              <div className="flex items-center justify-between text-3xs font-extrabold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-200/60">
                <span>Normas: IEEE 142 / NTC 2050 / RETIE Art. 15</span>
                <span className="text-primary">{result.tabla_referencia}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl h-96 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Zap className="h-10 w-10 text-slate-600 stroke-[1.5] mb-3" />
            <h4 className="font-bold text-slate-400 font-display">Listo para Calcular</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Suministra la resistividad media del terreno a la izquierda para evaluar si se cumple el límite de resistencia y dimensionar el cable electrodo según la NTC 2050.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
