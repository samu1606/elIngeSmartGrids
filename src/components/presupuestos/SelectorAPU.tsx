'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, FlaskConical, Eye, Plus, Loader2, ChevronRight } from 'lucide-react';
import { obtenerAPUs } from '@/lib/supabase/apus';
import APUDesgloseModal from './APUDesgloseModal';
import type { APU, APUCompleto } from '@/lib/supabase/apus';

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

interface SelectorAPUProps {
  /** Callback cuando el usuario selecciona un APU para agregar al presupuesto */
  onAgregarAPU?: (apu: APUCompleto) => void;
}

// ============================================================
// Componente
// ============================================================

export default function SelectorAPU({ onAgregarAPU }: SelectorAPUProps) {
  const [apus, setApus] = useState<APU[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // APU seleccionado para preview/modal
  const [selectedAPUId, setSelectedAPUId] = useState<number | null>(null);
  const [selectedAPU, setSelectedAPU] = useState<APU | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Cargar APUs
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const data = await obtenerAPUs();
      if (!cancelled) {
        if (data.length === 0) {
          setError('No hay APUs registrados. Crea uno en el Constructor de APU primero.');
        }
        setApus(data);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Handlers
  const handleSelectAPU = useCallback((apuId: string) => {
    const id = Number(apuId);
    if (!id) {
      setSelectedAPUId(null);
      setSelectedAPU(null);
      return;
    }
    const apu = apus.find((a) => a.id === id);
    if (apu) {
      setSelectedAPUId(id);
      setSelectedAPU(apu);
    }
  }, [apus]);

  const handleAgregarDesdeModal = useCallback((apuCompleto: APUCompleto) => {
    setShowModal(false);
    if (onAgregarAPU) {
      onAgregarAPU(apuCompleto);
      // Resetear selección para que pueda agregar otro
      setSelectedAPUId(null);
      setSelectedAPU(null);
    }
  }, [onAgregarAPU]);

  return (
    <>
      <div className="rounded-2xl border border-primary/20 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-primary/10 bg-primary/[0.02]">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-primary" />
            Biblioteca de APUs (Análisis de Precios Unitarios)
          </h2>
          <p className="text-3xs text-slate-400 mt-0.5">
            Selecciona un APU predefinido o créalo en el Constructor de APU
          </p>
        </div>

        <div className="p-4">
          {loading && (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
              <span className="text-sm text-slate-400">Cargando APUs...</span>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 flex items-center gap-2">
              <span className="text-2xl">📚</span>
              {error}
            </div>
          )}

          {!loading && apus.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {/* Select de APUs */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedAPUId ?? ''}
                  onChange={(e) => handleSelectAPU(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-2.5 text-sm text-slate-800 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Seleccionar APU...</option>
                  {apus.map((apu) => (
                    <option key={apu.id} value={apu.id}>
                      {apu.codigo} — {apu.descripcion}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>

              {/* Botón ver desglose */}
              {selectedAPU && (
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 active:scale-[0.98] transition-all cursor-pointer shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver Desglose
                </button>
              )}
            </div>
          )}

          {/* Preview rápido del APU seleccionado */}
          {selectedAPU && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-slate-800">{selectedAPU.codigo}</span>
                <span className="text-xs text-slate-400 ml-2">{selectedAPU.descripcion}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xs text-slate-400 font-mono bg-white border border-slate-200 rounded-md px-2 py-0.5">
                  /{selectedAPU.unidad}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Desglose */}
      {selectedAPUId && (
        <APUDesgloseModal
          apuId={selectedAPUId}
          open={showModal}
          onClose={() => setShowModal(false)}
          onAgregar={handleAgregarDesdeModal}
        />
      )}
    </>
  );
}
