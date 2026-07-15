"use client";

import { useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Zap, AlertTriangle, CheckCircle, Info, RefreshCw, Plus, Trash2, Gauge, Boxes } from "lucide-react";
import SaveToProjectButton from "@/components/calculadora/SaveToProjectButton";

interface Carga {
  nombre: string;
  potencia_w: number;
  factor_potencia: number;
  sistema: string; // "mono", "bi", "tri"
  fase_a: boolean;
  fase_b: boolean;
  fase_c: boolean;
  tipo_carga: string;
}

interface CuadroCargasResult {
  desglose_fases: any;
  corriente_diseno: number;
  desbalance_pct: number;
  conductor_alimentador: string;
  breaker_principal: number;
  justificacion: string;
  tabla_referencia: string;
  [key: string]: any;
}

// =====================================================================
// TIPOS DE TABLERO
// =====================================================================
type TipoTablero = "mono_120" | "bifasico" | "trifasico";

interface OpcionTablero {
  value: TipoTablero;
  label: string;
  tension: number;
  sistema: string;
  circuitos: number[];
  tiene_totalizador: boolean;
  fases_disponibles: ("A" | "B" | "C")[];
  sistemas_carga: { value: string; label: string }[];
}

const TIPOS_TABLERO: OpcionTablero[] = [
  {
    value: "mono_120",
    label: "Monofásico 120V",
    tension: 120,
    sistema: "monofasico",
    circuitos: [4, 6, 8, 12],
    tiene_totalizador: false,
    fases_disponibles: ["A"],
    sistemas_carga: [{ value: "mono", label: "Monofásico" }],
  },
  {
    value: "bifasico",
    label: "Bifásico 120/240V",
    tension: 240,
    sistema: "monofasico",
    circuitos: [4, 8, 12, 16, 20, 24, 28, 36],
    tiene_totalizador: true,
    fases_disponibles: ["A", "B"],
    sistemas_carga: [{ value: "mono", label: "Monofásico" }, { value: "bi", label: "Bifásico" }],
  },
  {
    value: "trifasico",
    label: "Trifásico 208/220V",
    tension: 208,
    sistema: "trifasico",
    circuitos: [12, 16, 20, 24, 28, 36],
    tiene_totalizador: true,
    fases_disponibles: ["A", "B", "C"],
    sistemas_carga: [{ value: "mono", label: "Monofásico" }, { value: "bi", label: "Bifásico" }, { value: "tri", label: "Trifásico" }],
  },
];

export default function CuadroCargasTab() {
  const [tipoTablero, setTipoTablero] = useState<TipoTablero>("trifasico");
  const [numCircuitos, setNumCircuitos] = useState<number>(12);
  const [tieneTotalizador, setTieneTotalizador] = useState<boolean>(true);

  const tableroConfig = TIPOS_TABLERO.find(t => t.value === tipoTablero)!;

  const [cargas, setCargas] = useState<Carga[]>([
    { nombre: "Iluminación", potencia_w: 1500, factor_potencia: 0.9, sistema: "mono", fase_a: true, fase_b: false, fase_c: false, tipo_carga: "iluminacion" },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CuadroCargasResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Nueva carga
  const [nuevaNombre, setNuevaNombre] = useState("");
  const [nuevaPotencia, setNuevaPotencia] = useState<number>(1000);
  const [nuevaFP, setNuevaFP] = useState<number>(0.9);
  const [nuevaSistema, setNuevaSistema] = useState<string>("mono");
  const [nuevaFaseA, setNuevaFaseA] = useState(true);
  const [nuevaFaseB, setNuevaFaseB] = useState(false);
  const [nuevaFaseC, setNuevaFaseC] = useState(false);
  const [nuevaTipo, setNuevaTipo] = useState<string>("continua");

  const handleTipoTablero = (tipo: TipoTablero) => {
    const config = TIPOS_TABLERO.find(t => t.value === tipo)!;
    setTipoTablero(tipo);
    setNumCircuitos(config.circuitos[0]);
    setTieneTotalizador(config.tiene_totalizador);
    // Reset sistema de nueva carga al primero disponible
    setNuevaSistema(config.sistemas_carga[0].value);
    // Reset fases
    setNuevaFaseA(config.fases_disponibles.includes("A"));
    setNuevaFaseB(false);
    setNuevaFaseC(false);
    // Ajustar cargas existentes
    setCargas(prev => prev.map(c => {
      const fases: Record<"A" | "B" | "C", boolean> = { A: false, B: false, C: false };
      if (c.sistema === "tri" && config.fases_disponibles.length === 3) {
        fases.A = fases.B = fases.C = true;
      } else if (c.sistema === "mono") {
        // Mantener primera fase activa que esté disponible
        if (c.fase_a && config.fases_disponibles.includes("A")) fases.A = true;
        else if (c.fase_b && config.fases_disponibles.includes("B")) fases.B = true;
        else if (c.fase_c && config.fases_disponibles.includes("C")) fases.C = true;
        else fases[config.fases_disponibles[0]] = true;
      } else if (c.sistema === "bi") {
        if (config.fases_disponibles.length >= 2) {
          fases.A = true; fases.B = true;
        } else {
          fases[config.fases_disponibles[0]] = true;
        }
      }
      return { ...c, fase_a: fases.A, fase_b: fases.B, fase_c: fases.C };
    }));
  };

  // Manejar cambio de sistema de carga — reset fases apropiadamente
  const handleSistemaCarga = (sistema: string) => {
    setNuevaSistema(sistema);
    if (sistema === "tri") {
      // Trifásico: todas las fases disponibles
      setNuevaFaseA(tableroConfig.fases_disponibles.includes("A"));
      setNuevaFaseB(tableroConfig.fases_disponibles.includes("B"));
      setNuevaFaseC(tableroConfig.fases_disponibles.includes("C"));
    } else if (sistema === "bi") {
      // Bifásico: exactamente 2 fases (primeras 2 disponibles)
      const disponibles = tableroConfig.fases_disponibles;
      setNuevaFaseA(disponibles.includes("A"));
      setNuevaFaseB(disponibles.includes("B") && disponibles.length >= 2);
      setNuevaFaseC(false);
    } else {
      // Monofásico: solo 1 fase (la primera disponible que no esté usada)
      setNuevaFaseA(tableroConfig.fases_disponibles.includes("A"));
      setNuevaFaseB(false);
      setNuevaFaseC(false);
    }
  };

  // Para monofásico: radio button (solo una fase)
  // Para bifásico: exactamente 2 fases
  const handleFaseMono = (fase: "A" | "B" | "C") => {
    setNuevaFaseA(fase === "A");
    setNuevaFaseB(fase === "B");
    setNuevaFaseC(fase === "C");
  };

  const handleFaseBi = (fase: "A" | "B" | "C") => {
    // Toggle la fase, mantener exactamente 2 activas
    const current: Record<"A" | "B" | "C", boolean> = {
      A: nuevaFaseA, B: nuevaFaseB, C: nuevaFaseC,
    };
    current[fase] = !current[fase];
    const activas = (current.A ? 1 : 0) + (current.B ? 1 : 0) + (current.C ? 1 : 0);
    if (activas === 2 || activas === 1) {
      // Permitir si hay 1 o 2 (para que pueda cambiar)
      setNuevaFaseA(current.A);
      setNuevaFaseB(current.B);
      setNuevaFaseC(current.C);
    }
  };

  // Totalizador NO ocupa circuitos
  const puedeAgregar = cargas.length < numCircuitos;

  const agregarCarga = () => {
    if (!nuevaNombre.trim() || !puedeAgregar) return;
    setCargas([...cargas, {
      nombre: nuevaNombre, potencia_w: nuevaPotencia, factor_potencia: nuevaFP,
      sistema: nuevaSistema, fase_a: nuevaFaseA, fase_b: nuevaFaseB, fase_c: nuevaFaseC, tipo_carga: nuevaTipo
    }]);
    setNuevaNombre(""); setNuevaPotencia(1000); setNuevaFP(0.9);
    // Reset fases para la siguiente carga
    handleSistemaCarga(nuevaSistema);
  };

  const eliminarCarga = (idx: number) => setCargas(cargas.filter((_, i) => i !== idx));

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/calculos/cuadro-cargas`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cargas,
          tension: tableroConfig.tension,
          sistema: tableroConfig.sistema,
          tipo_tablero: tipoTablero,
          num_circuitos: numCircuitos,
          tiene_totalizador: tieneTotalizador,
        }),
      });
      if (!res.ok) throw new Error("Error en el servidor");
      setResult(await res.json());
    } catch { setError("No se pudo conectar con el backend."); }
    finally { setLoading(false); }
  };

  // Contar fases activas para mostrar badges
  const getFasesActivas = (c: Carga): string[] => {
    const fases: string[] = [];
    if (c.fase_a) fases.push("A");
    if (c.fase_b) fases.push("B");
    if (c.fase_c) fases.push("C");
    return fases;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-800 font-display">Cuadro de Cargas</h3>
          <p className="text-xs text-slate-400 mt-1">Selecciona el tablero y agrega las cargas.</p>
        </div>

        {/* === SELECTOR DE TABLERO === */}
        <div className="space-y-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-emerald-600" />
            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Tipo de Tablero</h4>
          </div>
          {/* Botones de tipo */}
          <div className="space-y-2">
            {TIPOS_TABLERO.map(t => (
              <button key={t.value} type="button" onClick={() => handleTipoTablero(t.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all border text-left ${
                  tipoTablero === t.value
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
          {/* Circuitos */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Número de Circuitos</label>
            <div className="flex flex-wrap gap-2">
              {tableroConfig.circuitos.map(n => (
                <button key={n} type="button" onClick={() => setNumCircuitos(n)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    numCircuitos === n
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-500 border-slate-200 hover:border-emerald-300"
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          {/* Totalizador — NO ocupa circuitos */}
          {tableroConfig.tiene_totalizador && (
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
              <input type="checkbox" checked={tieneTotalizador} onChange={(e) => setTieneTotalizador(e.target.checked)}
                className="h-4 w-4 rounded accent-emerald-600" />
              Incluir totalizador
            </label>
          )}
          {/* Info del tablero */}
          <div className="flex items-center gap-3 text-xs text-slate-500 bg-white rounded-lg px-3 py-2 border border-slate-100">
            <span className="font-bold">Tensión:</span> {tableroConfig.tension}V
            <span className="font-bold ml-2">Sistema:</span> {tableroConfig.sistema}
            <span className="font-bold ml-2">Circuitos usados:</span> {cargas.length}/{numCircuitos}
          </div>
        </div>

        {/* Form nueva carga */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <input type="text" placeholder="Nombre de carga" value={nuevaNombre}
            onChange={(e) => setNuevaNombre(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Potencia (W)</label>
              <input type="number" min={1} value={nuevaPotencia}
                onChange={(e) => setNuevaPotencia(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Factor Pot.</label>
              <input type="number" min={0.1} max={1} step={0.01} value={nuevaFP}
                onChange={(e) => setNuevaFP(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none" />
            </div>
          </div>
          {/* Sistema de carga — dinámico según tablero */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Sistema de la Carga</label>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${tableroConfig.sistemas_carga.length}, 1fr)` }}>
              {tableroConfig.sistemas_carga.map(s => (
                <button key={s.value} type="button" onClick={() => handleSistemaCarga(s.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                    nuevaSistema === s.value
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <select value={nuevaTipo} onChange={(e) => setNuevaTipo(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none">
            <option value="continua">Continua</option>
            <option value="no_continua">No Continua</option>
            <option value="iluminacion">Iluminación</option>
            <option value="receptaculos">Receptáculos</option>
            <option value="motor">Motor</option>
          </select>

          {/* === Selector de fases según sistema de carga === */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
              {nuevaSistema === "tri" ? "Fases (Automático — Trifásico)" :
               nuevaSistema === "bi" ? "Selecciona 2 Fases" :
               "Selecciona 1 Fase"}
            </label>

            {nuevaSistema === "tri" ? (
              // Trifásico: automático, mostrar badge
              <div className="flex gap-1.5">
                {tableroConfig.fases_disponibles.map(f => (
                  <span key={f} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: f === "A" ? "#f59e0b" : f === "B" ? "#3b82f6" : "#10b981" }}>
                    Fase {f}
                  </span>
                ))}
                <span className="text-xs text-slate-400 self-center ml-1">↻ Balanceada</span>
              </div>
            ) : nuevaSistema === "bi" ? (
              // Bifásico: checkboxes para exactamente 2 fases
              <div className="flex gap-2">
                {tableroConfig.fases_disponibles.map(f => (
                  <button key={f} type="button"
                    onClick={() => handleFaseBi(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      (f === "A" && nuevaFaseA) || (f === "B" && nuevaFaseB) || (f === "C" && nuevaFaseC)
                        ? "text-white border-transparent"
                        : "bg-white text-slate-400 border-slate-200"
                    }`}
                    style={(f === "A" && nuevaFaseA) || (f === "B" && nuevaFaseB) || (f === "C" && nuevaFaseC)
                      ? { background: f === "A" ? "#f59e0b" : f === "B" ? "#3b82f6" : "#10b981" }
                      : {}}>
                    Fase {f}
                  </button>
                ))}
              </div>
            ) : (
              // Monofásico: radio button — solo 1 fase
              <div className="flex gap-2">
                {tableroConfig.fases_disponibles.map(f => (
                  <button key={f} type="button"
                    onClick={() => handleFaseMono(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      (f === "A" && nuevaFaseA) || (f === "B" && nuevaFaseB) || (f === "C" && nuevaFaseC)
                        ? "text-white border-transparent"
                        : "bg-white text-slate-400 border-slate-200"
                    }`}
                    style={(f === "A" && nuevaFaseA) || (f === "B" && nuevaFaseB) || (f === "C" && nuevaFaseC)
                      ? { background: f === "A" ? "#f59e0b" : f === "B" ? "#3b82f6" : "#10b981" }
                      : {}}>
                    Fase {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button type="button" onClick={agregarCarga} disabled={!puedeAgregar}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <Plus className="h-4 w-4" /> {puedeAgregar ? "Agregar Carga" : `Máximo ${numCircuitos} circuitos`}
          </button>
        </div>

        <button type="button" onClick={handleCalculate} disabled={loading || cargas.length === 0}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-slate-950 font-bold py-3 text-sm transition-all disabled:opacity-50 cursor-pointer">
          {loading ? <><RefreshCw className="h-4.5 w-4.5 animate-spin" /> Calculando...</> : <><Zap className="h-4.5 w-4.5" /> Calcular Cuadro</>}
        </button>
      </div>

      <div className="lg:col-span-7 space-y-6">
        {/* Lista de cargas */}
        {cargas.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Cargas ({cargas.length}/{numCircuitos})</h4>
              {tieneTotalizador && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">+ Totalizador</span>
              )}
            </div>
            <div className="space-y-2">
              {cargas.map((c, i) => {
                const fases = getFasesActivas(c);
                const sistemaLabel = c.sistema === "mono" ? "Mono" : c.sistema === "bi" ? "Bi" : "Tri";
                return (
                  <div key={i} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg text-xs">
                    <div className="font-semibold text-slate-700 truncate flex-1">{i + 1}. {c.nombre}</div>
                    <div className="text-slate-500 mx-2 shrink-0">{c.potencia_w}W · {sistemaLabel}</div>
                    <div className="flex items-center gap-1 mx-2 shrink-0">
                      {fases.map(f => (
                        <span key={f} className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white"
                          style={{ background: f === "A" ? "#f59e0b" : f === "B" ? "#3b82f6" : "#10b981" }}>
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="text-slate-400 shrink-0 hidden sm:block">{c.tipo_carga}</div>
                    <button onClick={() => eliminarCarga(i)} className="text-red-400 hover:text-red-600 ml-2 shrink-0"><Trash2 className="h-4 w-4" /></button>
                  </div>
                );
              })}
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
                  <span className="text-xs font-bold text-slate-400 uppercase">Resultado</span>
                  <h2 className="text-2xl font-extrabold text-slate-800 font-display mt-0.5">Breaker Principal: {result.breaker_principal || "N/A"} A</h2>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                  <CheckCircle className="h-3.5 w-3.5" /> Calculado
                </span>
              </div>
              <pre className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
            </div>
                        <div className="mb-4 flex justify-end">
              <SaveToProjectButton
                calculationType="cuadro_cargas"
                title={`Cuadro de Cargas - Breaker ${result.breaker_principal}A`}
                inputData={{ cargas }}
                resultData={result}
              />
            </div>

<div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <Info className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Memoria Justificativa</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">&ldquo;{result.justificacion}&rdquo;</p>
              <div className="text-3xs font-extrabold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-200/60">
                {result.tabla_referencia}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl h-96 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Gauge className="h-10 w-10 text-slate-600 stroke-[1.5] mb-3" />
            <h4 className="font-bold font-display">Cuadro de Cargas</h4>
            <p className="text-xs mt-1 max-w-sm">Selecciona el tipo de tablero y agrega las cargas para calcular el balance de fases, conductor alimentador y breaker principal.</p>
          </div>
        )}
      </div>
    </div>
  );
}