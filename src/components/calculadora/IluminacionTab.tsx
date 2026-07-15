"use client";

import { useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Zap, AlertTriangle, CheckCircle, Info, RefreshCw } from "lucide-react";
import SaveToProjectButton from "@/components/calculadora/SaveToProjectButton";

interface IluminacionResult {
  area: number;
  lux_objetivo: number;
  luminarias: number;
  luminarias_exactas: number;
  distribucion: string;
  filas: number;
  columnas: number;
  espaciamiento: string;
  carga_total: number;
  densidad_potencia: number;
  retie_cumple: boolean;
  limite_retie: number;
  cu_usado: number;
  llf_usado: number;
  justificacion: string;
  tabla_referencia: string;
}

export default function IluminacionTab() {
  // Input states
  const [largo, setLargo] = useState<number>(12);
  const [ancho, setAncho] = useState<number>(8);
  const [luxObjetivo, setLuxObjetivo] = useState<number>(500);
  const [lumensLampara, setLumensLampara] = useState<number>(3200);
  const [cu, setCu] = useState<number>(0.6);
  const [llf, setLlf] = useState<number>(0.8);
  const [potenciaLampara, setPotenciaLampara] = useState<number>(36);
  const [tipoArea, setTipoArea] = useState<string>("oficina");

  // UI States
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<IluminacionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiUrl()}/api/calculos/iluminacion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          largo,
          ancho,
          lux_objetivo: luxObjetivo,
          lumens_lampara: lumensLampara,
          cu,
          llf,
          potencia_lampara: potenciaLampara,
          tipo_area: tipoArea,
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
          <h3 className="text-lg font-bold text-slate-800 font-display">Parámetros del Espacio</h3>
          <p className="text-xs text-slate-400 mt-1">Ingresa las dimensiones y requerimientos del área a iluminar.</p>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Largo (m)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={largo}
                onChange={(e) => setLargo(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Ancho (m)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={ancho}
                onChange={(e) => setAncho(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Lux Objetivo</label>
              <input
                type="number"
                min="10"
                value={luxObjetivo}
                onChange={(e) => setLuxObjetivo(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tipo de Área</label>
              <select
                value={tipoArea}
                onChange={(e) => setTipoArea(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="oficina">Oficina (Límite 10 W/m²)</option>
                <option value="comercial">Comercial (Límite 15 W/m²)</option>
                <option value="industrial">Industrial (Límite 12 W/m²)</option>
                <option value="exterior">Exterior (Límite 5 W/m²)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Lúmenes Lámpara</label>
              <input
                type="number"
                min="100"
                value={lumensLampara}
                onChange={(e) => setLumensLampara(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Potencia Lámpara (W)</label>
              <input
                type="number"
                min="1"
                value={potenciaLampara}
                onChange={(e) => setPotenciaLampara(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Coef. Utilización (CU)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="1"
                value={cu}
                onChange={(e) => setCu(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Mantenimiento (LLF)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="1"
                value={llf}
                onChange={(e) => setLlf(Number(e.target.value))}
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
                <span>Diseñar Iluminación</span>
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
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Luminarias Requeridas</span>
                  <h2 className="text-3xl font-extrabold text-slate-800 font-display mt-0.5">
                    {result.luminarias} <span className="text-lg font-medium text-slate-400">Unidades</span>
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  {result.retie_cumple ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Cumple RETIE VEEI</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-red-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Excede Límite RETIE</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Área Total</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.area} m²</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Distribución</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block text-ellipsis overflow-hidden whitespace-nowrap">{result.distribucion}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Carga de Alumbrado</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.carga_total} W</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Densidad Real</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.densidad_potencia.toFixed(2)} W/m²</span>
                </div>
              </div>

              {/* Extra technical details */}
              <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-100 p-2.5 font-bold text-slate-400">
                  <span>Requisito RETIE</span>
                  <span className="text-right">Valor</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 text-slate-700">
                  <span>Densidad Límite Máxima para {tipoArea.toUpperCase()}</span>
                  <span className="text-right font-semibold">{result.limite_retie} W/m²</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 text-slate-700">
                  <span>Cálculo de Fracción Exacta</span>
                  <span className="text-right font-semibold">{result.luminarias_exactas.toFixed(2)} lamparas</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 text-slate-700">
                  <span>Eficiencia Energética de Alumbrado</span>
                  <span className="text-right font-bold text-emerald-600">Cumple Criterio RETIE</span>
                </div>
              </div>
            </div>

            {/* Justification & Reference */}
                        <div className="mb-4 flex justify-end">
              <SaveToProjectButton
                calculationType="iluminacion"
                title={`Iluminación - ${result.luminarias} luminarias`}
                inputData={{ tipoArea, largo, ancho, alturaMontaje, nivelLux, tipoLuminaria, factorMantenimiento }}
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
                <span>Norma: RETIE Capítulo 17 / NTC 2050</span>
                <span className="text-primary">{result.tabla_referencia}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl h-96 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Zap className="h-10 w-10 text-slate-600 stroke-[1.5] mb-3" />
            <h4 className="font-bold text-slate-400 font-display">Listo para Calcular</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Suministra las dimensiones y niveles de iluminación requeridos a la izquierda para diseñar la cantidad de luminarias e inspeccionar el cumplimiento de densidad de carga RETIE.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
