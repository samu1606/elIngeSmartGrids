'use client';

import { useState } from 'react';
import { X, Plus, FlaskConical, ChevronRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { APUCompleto } from '@/lib/supabase/apus';
import APUDesgloseModal from './APUDesgloseModal';

function formatCOP(valor: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(valor);
}

// ============================================================

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onAddAPU: (apu: APUCompleto) => void;
}

// ============================================================
// Componente
// ============================================================

export default function AddItemModal({ open, onClose, onAddAPU }: AddItemModalProps) {
  const supabase = createClient();
  const [apus, setApus] = useState<any[]>([]);
  const [loadingApus, setLoadingApus] = useState(false);
  const [selectedAPUId, setSelectedAPUId] = useState<number | null>(null);
  const [selectedAPU, setSelectedAPU] = useState<any>(null);
  const [selectedAPUCompleto, setSelectedAPUCompleto] = useState<APUCompleto | null>(null);
  const [showDesglose, setShowDesglose] = useState(false);

  // Cargar lista de APUs desde Supabase
  const loadApus = async () => {
    setLoadingApus(true);
    const { data } = await supabase.from('apus').select('*').order('codigo');
    setApus(data || []);
    setLoadingApus(false);
  };

  // Cargar APU completo (con detalles + insumos) para confirmar
  const loadAPUCompleto = async (apuId: number): Promise<APUCompleto | null> => {
    const { data: apu } = await supabase.from('apus').select('*').eq('id', apuId).single();
    const { data: detalles } = await supabase
      .from('detalle_apu')
      .select('*, insumos(*)')
      .eq('apu_id', apuId);

    if (!apu) return null;

    const detallesMapeados = (detalles || []).map((d: any) => ({
      ...d,
      cantidad_rendimiento: d.cantidad_rendimiento,
      insumos: d.insumos ? {
        id: d.insumos.id,
        descripcion: d.insumos.descripcion,
        tipo: d.insumos.tipo,
        unidad: d.insumos.unidad,
        precio_unitario: d.insumos.precio_unitario,
      } : undefined,
    }));

    const costoTotal = detallesMapeados.reduce(
      (sum: number, d: any) => sum + (d.cantidad_rendimiento || 0) * (d.insumos?.precio_unitario || 0),
      0
    );

    const completo: APUCompleto = { apu, detalles: detallesMapeados, costoTotal };
    setSelectedAPUCompleto(completo);
    return completo;
  };

  const handleSelectAPU = async (id: number) => {
    setSelectedAPUId(id);
    const apu = apus.find((a) => a.id === id) || null;
    setSelectedAPU(apu);
    setSelectedAPUCompleto(null);
  };

  const handleConfirmAdd = async () => {
    if (!selectedAPUId) return;
    // Cargar datos completos del APU y agregar al presupuesto
    const completo = selectedAPUCompleto || await loadAPUCompleto(selectedAPUId);
    if (!completo) return;
    onAddAPU(completo);
    setSelectedAPUId(null);
    setSelectedAPU(null);
    setSelectedAPUCompleto(null);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative w-full max-w-xl max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary" /> Biblioteca de APU
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {!loadingApus && apus.length === 0 && !selectedAPUId && (
              <div className="flex items-center gap-2 py-8 justify-center">
                <span className="text-sm text-slate-400">Cargando APUs...</span>
                <button onClick={loadApus} className="text-xs text-primary font-semibold hover:underline cursor-pointer">Recargar</button>
              </div>
            )}

            {loadingApus ? (
              <div className="flex items-center gap-2 py-8 justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                <span className="text-sm text-slate-400">Cargando...</span>
              </div>
            ) : apus.length === 0 && selectedAPUId === null ? (
              <div className="text-center py-8 text-sm text-slate-400">
                No hay APUs registrados todavía. Créalos en el Constructor de APU.
              </div>
            ) : (
              <div className="space-y-4">
                <select
                  value={selectedAPUId ?? ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    handleSelectAPU(id || null as any);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 cursor-pointer"
                  autoFocus
                >
                  <option value="">Seleccionar APU de la biblioteca...</option>
                  {apus.map((apu: any) => (
                    <option key={apu.id} value={apu.id}>
                      {apu.codigo} — {apu.descripcion}
                    </option>
                  ))}
                </select>

                {selectedAPU && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-md px-2 py-0.5">
                          {selectedAPU.codigo}
                        </span>
                        <p className="text-sm font-semibold text-slate-800 mt-2">{selectedAPU.descripcion}</p>
                      </div>
                      <span className="text-2xs text-slate-400 font-mono bg-white border border-slate-200 rounded-md px-2 py-0.5">
                        /{selectedAPU.unidad}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowDesglose(true)}
                        className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-white px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 transition-all cursor-pointer"
                      >
                        Ver Desglose <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleConfirmAdd}
                        className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                      >
                        Agregar al Presupuesto <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-3 bg-slate-50/50 flex items-center justify-between shrink-0">
            <span className="text-2xs text-slate-400">
              Los precios de APU son fijos, no se modifican en el presupuesto
            </span>
            <button onClick={onClose} className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-slate-100">
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Desglose */}
      <APUDesgloseModal
        apuId={selectedAPUId ?? 0}
        open={showDesglose}
        onClose={() => setShowDesglose(false)}
      />
    </>
  );
}
