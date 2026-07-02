"use client";

import { useState, useEffect } from "react";
import { Settings, Loader2, Info, Sparkles } from "lucide-react";

import { getApiUrl } from "@/lib/api";

interface MotorResult {
  conductor: string;
  breaker: number;
  flc: number;
  thermal: string;
  contactor: string;
  conductor_amps: number;
  tabla_referencia: string;
  justificacion_normativa_ia: string;
}

export default function MotoresTab() {
  const [hp, setHp] = useState<number>(5);
  const [tension, setTension] = useState<number>(220);
  const [eficiencia, setEficiencia] = useState<number>(0.85);
  const [fp, setFp] = useState<number>(0.85);
  const [sistema, setSistema] = useState<"trifasico" | "monofasico">("trifasico");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MotorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDefaults = localStorage.getItem("elinge_calc_defaults");
      if (savedDefaults) {
        try {
          const defaults = JSON.parse(savedDefaults);
          if (defaults.tension) setTension(Number(defaults.tension));
          if (defaults.fp) setFp(Number(defaults.fp));
          if (defaults.sistema) setSistema(defaults.sistema as "trifasico" | "monofasico");
        } catch (e) {
          console.error("Error loading defaults in MotoresTab", e);
        }
      }
    }
  }, []);

  const API_URL = getApiUrl();

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/calculos/motores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          potencia_hp: hp,
          tension: tension,
          eficiencia: eficiencia,
          fp: fp,
          sistema: sistema,
        }),
      });

      if (!res.ok) throw new Error("Error en el cálculo");
      const data: MotorResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con la API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Columna Izquierda: Formulario */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 font-display mb-4">Parámetros del Motor</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Potencia (HP)</label>
              <input type="number" value={hp} onChange={(e) => setHp(Number(e.target.value))} min="0.1" step="0.1" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tensión (V)</label>
              <input type="number" value={tension} onChange={(e) => setTension(Number(e.target.value))} min="110" step="1" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Efic. (η)</label>
                <input type="number" value={eficiencia} onChange={(e) => setEficiencia(Number(e.target.value))} min="0.1" max="1" step="0.01" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">F.P. (cos φ)</label>
                <input type="number" value={fp} onChange={(e) => setFp(Number(e.target.value))} min="0.1" max="1" step="0.01" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sistema</label>
              <select value={sistema} onChange={(e) => setSistema(e.target.value as "trifasico" | "monofasico")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                <option value="trifasico">Trifásico</option>
                <option value="monofasico">Monofásico</option>
              </select>
            </div>

            <button onClick={handleCalculate} disabled={loading} className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-slate-800 font-bold py-3 px-4 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-70">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Settings className="h-5 w-5" />}
              Calcular Motor
            </button>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Resultados */}
      <div className="lg:col-span-2">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 font-medium flex items-center gap-2">
            <Info className="h-5 w-5" />
            {error}
          </div>
        )}

        {result ? (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 font-display mb-6 border-b pb-4">
                Especificaciones del Circuito
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cte. Nominal (FLC)</p>
                  <p className="text-xl font-bold text-slate-800 font-display">{result.flc} A</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cte. Conductor</p>
                  <p className="text-xl font-bold text-slate-800 font-display">{result.conductor_amps} A</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Calibre Cu</p>
                  <p className="text-xl font-black text-emerald-600 font-display">{result.conductor}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Protección ITM</p>
                  <p className="text-xl font-black text-emerald-600 font-display">{result.breaker} A</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Relé Térmico</p>
                    <p className="text-lg font-bold text-slate-800 font-display">{result.thermal}</p>
                  </div>
                  <Settings className="h-6 w-6 text-slate-600" />
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Contactor Sugerido</p>
                    <p className="text-lg font-bold text-slate-800 font-display">{result.contactor}</p>
                  </div>
                  <Settings className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </div>

            {/* Justificación IA */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-indigo-900 font-display">
                  Memoria Descriptiva Generada por IA
                </h3>
              </div>
              <p className="text-sm text-indigo-800/90 leading-relaxed italic">
                {result.justificacion_normativa_ia}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-12 text-slate-500">
            <p className="font-medium text-center">Ingresa los datos y presiona "Calcular" para ver las protecciones y conductores del motor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
