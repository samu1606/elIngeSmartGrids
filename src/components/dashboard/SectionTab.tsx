"use client";

import { useState, useEffect } from "react";
import { Zap, Loader2, Play, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function SectionTab() {
  const [potencia, setPotencia] = useState("15000");
  const [tension, setTension] = useState("208");
  const [fp, setFp] = useState("0.9");
  const [sistema, setSistema] = useState("trifasico");
  const [material, setMaterial] = useState("cu");
  const [aislamiento, setAislamiento] = useState("xlpe");
  const [longitud, setLongitud] = useState("20");
  const [caidaMax, setCaidaMax] = useState("3");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    conductor: string;
    corrienteNom: number;
    corrienteDesign: number;
    caidaTension: number;
    tablaReferencia: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDefaults = localStorage.getItem("elinge_calc_defaults");
      if (savedDefaults) {
        try {
          const defaults = JSON.parse(savedDefaults);
          if (defaults.tension) setTension(String(defaults.tension));
          if (defaults.fp) setFp(String(defaults.fp));
          if (defaults.material) setMaterial(defaults.material);
          if (defaults.aislamiento) setAislamiento(defaults.aislamiento);
          if (defaults.caidaMax) setCaidaMax(String(defaults.caidaMax));
          if (defaults.sistema) setSistema(defaults.sistema);
        } catch (e) {
          console.error("Error loading calculation defaults", e);
        }
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const apiBaseUrl = getApiUrl();

    try {
      const response = await fetch(`${apiBaseUrl}/api/calculos/seccion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          potencia: Number(potencia),
          tension: Number(tension),
          factor_potencia: Number(fp),
          sistema: sistema,
          material: material,
          aislamiento: aislamiento,
          longitud: Number(longitud),
          caida_tension_max: Number(caidaMax),
        }),
      });

      if (!response.ok) {
        throw new Error("Error en el servidor de cálculos.");
      }

      const data = await response.json();
      setResult({
        conductor: data.conductor,
        corrienteNom: data.corriente_nom,
        corrienteDesign: data.corriente_design,
        caidaTension: data.caida_tension,
        tablaReferencia: data.tabla_referencia,
      });
    } catch (err: any) {
      setError(err.message || "No se pudo realizar el cálculo de sección.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Form Container (5/12 columns in desktop) */}
      <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6 font-display">
          Parámetros de Diseño
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Potencia W */}
          <div>
            <label className="block text-3xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Carga Activa (Watts)
            </label>
            <input
              type="number"
              value={potencia}
              onChange={(e) => setPotencia(e.target.value)}
              required
              min="1"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary/60 focus:bg-white"
            />
          </div>

          {/* Tension & Sistema */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-3xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Tensión Nominal (V)
              </label>
              <select
                value={tension}
                onChange={(e) => setTension(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-750 outline-none focus:border-primary/60 focus:bg-white cursor-pointer"
              >
                <option value="120">120 V</option>
                <option value="208">208 V</option>
                <option value="220">220 V</option>
                <option value="440">440 V</option>
              </select>
            </div>
            <div>
              <label className="block text-3xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Fase / Sistema
              </label>
              <select
                value={sistema}
                onChange={(e) => setSistema(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-750 outline-none focus:border-primary/60 focus:bg-white cursor-pointer"
              >
                <option value="trifasico">Trifásico</option>
                <option value="monofasico">Monofásico</option>
              </select>
            </div>
          </div>

          {/* FP & Longitud */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-3xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Factor de Potencia (FP)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="1.0"
                value={fp}
                onChange={(e) => setFp(e.target.value)}
                required
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary/60 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-3xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Longitud (Metros)
              </label>
              <input
                type="number"
                value={longitud}
                onChange={(e) => setLongitud(e.target.value)}
                required
                min="1"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary/60 focus:bg-white"
              />
            </div>
          </div>

          {/* Material & Aislamiento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-3xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Material Conductor
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-750 outline-none focus:border-primary/60 focus:bg-white cursor-pointer"
              >
                <option value="cu">Cobre (Cu)</option>
                <option value="al">Aluminio (Al)</option>
              </select>
            </div>
            <div>
              <label className="block text-3xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Tipo Aislamiento
              </label>
              <select
                value={aislamiento}
                onChange={(e) => setAislamiento(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-750 outline-none focus:border-primary/60 focus:bg-white cursor-pointer"
              >
                <option value="tw">TW / UF (60°C)</option>
                <option value="thw">THW / THWN (75°C)</option>
                <option value="xlpe">XLPE / THHN (90°C)</option>
              </select>
            </div>
          </div>

          {/* Caída de tensión max % */}
          <div>
            <label className="block text-3xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Caída de Tensión Máxima Permitida (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              value={caidaMax}
              onChange={(e) => setCaidaMax(e.target.value)}
              required
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none focus:border-primary/60 focus:bg-white"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-bold text-slate-950 hover:bg-primary-dark active:scale-[0.98] disabled:scale-100 disabled:opacity-50 transition-all duration-200 cursor-pointer shadow-sm shadow-primary/10"
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                Dimensionando...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 fill-slate-950" />
                Calcular Dimensionamiento
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Container (7/12 columns in desktop) */}
      <div className="lg:col-span-7 space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex gap-4 text-slate-700">
            <AlertTriangle className="h-6 w-6 text-red-500 shrink-0" />
            <div>
              <h4 className="font-bold text-red-800 font-display">Error de Cálculo</h4>
              <p className="text-xs text-red-650 mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {result ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 font-display">Conductor Sugerido</h3>
                <p className="text-3xs text-slate-500 font-mono mt-0.5">{result.tablaReferencia}</p>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-3xs font-extrabold text-emerald-600 uppercase tracking-wider">
                RETIE Aprobado
              </span>
            </div>

            {/* Cable Caliber Visual */}
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black text-slate-800 font-display tracking-tight">
                {result.conductor}
              </span>
              <span className="text-sm font-bold text-primary uppercase tracking-wide">
                {material === "cu" ? "Cobre (Cu)" : "Aluminio (Al)"}
              </span>
            </div>

            {/* Electrical Details */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <span className="text-3xs font-semibold text-slate-450 uppercase tracking-wider block">
                  Corriente Nominal
                </span>
                <p className="text-xl font-bold text-slate-750 font-mono mt-1">
                  {result.corrienteNom} A
                </p>
              </div>
              <div>
                <span className="text-3xs font-semibold text-slate-450 uppercase tracking-wider block">
                  Corriente de Diseño (1.25x)
                </span>
                <p className="text-xl font-bold text-slate-750 font-mono mt-1">
                  {result.corrienteDesign} A
                </p>
              </div>
            </div>

            {/* Voltage Drop Result */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-3xs font-semibold text-slate-450 uppercase tracking-wider">
                  Caída de Tensión Estimada
                </span>
                <span className={`text-2xs font-bold font-mono ${
                  result.caidaTension <= Number(caidaMax) ? "text-emerald-500" : "text-rose-500"
                }`}>
                  {result.caidaTension}% / {caidaMax}% max
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    result.caidaTension <= Number(caidaMax) ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min((result.caidaTension / Number(caidaMax)) * 100, 100)}%` }}
                />
              </div>

              {result.caidaTension > Number(caidaMax) && (
                <p className="text-3xs text-rose-550 flex items-center gap-1.5 font-medium pt-1">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>La caída de tensión supera el límite sugerido del {caidaMax}%. Se recomienda acortar la longitud o aumentar el calibre.</span>
                </p>
              )}
            </div>

            {/* Technical note */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-3xs text-slate-500 leading-relaxed font-mono">
              <span className="font-bold text-slate-600 block mb-1">Nota Técnica NTC 2050 Art. 310:</span>
              La capacidad del conductor seleccionado está estimada para un tendido de máximo 3 conductores portadores de corriente en tubería (conduit) al aire libre a una temperatura ambiente de 30°C. Si sus condiciones de obra difieren, aplique factores de corrección por agrupamiento y temperatura.
            </div>

          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center text-slate-500">
            <FileText className="h-10 w-10 mx-auto text-slate-600 mb-4" />
            <h4 className="font-bold text-slate-500 font-display">Esperando Parámetros</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Ingresa los datos del circuito eléctrico en el formulario y haz clic en calcular para dimensionar el conductor.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
