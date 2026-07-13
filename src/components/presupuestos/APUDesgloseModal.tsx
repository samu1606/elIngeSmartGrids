'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Loader2, Wrench, Package, Truck, Users, Calculator, ChevronRight } from 'lucide-react';
import { obtenerAPUCompleto, type APUCompleto } from '@/lib/supabase/apus';
import type { TipoInsumo } from '@/types/apu';

// ============================================================
// Constantes
// ============================================================

const ICONO_TIPO: Record<TipoInsumo, typeof Wrench> = {
  equipo: Wrench,
  material: Package,
  transporte: Truck,
  mano_obra: Users,
};

const COLOR_TIPO: Record<TipoInsumo, string> = {
  equipo: 'text-blue-600 bg-blue-50',
  material: 'text-amber-600 bg-amber-50',
  transporte: 'text-emerald-600 bg-emerald-50',
  mano_obra: 'text-purple-600 bg-purple-50',
};

const LABEL_TIPO: Record<TipoInsumo, string> = {
  equipo: 'Equipo',
  material: 'Material',
  transporte: 'Transporte',
  mano_obra: 'Mano de Obra',
};

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
// Props
// ============================================================

interface APUDesgloseModalProps {
  apuId: number;
  open: boolean;
  onClose: () => void;
  onAgregar?: (apu: APUCompleto) => void;
}

// ============================================================
// Componente
// ============================================================

export default function APUDesgloseModal({ apuId, open, onClose, onAgregar }: APUDesgloseModalProps) {
  const [apuData, setApuData] = useState<APUCompleto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  // Cargar datos del APU cuando cambia el ID
  useEffect(() => {
    if (!open || !apuId) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setApuData(null);

      const data = await obtenerAPUCompleto(apuId);

      if (!cancelled) {
        if (data) {
          setApuData(data);
        } else {
          setError('No se pudo cargar el APU. Verifica que exista en la base de datos.');
        }
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [apuId, open]);

  if (!open) return null;

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

      {/* Panel */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-800 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold font-display">
                {loading ? 'Cargando APU...' : apuData?.apu.descripcion || 'Detalle del APU'}
              </h2>
              {apuData && (
                <p className="text-xs text-slate-400 font-mono">{apuData.apu.codigo}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          {apuData && !loading && (
            <div className="space-y-6">
              {/* Info del APU */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-3xs font-bold uppercase text-slate-400 tracking-wider block">Código</span>
                  <span className="text-sm font-mono font-bold text-slate-800">{apuData.apu.codigo}</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-3xs font-bold uppercase text-slate-400 tracking-wider block">Unidad</span>
                  <span className="text-sm font-mono font-bold text-slate-800">{apuData.apu.unidad}</span>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <span className="text-3xs font-bold uppercase text-primary/60 tracking-wider block">Costo Total</span>
                  <span className="text-sm font-black font-mono text-primary">{formatCOP(apuData.costoTotal)}</span>
                </div>
              </div>

              {/* Desglose por tipo */}
              {(['equipo', 'material', 'transporte', 'mano_obra'] as TipoInsumo[]).map((tipo) => {
                const items = apuData.detalles.filter(
                  (d) => d.insumos?.tipo === tipo
                );
                if (items.length === 0) return null;

                const Icon = ICONO_TIPO[tipo];
                const subtotal = items.reduce(
                  (sum, d) =>
                    sum + (d.cantidad_rendimiento || 0) * (d.insumos?.precio_unitario || 0),
                  0
                );

                return (
                  <div key={tipo}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`p-1 rounded-md ${COLOR_TIPO[tipo]}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {LABEL_TIPO[tipo]}
                      </span>
                      <span className="text-xs text-slate-300">·</span>
                      <span className="text-xs font-mono text-slate-400">
                        {items.length} insumo{items.length !== 1 ? 's' : ''}
                      </span>
                      <span className="ml-auto text-xs font-mono font-bold text-slate-600">
                        {formatCOP(subtotal)}
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-4 py-2 text-3xs font-bold uppercase text-slate-400 tracking-wider">Insumo</th>
                            <th className="px-3 py-2 text-3xs font-bold uppercase text-slate-400 tracking-wider text-center w-16">Und</th>
                            <th className="px-3 py-2 text-3xs font-bold uppercase text-slate-400 tracking-wider text-center w-24">Rendimiento</th>
                            <th className="px-3 py-2 text-3xs font-bold uppercase text-slate-400 tracking-wider text-right w-28">Precio Unit.</th>
                            <th className="px-4 py-2 text-3xs font-bold uppercase text-slate-400 tracking-wider text-right w-28">Valor Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {items.map((d, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-2.5 font-medium text-slate-700">{d.insumos?.descripcion || '—'}</td>
                              <td className="px-3 py-2.5 text-center font-mono text-slate-400">{d.insumos?.unidad || '—'}</td>
                              <td className="px-3 py-2.5 text-center font-mono font-semibold text-slate-600">
                                {d.cantidad_rendimiento}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono text-slate-500">
                                {formatCOP(d.insumos?.precio_unitario || 0)}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-800">
                                {formatCOP((d.cantidad_rendimiento || 0) * (d.insumos?.precio_unitario || 0))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              {/* Nota: si no hay detalles */}
              {apuData.detalles.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Este APU no tiene insumos registrados todavía.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50/50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            {apuData && (
              <>
                {apuData.detalles.length} insumos ·{' '}
                <span className="font-mono font-bold text-slate-600">
                  {formatCOP(apuData.costoTotal)}/{apuData.apu.unidad}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cerrar
            </button>
            {onAgregar && apuData && (
              <button
                onClick={() => onAgregar(apuData)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              >
                Agregar al Presupuesto
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
