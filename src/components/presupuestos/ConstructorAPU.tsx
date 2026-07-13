'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Search, Plus, Trash2, Wrench, Package, Truck, Users,
  Calculator, Save, ChevronRight, FlaskConical, ArrowLeft,
  Loader2, CheckCircle, AlertCircle, X, Pencil,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { obtenerAPUCompleto, actualizarAPU, eliminarAPU, obtenerAPUs } from '@/lib/supabase/apus';
import type { APU } from '@/lib/supabase/apus';
import { useConstructorAPUReducer } from '@/hooks/useConstructorAPU';
import type { Insumo, TipoInsumo } from '@/types/apu';
import { useRouter } from 'next/navigation';

// ============================================================
// Constantes
// ============================================================

const TABS: { key: TipoInsumo; label: string; icon: typeof Wrench; color: string; bgColor: string }[] = [
  { key: 'equipo', label: 'Equipos', icon: Wrench, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { key: 'material', label: 'Materiales', icon: Package, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { key: 'transporte', label: 'Transportes', icon: Truck, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  { key: 'mano_obra', label: 'Mano de Obra', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50' },
];

const LABEL_CANTIDAD: Record<TipoInsumo, string> = {
  equipo: 'Rendimiento (días)',
  material: 'Cantidad',
  transporte: 'Distancia (km/viajes)',
  mano_obra: 'Rendimiento (horas)',
};

const UNIDADES: string[] = ['und', 'm', 'm²', 'm³', 'kg', 'hora', 'día', 'viaje', 'km', 'punto', 'global', 'gal'];

const supabase = createClient();

// ============================================================
// Helpers
// ============================================================

function formatCOP(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor);
}

// ============================================================
// Componente Principal
// ============================================================

export default function ConstructorAPUPage() {
  const router = useRouter();
  const { state, dispatch, insumosPorTipo, subtotalPorTipo, costoTotal } =
    useConstructorAPUReducer();

  const [insumosDisponibles, setInsumosDisponibles] = useState<Insumo[]>([]);
  const [loadingInsumos, setLoadingInsumos] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estado de edición
  const [editingAPUId, setEditingAPUId] = useState<number | null>(null);
  const [misAPUs, setMisAPUs] = useState<APU[]>([]);
  const [loadingAPUs, setLoadingAPUs] = useState(false);

  // Quick-create insumo
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [newInsumo, setNewInsumo] = useState({ descripcion: '', unidad: 'und', precio_unitario: 0 });
  const [savingInsumo, setSavingInsumo] = useState(false);

  const recargarAPUs = async () => {
    setLoadingAPUs(true);
    const apus = await obtenerAPUs();
    setMisAPUs(apus);
    setLoadingAPUs(false);
  };

  const handleQuickCreate = async () => {
    if (!newInsumo.descripcion.trim() || newInsumo.precio_unitario <= 0) return;
    setSavingInsumo(true);
    const { data, error } = await supabase.from('insumos').insert({
      descripcion: newInsumo.descripcion.trim(),
      unidad: newInsumo.unidad,
      tipo: state.tabActivo,
      precio_unitario: newInsumo.precio_unitario,
    }).select('*').single();
    setSavingInsumo(false);
    if (error) {
      setErrorMsg('Error al crear insumo: ' + error.message);
    } else if (data) {
      setInsumosDisponibles(prev => [...prev, data as Insumo]);
      dispatch({ type: 'AGREGAR_INSUMO', insumo: data as Insumo });
      setNewInsumo({ descripcion: '', unidad: 'und', precio_unitario: 0 });
      setShowQuickCreate(false);
    }
  };

  // Custom hook-like: recargar insumos
  const recargarInsumos = async () => {
    setLoadingInsumos(true);
    const { data } = await supabase.from('insumos').select('*').eq('tipo', state.tabActivo).order('descripcion');
    setInsumosDisponibles(data || []);
    setLoadingInsumos(false);
  };

  // Cargar biblioteca de APUs al montar
  useEffect(() => { recargarAPUs(); }, []);

  // Cargar insumos cuando cambia la pestaña
  useEffect(() => {
    let cancelled = false;
    async function cargarInsumos() {
      setLoadingInsumos(true);
      const { data, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('tipo', state.tabActivo)
        .order('descripcion');

      if (!cancelled) {
        if (error) {
          console.warn('Error cargando insumos (probablemente la tabla no existe aún):', error.message);
          setInsumosDisponibles([]);
        } else {
          setInsumosDisponibles(data || []);
        }
        setLoadingInsumos(false);
      }
    }
    cargarInsumos();
    return () => { cancelled = true; };
  }, [state.tabActivo]);

  // Filtrar localmente (debounce manual con estado)
  const [filtro, setFiltro] = useState('');
  const insumosFiltrados = useMemo(() => {
    if (!filtro.trim()) return insumosDisponibles;
    const q = filtro.toLowerCase();
    return insumosDisponibles.filter(
      (i) =>
        i.descripcion.toLowerCase().includes(q) ||
        i.unidad.toLowerCase().includes(q)
    );
  }, [insumosDisponibles, filtro]);

  const handleAgregarInsumo = useCallback(
    (insumo: Insumo) => dispatch({ type: 'AGREGAR_INSUMO', insumo }),
    [dispatch]
  );

  const handleGuardarAPU = useCallback(async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!state.apu.codigo.trim() || !state.apu.descripcion.trim()) {
      setErrorMsg('Completa el código y la descripción del APU.');
      return;
    }
    if (state.insumos.length === 0) {
      setErrorMsg('Agrega al menos un insumo al APU.');
      return;
    }

    dispatch({ type: 'SET_SAVING', value: true });

    const detalles = state.insumos.map((item) => ({
      insumo_id: item.insumo.id,
      cantidad_rendimiento: item.cantidad,
    }));

    if (editingAPUId !== null) {
      // === UPDATE ===
      const { error } = await actualizarAPU(editingAPUId, {
        codigo: state.apu.codigo.trim(),
        descripcion: state.apu.descripcion.trim(),
        unidad: state.apu.unidad,
      }, detalles);

      dispatch({ type: 'SET_SAVING', value: false });

      if (error) {
        setErrorMsg('Error al actualizar el APU: ' + error);
      } else {
        setSuccessMsg(`✅ APU "${state.apu.codigo}" actualizado con ${detalles.length} insumos.`);
        setEditingAPUId(null);
        dispatch({ type: 'RESET' });
        recargarAPUs();
      }
    } else {
      // === INSERT (verificar duplicado primero) ===
      const { data: existente } = await supabase
        .from('apus')
        .select('id')
        .eq('codigo', state.apu.codigo.trim())
        .maybeSingle();

      if (existente) {
        setErrorMsg(`El código "${state.apu.codigo}" ya existe. Usa otro código o edita el APU existente.`);
        dispatch({ type: 'SET_SAVING', value: false });
        return;
      }

      const { data: apuData, error: apuError } = await supabase
        .from('apus')
        .insert({
          codigo: state.apu.codigo.trim(),
          descripcion: state.apu.descripcion.trim(),
          unidad: state.apu.unidad,
        })
        .select('id')
        .single();

      if (apuError || !apuData) {
        setErrorMsg('Error al crear el APU: ' + (apuError?.message ?? 'Desconocido'));
        dispatch({ type: 'SET_SAVING', value: false });
        return;
      }

      const { error: detError } = await supabase
        .from('detalle_apu')
        .insert(detalles.map(d => ({ apu_id: apuData.id, insumo_id: d.insumo_id, cantidad_rendimiento: d.cantidad_rendimiento })));

      dispatch({ type: 'SET_SAVING', value: false });

      if (detError) {
        setErrorMsg('APU creado pero error en detalles: ' + detError.message);
      } else {
        setSuccessMsg(`✅ APU "${state.apu.codigo}" creado con ${detalles.length} insumos. Costo total: ${formatCOP(costoTotal)}`);
        dispatch({ type: 'RESET' });
        recargarAPUs();
      }
    }
  }, [state.apu, state.insumos, costoTotal, dispatch, editingAPUId]);

  // Editar APU existente
  const handleEditarAPU = async (apuId: number) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const completo = await obtenerAPUCompleto(apuId);
    if (!completo) {
      setErrorMsg('No se pudo cargar el APU para editar.');
      return;
    }
    // Cargar en el reducer
    const insumosCargados = completo.detalles.map((d) => ({
      localId: crypto.randomUUID(),
      insumo: d.insumos,
      cantidad: d.cantidad_rendimiento || 1,
      valorTotal: (d.cantidad_rendimiento || 0) * (d.insumos?.precio_unitario || 0),
    }));
    dispatch({
      type: 'CARGAR_APU',
      apu: {
        codigo: completo.apu.codigo,
        descripcion: completo.apu.descripcion,
        unidad: completo.apu.unidad,
      },
      insumos: insumosCargados,
    });
    setEditingAPUId(apuId);
  };

  // Eliminar APU
  const handleEliminarAPU = async (apuId: number, nombre: string) => {
    if (!confirm(`¿Eliminar APU "${nombre}" y todos sus insumos?`)) return;
    const { error } = await eliminarAPU(apuId);
    if (error) {
      setErrorMsg('Error al eliminar APU: ' + error);
    } else {
      setSuccessMsg('APU eliminado correctamente.');
      recargarAPUs();
      if (editingAPUId === apuId) {
        setEditingAPUId(null);
        dispatch({ type: 'RESET' });
      }
    }
  };

  // Cancelar edición
  const handleCancelarEdicion = () => {
    setEditingAPUId(null);
    dispatch({ type: 'RESET' });
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const tabActual = TABS.find((t) => t.key === state.tabActivo)!;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display flex items-center gap-2">
            <FlaskConical className="h-7 w-7 text-primary" />
            Constructor de APU
            {editingAPUId !== null && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                Editando: {state.apu.codigo || 'APU'}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {editingAPUId !== null ? 'Modifica los datos y haz clic en Actualizar APU' : 'Crea Análisis de Precios Unitarios combinando equipos, materiales, transportes y mano de obra'}
          </p>
        </div>
      </div>

      {/* Mensajes */}
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Biblioteca de APUs */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-primary" />
            Biblioteca de APU
            {loadingAPUs && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
          </h3>
          <span className="text-xs text-slate-400">{misAPUs.length} APUs</span>
        </div>
        {misAPUs.length === 0 && !loadingAPUs ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">
            No hay APUs todavía. Crea el primero usando el formulario de abajo.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {misAPUs.map((apu) => (
              <div
                key={apu.id}
                className={`flex items-center justify-between px-5 py-2.5 hover:bg-slate-50 transition-colors ${
                  editingAPUId === apu.id ? 'bg-amber-50/50 border-l-2 border-amber-400' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{apu.codigo}</span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{apu.unidad}</span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium truncate mt-0.5">{apu.descripcion}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button
                    onClick={() => handleEditarAPU(apu.id)}
                    className="text-slate-350 hover:text-primary hover:bg-primary/5 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Editar APU"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEliminarAPU(apu.id, apu.codigo)}
                    className="text-slate-350 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Eliminar APU"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Encabezado: datos del APU */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Calculator className="w-4 h-4 text-primary" />
          Datos del APU
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Código (ej: APU-INST-007)"
            value={state.apu.codigo}
            onChange={(e) =>
              dispatch({ type: 'SET_APU_FIELD', field: 'codigo', value: e.target.value })
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-mono"
          />
          <input
            type="text"
            placeholder="Descripción del APU"
            value={state.apu.descripcion}
            onChange={(e) =>
              dispatch({ type: 'SET_APU_FIELD', field: 'descripcion', value: e.target.value })
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all md:col-span-2"
          />
          <select
            value={state.apu.unidad}
            onChange={(e) =>
              dispatch({ type: 'SET_APU_FIELD', field: 'unidad', value: e.target.value })
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
          >
            {UNIDADES.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm">
        {TABS.map(({ key, label, icon: Icon, color, bgColor }) => {
          const activo = state.tabActivo === key;
          const count = insumosPorTipo(key).length;
          return (
            <button
              key={key}
              onClick={() => dispatch({ type: 'SET_TAB', tab: key })}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activo
                  ? `bg-slate-100 text-slate-800 shadow-sm ring-1 ring-slate-200`
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${activo ? color : ''}`} />
              {label}
              {count > 0 && (
                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activo ? `${bgColor} ${color}` : 'bg-slate-100 text-slate-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Buscador de insumos — Select con filtro + Quick Create */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-[30%] shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Buscar ${tabActual.label.toLowerCase()}...`}
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <select
            className="w-full sm:flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary/50 cursor-pointer min-w-0"
            value=""
            onChange={(e) => {
              const id = Number(e.target.value);
              if (!id) return;
              const insumo = insumosDisponibles.find((i) => i.id === id);
              if (insumo) handleAgregarInsumo(insumo);
              e.target.value = '';
            }}
          >
            <option value="">Seleccionar insumo...</option>
            {insumosFiltrados.map((insumo) => (
              <option key={insumo.id} value={insumo.id}>
                {insumo.descripcion} — {formatCOP(insumo.precio_unitario)}/{insumo.unidad}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              showQuickCreate
                ? 'bg-primary text-white shadow-sm'
                : 'border-2 border-dashed border-slate-300 text-slate-400 hover:border-primary/50 hover:text-primary'
            }`}
            title={`Crear nuevo ${tabActual.label.toLowerCase().replace(/s$/, '')}`}
          >
            <Plus className="w-5 h-5" />
          </button>
          {loadingInsumos && (
            <span className="text-slate-400 text-sm self-center flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </span>
          )}
        </div>

        {/* Quick Create Form */}
        {showQuickCreate && (
          <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-slate-600">
                Nuevo {tabActual.label.toLowerCase().replace(/s$/, '')} rápido
              </span>
              <span className="text-3xs text-slate-400 ml-auto">Tipo: {state.tabActivo}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="Descripción del insumo"
                value={newInsumo.descripcion}
                onChange={(e) => setNewInsumo(p => ({ ...p, descripcion: e.target.value }))}
                className="sm:col-span-5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary/50"
              />
              <select
                value={newInsumo.unidad}
                onChange={(e) => setNewInsumo(p => ({ ...p, unidad: e.target.value }))}
                className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm text-slate-800 outline-none focus:border-primary/50 cursor-pointer"
              >
                {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <div className="sm:col-span-3 relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Precio unitario"
                  value={newInsumo.precio_unitario || ''}
                  onChange={(e) => setNewInsumo(p => ({ ...p, precio_unitario: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-6 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary/50"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-1">
                <button
                  onClick={handleQuickCreate}
                  disabled={savingInsumo || !newInsumo.descripcion.trim() || newInsumo.precio_unitario <= 0}
                  className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-dark disabled:opacity-40 transition-all cursor-pointer"
                >
                  {savingInsumo ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Crear'}
                </button>
                <button
                  onClick={() => { setShowQuickCreate(false); setNewInsumo({ descripcion: '', unidad: 'und', precio_unitario: 0 }); }}
                  className="rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {!loadingInsumos && insumosDisponibles.length === 0 && !showQuickCreate && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            No hay insumos en esta categoría. Crea uno con el botón + o ejecuta la migración SQL primero.
          </p>
        )}
      </div>

      {/* Tabla de insumos agregados */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-3xs font-bold uppercase text-slate-400 tracking-wider">Insumo</th>
                <th className="text-left px-4 py-3 text-3xs font-bold uppercase text-slate-400 tracking-wider w-20">Unidad</th>
                <th className="text-right px-4 py-3 text-3xs font-bold uppercase text-slate-400 tracking-wider w-36">Precio Unit.</th>
                <th className="text-center px-4 py-3 text-3xs font-bold uppercase text-slate-400 tracking-wider w-44">
                  {LABEL_CANTIDAD[state.tabActivo]}
                </th>
                <th className="text-right px-5 py-3 text-3xs font-bold uppercase text-slate-400 tracking-wider w-36">Valor Total</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {insumosPorTipo(state.tabActivo).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center">
                    <Plus className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-sm font-medium text-slate-400">Selecciona un insumo del buscador para agregarlo</p>
                    <p className="text-xs text-slate-300 mt-1">Puedes buscar por nombre o desplazarte por la lista</p>
                  </td>
                </tr>
              ) : (
                insumosPorTipo(state.tabActivo).map((item) => (
                  <tr
                    key={item.localId}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className="text-sm font-semibold text-slate-800">{item.insumo.descripcion}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5">
                        {item.insumo.unidad}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-slate-700">
                      {formatCOP(item.insumo.precio_unitario)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          min="0"
                          step="0.0001"
                          value={item.cantidad}
                          onChange={(e) =>
                            dispatch({
                              type: 'ACTUALIZAR_CANTIDAD',
                              localId: item.localId,
                              cantidad: Number(e.target.value),
                            })
                          }
                          className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-mono text-slate-800 text-center outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-primary">
                      {formatCOP(item.valorTotal)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          dispatch({ type: 'ELIMINAR_INSUMO', localId: item.localId })
                        }
                        className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-1.5 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Eliminar insumo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Subtotal de la pestaña */}
            {insumosPorTipo(state.tabActivo).length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50/50">
                  <td colSpan={4} className="px-5 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Subtotal {tabActual.label}:
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-black text-slate-800">
                    {formatCOP(subtotalPorTipo(state.tabActivo))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Resumen global + guardar */}
      {state.insumos.length > 0 && (
        <div className="rounded-2xl border-2 border-primary/20 bg-white shadow-xl overflow-hidden animate-slide-up">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Resumen General del APU</p>
                <h3 className="text-lg font-black font-display">
                  {state.apu.codigo || 'APU sin código'}
                </h3>
                {state.apu.descripcion && (
                  <p className="text-sm text-slate-300 mt-0.5">{state.apu.descripcion}</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-2xs font-semibold text-slate-400 uppercase block">Costo Total</span>
                <span className="text-2xl font-black font-display tracking-tight">
                  {formatCOP(costoTotal)}
                </span>
                <span className="text-xs text-slate-400 block">/ {state.apu.unidad || 'und'}</span>
              </div>
            </div>
          </div>

          {/* Tarjetas de resumen por tipo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5">
            {TABS.map(({ key, label, icon: Icon, color, bgColor }) => {
              const sub = subtotalPorTipo(key);
              const count = insumosPorTipo(key).length;
              return (
                <div key={key} className={`rounded-xl border ${sub > 0 ? 'border-slate-200' : 'border-slate-100'} p-3 ${sub > 0 ? '' : 'opacity-40'}`}>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1.5">
                    <Icon className={`w-3.5 h-3.5 ${sub > 0 ? color : ''}`} />
                    {label}
                  </div>
                  <div className={`font-mono font-bold text-sm ${sub > 0 ? 'text-slate-800' : 'text-slate-300'}`}>
                    {formatCOP(sub)}
                  </div>
                  {count > 0 && (
                    <div className="text-3xs text-slate-400 mt-0.5">{count} insumo{count !== 1 ? 's' : ''}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Botón guardar */}
          <div className="border-t border-slate-200 px-5 py-4 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {state.insumos.length} insumos · {formatCOP(costoTotal)}/{state.apu.unidad || 'und'}
              </span>
            </div>
            {editingAPUId !== null && (
              <button
                onClick={handleCancelarEdicion}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            )}
            <button
              onClick={handleGuardarAPU}
              disabled={state.isSaving || !state.apu.codigo.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-primary/20"
            >
              {state.isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : editingAPUId !== null ? (
                <>
                  <Save className="w-4 h-4" />
                  Actualizar APU
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar APU
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
