"use client";

import { useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Zap, AlertTriangle, CheckCircle, Info, RefreshCw, Cpu } from "lucide-react";
import SaveToProjectButton from "@/components/calculadora/SaveToProjectButton";

interface MotorResult {
  conductor: string;
  seccion_mm2: number;
  breaker: number;
  contactor: string;
  flc: number;
  conductor_amps: number;
  thermal: string;
  corriente_arranque: number;
  factor_servicio: number;
  justificacion_normativa_ia: string;
  justificacion: string;
  tabla_referencia: string;
}

export default function MotorTab() {
  // Input states
  const [potenciaHp, setPotenciaHp] = useState<number>(10);
  const [tension, setTension] = useState<number>(208);
  const [eficiencia, setEficiencia] = useState<number>(0.85);
  const [fp, setFp] = useState<number>(0.85);
  const [sistema, setSistema] = useState<string>("trifasico");
  const [tipoArranque, setTipoArranque] = useState<string>("directo");
  const [letraCodigo, setLetraCodigo] = useState<string>("F");

  // UI States
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<MotorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiUrl()}/api/calculos/motores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          potencia_hp: potenciaHp,
          tension,
          eficiencia,
          fp,
          sistema,
          tipo_arranque: tipoArranque,
          letra_codigo: letraCodigo,
        }),
      });

      if (!response.ok) {
        throw new Error("Error en el servidor de cálculos.");
      }

      const data = await response.json();
      setResult(data);    } catch (err) {
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
          <h3 className="text-lg font-bold text-slate-800 font-display">Especificaciones de Motor</h3>
          <p className="text-xs text-slate-400 mt-1">Define los datos de la placa del motor para el dimensionamiento.</p>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Potencia (HP)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={potenciaHp}
                onChange={(e) => setPotenciaHp(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tensión (V)</label>
              <select
                value={tension}
                onChange={(e) => setTension(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={120}>120 V (Monofásico)</option>
                <option value={208}>208 V (Trifásico)</option>
                <option value={220}>220 V (Trifásico)</option>
                <option value={440}>440 V (Trifásico)</option>
                <option value={480}>480 V (Trifásico)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Sistema</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSistema("monofasico")}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                    sistema === "monofasico" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Monofásico
                </button>
                <button
                  type="button"
                  onClick={() => setSistema("trifasico")}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                    sistema === "trifasico" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Trifásico
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Factor de Servicio</label>
              <select
                value={letraCodigo === "F" ? "1.15" : "1.0"}
                onChange={(e) => setLetraCodigo(e.target.value === "1.15" ? "F" : "A")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="1.15">1.15 (Térmico al 125%)</option>
                <option value="1.0">1.0 (Térmico al 115%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Eficiencia (η)</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="1.0"
                value={eficiencia}
                onChange={(e) => setEficiencia(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Factor de Potencia</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="1.0"
                value={fp}
                onChange={(e) => setFp(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tipo de Arranque</label>
              <select
                value={tipoArranque}
                onChange={(e) => setTipoArranque(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="directo">Directo (D.O.L)</option>
                <option value="estrella_delta">Estrella-Triángulo</option>
                <option value="suave">Arrancador Suave</option>
                <option value="variador">VFD (Variador)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Letra de Código NEMA</label>
              <select
                value={letraCodigo}
                onChange={(e) => setLetraCodigo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="A">Clase A</option>
                <option value="B">Clase B</option>
                <option value="C">Clase C</option>
                <option value="D">Clase D</option>
                <option value="E">Clase E</option>
                <option value="F">Clase F (Estándar)</option>
                <option value="G">Clase G</option>
                <option value="H">Clase H</option>
              </select>
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
                <span>Generando con IA...</span>
              </>
            ) : (
              <>
                <Zap className="h-4.5 w-4.5 fill-slate-950/20" />
                <span>Dimensionar Ramal</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-7 space-y-6">
        {loading && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-pulse">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                <div className="h-8 w-48 bg-slate-200 rounded"></div>
              </div>
              <div className="h-6 w-28 bg-slate-200 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl"></div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200 rounded"></div>
              <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
              <div className="h-4 w-2/3 bg-slate-200 rounded"></div>
            </div>
            <div className="h-20 bg-slate-900 rounded-xl"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 flex items-start gap-3">
            <AlertTriangle className="h-5.5 w-5.5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Error en la Conexión</h4>
              <p className="text-xs text-red-600/95 mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {!loading && result ? (
          <>
            {/* Main Result Card */}
                        <div className="mb-4 flex justify-end">
              <SaveToProjectButton
                calculationType="motor"
                title={`Motor - Conductor ${result.conductor} (${result.seccion_mm2}mm²)`}
                inputData={{ potenciaHp, tension, eficiencia, fp, sistema, tipoArranque, letraCodigo }}
                resultData={result}
              />
            </div>

<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Conductor Sugerido</span>
                  <h2 className="text-3xl font-extrabold text-slate-800 font-display mt-0.5">
                    {result.conductor} <span className="text-lg font-medium text-slate-400">({result.seccion_mm2} mm²)</span>
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Límite Bornes 60°C</span>
                  </span>
                </div>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Breaker ITM</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.breaker} A</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Térmico (Sobrecarga)</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.thermal}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Contactor Sugerido</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block text-ellipsis overflow-hidden whitespace-nowrap">{result.contactor}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">FLC Motor</span>
                  <span className="text-base font-extrabold text-slate-700 mt-1 block">{result.flc} A</span>
                </div>
              </div>

              {/* Extra technical details */}
              <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-100 p-2.5 font-bold text-slate-400">
                  <span>Parámetro de Diseño</span>
                  <span className="text-right">Valor</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 text-slate-700">
                  <span>Ampacidad Mínima Conductor (125% FLC)</span>
                  <span className="text-right font-semibold">{result.conductor_amps} A</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 border-b border-slate-100 text-slate-700">
                  <span>Corriente de Arranque Estimada (LRA)</span>
                  <span className="text-right font-semibold">{result.corriente_arranque} A</span>
                </div>
                <div className="grid grid-cols-2 p-2.5 text-slate-700">
                  <span>Factor de Servicio del Motor</span>
                  <span className="text-right font-semibold">{result.factor_servicio}</span>
                </div>
              </div>
            </div>

            {/* AI Justification */}
            {result.justificacion_normativa_ia && (
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 border-b border-emerald-500/10 pb-3">
                  <Cpu className="h-4.5 w-4.5 text-primary animate-pulse" />
                  <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-400 font-display uppercase tracking-wider">Justificación Técnica (Ollama Gemma)</h3>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {result.justificacion_normativa_ia}
                </p>
              </div>
            )}

            {/* Base Justification */}
            <div className="bg-white text-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <Info className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-sm font-bold text-slate-800 font-display uppercase tracking-wider">Justificación Técnica Estándar</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &ldquo;{result.justificacion}&rdquo;
              </p>
              <div className="flex items-center justify-between text-3xs font-extrabold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-200/60">
                <span>Norma: NTC 2050 / Art. 430</span>
                <span className="text-primary">{result.tabla_referencia}</span>
              </div>
            </div>
          </>
        ) : (
          !loading && (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl h-96 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Zap className="h-10 w-10 text-slate-600 stroke-[1.5] mb-3" />
              <h4 className="font-bold text-slate-400 font-display">Listo para Calcular</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Ingresa los datos de placa del motor a la izquierda para dimensionar el ramal alimentador, contactor, protección térmica e interruptor contra cortocircuitos.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
