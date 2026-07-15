"use client";

import { useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Zap, AlertTriangle, CheckCircle, Info, RefreshCw } from "lucide-react";
import SaveToProjectButton from "@/components/calculadora/SaveToProjectButton";

interface SeccionResult {
  conductor: string;
  seccion_mm2: number;
  corriente_nom: number;
  corriente_design: number;
  ampacidad_terminales: number;
  ampacidad_derated: number;
  columna_terminales: string;
  columna_derating: string;
  criterio_seleccion: string;
  factor_temp: number;
  factor_agrup: number;
  caida_tension: number;
  caida_cumple: boolean;
  alerta_caida: string | null;
  justificacion: string;
  tabla_referencia: string;
  diametro_canalizacion: string;
  calibre_tierra: string;
  seccion_tierra_mm2: number;
  calibre_neutro: string;
  seccion_neutro_mm2: number;
  total_conductores_tuberia: number;
}

export default function SeccionTab() {
  // Input states
  const [potenciaKw, setPotenciaKw] = useState<number>(10);
  const [configuracion, setConfiguracion] = useState<string>("tri_208");
  const [factorPotencia, setFactorPotencia] = useState<number>(0.9);
  const [material, setMaterial] = useState<string>("cu");
  const [aislamiento, setAislamiento] = useState<string>("thw");
  const [longitud, setLongitud] = useState<number>(30);
  const [caidaTensionMax, setCaidaTensionMax] = useState<number>(3);
  const [tempAmbiente, setTempAmbiente] = useState<number>(30);
  const [conductoresAgrupados, setConductoresAgrupados] = useState<number>(3);
  const [temperaturaTerminales, setTemperaturaTerminales] = useState<number>(60);
  const [cargaContinua, setCargaContinua] = useState<boolean>(true);

  // UI States
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SeccionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiUrl()}/api/calculos/seccion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          potencia_kw: potenciaKw,
          configuracion,
          factor_potencia: factorPotencia,
          material,
          aislamiento,
          longitud,
          caida_tension_max: caidaTensionMax,
          temperatura_ambiente: tempAmbiente,
          num_conductores_agrupados: conductoresAgrupados,
          temperatura_terminales: temperaturaTerminales,
          carga_continua: cargaContinua,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Error desconocido");
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("[SeccionTab] Error de cálculo:", err);
      const apiUrl = getApiUrl();
      setError(`No se pudo conectar con el motor de cálculo (${apiUrl}/api/calculos/seccion). Verifica que el servidor backend esté corriendo. Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Column */}
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-800 font-display">Parámetros del Circuito</h3>
          <p className="text-xs text-slate-400 mt-1">Suministra los datos de diseño para el cálculo del conductor.</p>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.6fr] gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Potencia (kW)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={potenciaKw}
                onChange={(e) => setPotenciaKw(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Sistema de Tensión</label>
              <select
                value={configuracion}
                onChange={(e) => setConfiguracion(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="mono_120">Monofásico 120V (1F + 1N)</option>
                <option value="mono_208">Bifásico 120/208V (2F + 1N)</option>
                <option value="mono_240">Monofásico 120/240V (2F + 1N)</option>
                <option value="tri_208">Trifásico 120/208V (3F + 1N)</option>
                <option value="tri_220">Trifásico 220V (3F)</option>
                <option value="tri_440">Trifásico 440V (3F)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Factor de Potencia</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="1"
                value={factorPotencia}
                onChange={(e) => setFactorPotencia(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Longitud (m)</label>
              <input
                type="number"
                min="1"
                value={longitud}
                onChange={(e) => setLongitud(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Material</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMaterial("cu")}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                    material === "cu" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Cobre
                </button>
                <button
                  type="button"
                  onClick={() => setMaterial("al")}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                    material === "al" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Aluminio
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Aislamiento</label>
              <select
                value={aislamiento}
                onChange={(e) => setAislamiento(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="tw">TW (60°C)</option>
                <option value="uf">UF (60°C)</option>
                <option value="thw">THW (75°C)</option>
                <option value="thwn">THWN (75°C)</option>
                <option value="thhn">THHN (90°C)</option>
                <option value="xlpe">XLPE (90°C)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Caída Máx. (%)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                value={caidaTensionMax}
                onChange={(e) => setCaidaTensionMax(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Temp. Ambiente (°C)</label>
              <input
                type="number"
                min="10"
                max="60"
                value={tempAmbiente}
                onChange={(e) => setTempAmbiente(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Cond. Agrupados</label>
              <input
                type="number"
                min="1"
                max="20"
                value={conductoresAgrupados}
                onChange={(e) => setConductoresAgrupados(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Temp. Bornes</label>
              <select
                value={temperaturaTerminales}
                onChange={(e) => setTemperaturaTerminales(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={60}>60 °C (Standard)</option>
                <option value={75}>75 °C (Industrial)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Carga Continua</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setCargaContinua(true)}
                className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                  cargaContinua ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Sí (125%)
              </button>
              <button
                type="button"
                onClick={() => setCargaContinua(false)}
                className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                  !cargaContinua ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                No (100%)
              </button>
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
                <span>Calcular Conductor</span>
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
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-4 gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Calibres del Circuito</span>
                  <div className="mt-2 space-y-2">
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-display">
                      Fases: <span className="text-slate-900">{result.conductor}</span> <span className="text-xs sm:text-sm font-medium text-slate-400 font-sans">({result.seccion_mm2} mm²)</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-400 flex flex-wrap gap-2 items-center">
                      <span className="flex items-center gap-1.5 bg-slate-100 border border-slate-200/50 px-2.5 py-1 rounded-lg">
                        <span className="text-slate-400 uppercase text-3xs font-extrabold tracking-wider">Neutro:</span>
                        <span className="text-slate-800 font-mono">{result.calibre_neutro}</span>
                        {result.seccion_neutro_mm2 > 0 && <span className="text-slate-400 text-2xs font-normal">({result.seccion_neutro_mm2} mm²)</span>}
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-100 border border-slate-200/50 px-2.5 py-1 rounded-lg">
                        <span className="text-slate-400 uppercase text-3xs font-extrabold tracking-wider">Tierra:</span>
                        <span className="text-slate-800 font-mono">{result.calibre_tierra}</span>
                        <span className="text-slate-400 text-2xs font-normal">({result.seccion_tierra_mm2} mm²)</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 self-start sm:self-center">
                  {result.caida_cumple ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Cumple Caída V%</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-red-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Excede Caída V%</span>
                    </span>
                  )}
                  <SaveToProjectButton
                    calculationType="seccion"
                    title={`Sección de Conductor - ${result.conductor} (${result.seccion_mm2}mm²)`}
                    inputData={{ potencia_kw: potenciaKw, configuracion, factor_potencia: factorPotencia, material, aislamiento, longitud, caida_tension_max: caidaTensionMax, temperatura_ambiente: tempAmbiente, num_conductores_agrupados: conductoresAgrupados, temperatura_terminales: temperaturaTerminales, carga_continua: cargaContinua }}
                    resultData={result}
                  />
                </div>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Carga Nominal</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.corriente_nom} A</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Diseño (F={cargaContinua ? "1.25" : "1.00"})</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.corriente_design} A</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Límite Bornes ({result.columna_terminales})</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.ampacidad_terminales} A</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Tubería</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">
                    {result.diametro_canalizacion}
                  </span>
                </div>
              </div>

              {/* Warnings/Alerts Section */}
              {result.alerta_caida && (
                <div className="space-y-3 bg-amber-50/50 border border-amber-200/60 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Advertencias de Seguridad</span>
                  </h4>
                  <div className="text-xs text-amber-700 space-y-1.5 leading-relaxed font-semibold">
                    <p>• {result.alerta_caida}</p>
                  </div>
                </div>
              )}

              {/* Technical Correction Factors & Conduit/PT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Factores de Corrección Aplicados</h4>
                  <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                    <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-100 p-2.5 font-bold text-slate-400">
                      <span>Factor / Parámetro</span>
                      <span className="text-right">Valor</span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 text-slate-700">
                      <span>Criterio de Selección</span>
                      <span className="text-right font-extrabold text-slate-800">{result.criterio_seleccion}</span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 text-slate-700">
                      <span>Factor de Temperatura ({tempAmbiente}°C)</span>
                      <span className="text-right font-semibold">{result.factor_temp}</span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 text-slate-700">
                      <span>Factor de Agrupamiento ({conductoresAgrupados} cond.)</span>
                      <span className="text-right font-semibold">{result.factor_agrup}</span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5 text-slate-700">
                      <span>Caída de Tensión Real</span>
                      <span className="text-right font-extrabold text-slate-800">{result.caida_tension}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Canalización y Puesta a Tierra</h4>
                  <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                    <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-100 p-2.5 font-bold text-slate-400">
                      <span>Elemento de Diseño</span>
                      <span className="text-right">Especificación</span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 text-slate-700">
                      <span>Tubo PVC Conduit</span>
                      <span className="text-right font-extrabold text-slate-800">Ø {result.diametro_canalizacion}</span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 text-slate-700">
                      <span>Conductor P. Tierra (Cu)</span>
                      <span className="text-right font-semibold">{result.calibre_tierra} ({result.seccion_tierra_mm2} mm²)</span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5 text-slate-700">
                      <span>Total Conductores en Tubo</span>
                      <span className="text-right font-semibold">{result.total_conductores_tuberia} hilos</span>
                    </div>
                  </div>
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
                <span>Norma: NTC 2050 / RETIE</span>
                <span className="text-primary">{result.tabla_referencia}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl h-96 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Zap className="h-10 w-10 text-slate-600 stroke-[1.5] mb-3" />
            <h4 className="font-bold text-slate-400 font-display">Listo para Calcular</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Rellena los parámetros técnicos del circuito a la izquierda y presiona el botón para obtener el conductor óptimo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
