"use client";

import { useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Zap, AlertTriangle, CheckCircle, Info, RefreshCw } from "lucide-react";
import SaveToProjectButton from "@/components/calculadora/SaveToProjectButton";

interface ProteccionResult {
  corriente_carga: number;
  corriente_design: number;
  breaker: number;
  factor_usado: string;
  ampacidad_col: string;
  cumple_240_4b: boolean;
  potencia_max: number;
  justificacion: string;
  tabla_referencia: string;
}

export default function ProteccionTab() {
  // Input states
  const [corrienteCarga, setCorrienteCarga] = useState<number>(32);
  const [tipoCarga, setTipoCarga] = useState<string>("continua");
  const [tension, setTension] = useState<number>(208);
  const [numPolos, setNumPolos] = useState<string>("3");

  // UI States
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ProteccionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiUrl()}/api/calculos/protecciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          corriente_carga: corrienteCarga,
          tipo_carga: tipoCarga,
          tension,
          num_polos: numPolos,
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
          <h3 className="text-lg font-bold text-slate-800 font-display">Parámetros de Carga</h3>
          <p className="text-xs text-slate-400 mt-1">Ingresa las características de la corriente a proteger.</p>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Corriente de Carga (Amperes)</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={corrienteCarga}
              onChange={(e) => setCorrienteCarga(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tensión (V)</label>
              <select
                value={tension}
                onChange={(e) => setTension(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={120}>120 V</option>
                <option value={208}>208 V</option>
                <option value={220}>220 V</option>
                <option value={240}>240 V</option>
                <option value={440}>440 V</option>
                <option value={480}>480 V</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Polos Breaker</label>
              <select
                value={numPolos}
                onChange={(e) => setNumPolos(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="1">1 Polo (Monofásico)</option>
                <option value="2">2 Polos (Bifásico)</option>
                <option value="3">3 Polos (Trifásico)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tipo de Carga</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTipoCarga("continua")}
                className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                  tipoCarga === "continua" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Continua (125%)
              </button>
              <button
                type="button"
                onClick={() => setTipoCarga("no_continua")}
                className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                  tipoCarga === "no_continua" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                No Continua (100%)
              </button>
            </div>
            <p className="text-3xs text-slate-400 mt-1.5 leading-relaxed font-semibold">
              * Carga Continua: Aquella cuya corriente máxima se mantiene por 3 horas o más (Art. 100 NTC 2050).
            </p>
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
                <span>Calcular Breaker</span>
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
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Interruptor Sugerido</span>
                  <h2 className="text-3xl font-extrabold text-slate-800 font-display mt-0.5">
                    {result.breaker} A <span className="text-lg font-medium text-slate-400">({numPolos} Polos)</span>
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Tamaño Comercial</span>
                  </span>
                </div>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Carga Nominal</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.corriente_carga} A</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Corriente Diseño</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.corriente_design} A</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 col-span-1">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Factor Aplicado</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.factor_usado}</span>
                </div>
              </div>

              {/* Extra technical details */}
              <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-100 p-2.5 font-bold text-slate-400">
                  <span>Parámetro de Diseño</span>
                  <span className="text-right">Valor Calculado</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 text-slate-700">
                  <span>Columna de Ampacidad NTC 2050</span>
                  <span className="text-right font-semibold">{result.ampacidad_col}</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 text-slate-700">
                  <span>Capacidad de Carga Máxima (VA)</span>
                  <span className="text-right font-semibold">
                    {result.potencia_max.toLocaleString("es-CO")} VA
                  </span>
                </div>
                <div className="grid grid-cols-2 p-2.5 text-slate-700">
                  <span>Cumple Art. 240-4(B) (Conductor protegido)</span>
                  <span className="text-right font-extrabold text-emerald-600">Sí</span>
                </div>
              </div>
            </div>

            {/* Justification & Reference */}
                        <div className="mb-4 flex justify-end">
              <SaveToProjectButton
                calculationType="proteccion"
                title={`Protecciones - Breaker ${result.breaker}A`}
                inputData={{ corrienteCarga, tipoCarga, tension, numPolos }}
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
                <span>Norma: NTC 2050 / Art. 240-6</span>
                <span className="text-primary">{result.tabla_referencia}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl h-96 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Zap className="h-10 w-10 text-slate-600 stroke-[1.5] mb-3" />
            <h4 className="font-bold text-slate-400 font-display">Listo para Calcular</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Suministra la corriente nominal de la carga y el tipo de servicio a la izquierda para dimensionar el interruptor termo-magnético (breaker).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
