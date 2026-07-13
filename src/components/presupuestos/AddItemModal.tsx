'use client';

import { useState, useMemo } from 'react';
import { X, Search, Plus, Package, Wrench, Truck, Users, FlaskConical, ChevronRight, Loader2, PenTool } from 'lucide-react';

// ============================================================
// TIPOS Y DATOS
// ============================================================

interface CatalogoOpcion {
  label: string;
  descripcion: string;
  precio: number;
  pricing_mode: 'por_salida' | 'por_ml';
  unit: string;
  category: string;
  metros_por_salida?: number;
}

const CATALOGO_PLANO: CatalogoOpcion[] = [
  // Tableros
  { label: 'Monofásico 6CTOS', descripcion: 'Tablero monofásico 6 circuitos, empotrable', precio: 85000, pricing_mode: 'por_salida', unit: 'und', category: 'tablero' },
  { label: 'Monofásico 12CTOS', descripcion: 'Tablero monofásico 12 circuitos, empotrable', precio: 145000, pricing_mode: 'por_salida', unit: 'und', category: 'tablero' },
  { label: 'Monofásico 18CTOS', descripcion: 'Tablero monofásico 18 circuitos, superficie', precio: 210000, pricing_mode: 'por_salida', unit: 'und', category: 'tablero' },
  { label: 'Bifásico 12CTOS', descripcion: 'Tablero bifásico 12 circuitos, empotrable', precio: 195000, pricing_mode: 'por_salida', unit: 'und', category: 'tablero' },
  { label: 'Bifásico 18CTOS', descripcion: 'Tablero bifásico 18 circuitos, superficie', precio: 260000, pricing_mode: 'por_salida', unit: 'und', category: 'tablero' },
  { label: 'Bifásico 24CTOS', descripcion: 'Tablero bifásico 24 circuitos, superficie', precio: 350000, pricing_mode: 'por_salida', unit: 'und', category: 'tablero' },
  { label: 'Trifásico 12CTOS (con totalizador)', descripcion: 'Tablero trifásico 12 circuitos con totalizador', precio: 380000, pricing_mode: 'por_salida', unit: 'und', category: 'tablero' },
  { label: 'Gabinete metálico 24CTOS', descripcion: 'Gabinete metálico para 24 circuitos, IP55', precio: 520000, pricing_mode: 'por_salida', unit: 'und', category: 'tablero' },
  // Breakers
  { label: 'Breaker 1P 15A', descripcion: 'Breaker riel DIN 1 polo 15A, curva C', precio: 18500, pricing_mode: 'por_salida', unit: 'und', category: 'breaker' },
  { label: 'Breaker 1P 20A', descripcion: 'Breaker riel DIN 1 polo 20A, curva C', precio: 19500, pricing_mode: 'por_salida', unit: 'und', category: 'breaker' },
  { label: 'Breaker 1P 30A', descripcion: 'Breaker riel DIN 1 polo 30A, curva C', precio: 22000, pricing_mode: 'por_salida', unit: 'und', category: 'breaker' },
  { label: 'Breaker 2P 30A', descripcion: 'Breaker riel DIN 2 polos 30A, curva C', precio: 35000, pricing_mode: 'por_salida', unit: 'und', category: 'breaker' },
  { label: 'Breaker 2P 50A', descripcion: 'Breaker riel DIN 2 polos 50A, curva C', precio: 45000, pricing_mode: 'por_salida', unit: 'und', category: 'breaker' },
  { label: 'Breaker 2P 63A', descripcion: 'Breaker riel DIN 2 polos 63A, curva C', precio: 55000, pricing_mode: 'por_salida', unit: 'und', category: 'breaker' },
  { label: 'Breaker 3P 50A', descripcion: 'Breaker caja moldeada 3 polos 50A', precio: 120000, pricing_mode: 'por_salida', unit: 'und', category: 'breaker' },
  { label: 'Totalizador 2P 100A', descripcion: 'Totalizador general 2 polos 100A', precio: 85000, pricing_mode: 'por_salida', unit: 'und', category: 'breaker' },
  { label: 'Prot. sobretensión 2P', descripcion: 'DPS Clase II 2 polos 40kA', precio: 95000, pricing_mode: 'por_salida', unit: 'und', category: 'breaker' },
  // Salidas
  { label: 'Toma doble estándar', descripcion: 'Tomacorriente doble 15A/125V + instalación', precio: 15000, pricing_mode: 'por_salida', unit: 'salida', category: 'tomacorriente', metros_por_salida: 7 },
  { label: 'Toma GFCI 20A', descripcion: 'Tomacorriente GFCI 20A protección falla a tierra', precio: 45000, pricing_mode: 'por_salida', unit: 'salida', category: 'tomacorriente', metros_por_salida: 7 },
  { label: 'Toma doble + USB', descripcion: 'Tomacorriente doble con USB-A y USB-C', precio: 38000, pricing_mode: 'por_salida', unit: 'salida', category: 'tomacorriente', metros_por_salida: 7 },
  { label: 'Punto iluminación LED', descripcion: 'Salida para luminaria LED con interruptor', precio: 28000, pricing_mode: 'por_salida', unit: 'salida', category: 'iluminacion', metros_por_salida: 5 },
  { label: 'Punto iluminación + conmutador', descripcion: 'Salida iluminación con interruptor conmutable', precio: 45000, pricing_mode: 'por_salida', unit: 'salida', category: 'iluminacion', metros_por_salida: 8 },
  { label: 'Interruptor sencillo', descripcion: 'Interruptor sencillo 15A/125V', precio: 12000, pricing_mode: 'por_salida', unit: 'und', category: 'iluminacion' },
  { label: 'Interruptor doble', descripcion: 'Interruptor doble 15A/125V', precio: 18000, pricing_mode: 'por_salida', unit: 'und', category: 'iluminacion' },
  { label: 'Sensor de movimiento', descripcion: 'Sensor de movimiento 180° para iluminación', precio: 55000, pricing_mode: 'por_salida', unit: 'und', category: 'iluminacion' },
  // Cableado
  { label: '12 AWG THHN Cu', descripcion: 'Cable de cobre 12 AWG THHN/THWN 600V', precio: 2800, pricing_mode: 'por_ml', unit: 'ml', category: 'cableado' },
  { label: '10 AWG THHN Cu', descripcion: 'Cable de cobre 10 AWG THHN/THWN 600V', precio: 4200, pricing_mode: 'por_ml', unit: 'ml', category: 'cableado' },
  { label: '8 AWG THHN Cu', descripcion: 'Cable de cobre 8 AWG THHN/THWN 600V', precio: 7500, pricing_mode: 'por_ml', unit: 'ml', category: 'cableado' },
  { label: '6 AWG THHN Cu', descripcion: 'Cable de cobre 6 AWG THHN/THWN 600V', precio: 11000, pricing_mode: 'por_ml', unit: 'ml', category: 'cableado' },
  { label: '4 AWG THHN Cu', descripcion: 'Cable de cobre 4 AWG THHN/THWN 600V', precio: 18000, pricing_mode: 'por_ml', unit: 'ml', category: 'cableado' },
  { label: '2 AWG THHN Cu', descripcion: 'Cable de cobre 2 AWG THHN/THWN 600V', precio: 28000, pricing_mode: 'por_ml', unit: 'ml', category: 'cableado' },
  { label: '6 AWG Cu Desnudo', descripcion: 'Cable de cobre desnudo 6 AWG puesta a tierra', precio: 6500, pricing_mode: 'por_ml', unit: 'ml', category: 'cableado' },
  // Canalización
  { label: 'PVC 1/2"', descripcion: 'Tubería PVC conduit 1/2 pulgada', precio: 2500, pricing_mode: 'por_ml', unit: 'ml', category: 'canalizacion' },
  { label: 'PVC 3/4"', descripcion: 'Tubería PVC conduit 3/4 pulgada', precio: 3500, pricing_mode: 'por_ml', unit: 'ml', category: 'canalizacion' },
  { label: 'PVC 1"', descripcion: 'Tubería PVC conduit 1 pulgada', precio: 5000, pricing_mode: 'por_ml', unit: 'ml', category: 'canalizacion' },
  { label: 'PVC 1-1/2"', descripcion: 'Tubería PVC conduit 1-1/2 pulgada', precio: 7500, pricing_mode: 'por_ml', unit: 'ml', category: 'canalizacion' },
  { label: 'Bandeja portacable 20cm', descripcion: 'Bandeja portacable metálica 20cm ancho', precio: 35000, pricing_mode: 'por_ml', unit: 'ml', category: 'canalizacion' },
  // Mano de obra y servicios
  { label: 'Hora electricista certificado', descripcion: 'Mano de obra electricista certificado RETIE', precio: 35000, pricing_mode: 'por_salida', unit: 'hora', category: 'mano_obra' },
  { label: 'Hora ayudante técnico', descripcion: 'Mano de obra ayudante técnico eléctrico', precio: 18000, pricing_mode: 'por_salida', unit: 'hora', category: 'mano_obra' },
  { label: 'Certificación RETIE', descripcion: 'Elaboración de certificado RETIE de conformidad', precio: 280000, pricing_mode: 'por_salida', unit: 'global', category: 'inspeccion' },
  { label: 'Diseño eléctrico básico', descripcion: 'Diseño eléctrico para instalación ≤10kVA', precio: 450000, pricing_mode: 'por_salida', unit: 'global', category: 'diseno' },
  { label: 'Diseño eléctrico detallado', descripcion: 'Diseño completo RETIE Art. 3.3.1.1 (>10kVA)', precio: 850000, pricing_mode: 'por_salida', unit: 'global', category: 'diseno' },
  { label: 'Diagrama unifilar', descripcion: 'Elaboración de diagrama unifilar NTC 2050', precio: 120000, pricing_mode: 'por_salida', unit: 'und', category: 'diseno' },
];

// ============================================================
// Componente: SelectorAPU en modal (versión compacta)
// ============================================================

import { obtenerAPUs, obtenerAPUCompleto, type APUCompleto } from '@/lib/supabase/apus';
import type { APU } from '@/types/apu';
import APUDesgloseModal from './APUDesgloseModal';

function formatCOP(valor: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
}

// ============================================================
// Props
// ============================================================

export interface BudgetItemFromModal {
  category: string;
  description: string;
  pricing_mode: 'por_salida' | 'por_ml';
  unit: string;
  unit_price: number;
  metros_por_salida?: number;
  apu_data?: APUCompleto; // solo si viene de APU
}

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onAddItem: (item: BudgetItemFromModal) => void;
  onAddAPU: (apu: APUCompleto) => void;
}

// ============================================================
// Componente
// ============================================================

export default function AddItemModal({ open, onClose, onAddItem, onAddAPU }: AddItemModalProps) {
  const [tab, setTab] = useState<'catalogo' | 'apu'>('catalogo');
  const [search, setSearch] = useState('');
  const [metrosPorSalida, setMetrosPorSalida] = useState(7);

  // APU state
  const [apus, setApus] = useState<APU[]>([]);
  const [loadingApus, setLoadingApus] = useState(false);
  const [selectedAPUId, setSelectedAPUId] = useState<number | null>(null);
  const [selectedAPU, setSelectedAPU] = useState<APU | null>(null);
  const [showDesglose, setShowDesglose] = useState(false);

  // Cargar APUs
  const loadApus = async () => {
    setLoadingApus(true);
    const data = await obtenerAPUs();
    setApus(data);
    setLoadingApus(false);
  };

  // Filtrar catálogo
  const catalogFiltered = useMemo(() => {
    if (!search.trim()) return CATALOGO_PLANO;
    const q = search.toLowerCase();
    return CATALOGO_PLANO.filter(i => i.label.toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q) || i.category.includes(q));
  }, [search]);

  const handleAddCatalogo = (opcion: CatalogoOpcion) => {
    onAddItem({
      category: opcion.category,
      description: opcion.descripcion,
      pricing_mode: opcion.pricing_mode,
      unit: opcion.unit,
      unit_price: opcion.precio,
      metros_por_salida: opcion.metros_por_salida || undefined,
    });
    onClose();
  };

  const handleAddAPU = async () => {
    if (!selectedAPUId) return;
    const completo = await obtenerAPUCompleto(selectedAPUId);
    if (completo) {
      onAddAPU(completo);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> Añadir Ítem
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 px-6 shrink-0">
            <button onClick={() => setTab('catalogo')} className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${tab === 'catalogo' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <Package className="w-3.5 h-3.5" /> Materiales y Equipos
            </button>
            <button onClick={() => { setTab('apu'); if (apus.length === 0) loadApus(); }} className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${tab === 'apu' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <FlaskConical className="w-3.5 h-3.5" /> Biblioteca de APUs
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {tab === 'catalogo' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar materiales, equipos, servicios..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                    autoFocus
                  />
                </div>

                {/* Select metros por salida */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Metros por salida default:</span>
                  <select value={metrosPorSalida} onChange={(e) => setMetrosPorSalida(Number(e.target.value))} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-mono cursor-pointer">
                    {[5,6,7,8,9,10,11].map(m => <option key={m} value={m}>{m}m</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  {catalogFiltered.map((opcion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddCatalogo(opcion)}
                      className="w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left hover:bg-primary/5 active:bg-primary/10 transition-all cursor-pointer border border-transparent hover:border-primary/20 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800 group-hover:text-primary truncate">{opcion.label}</span>
                          <span className="text-3xs text-slate-400 font-mono bg-slate-100 rounded px-1.5 py-0.5">{opcion.pricing_mode === 'por_ml' ? '/ml' : opcion.unit}</span>
                        </div>
                        <span className="text-xs text-slate-400 block truncate">{opcion.descripcion}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-bold font-mono text-primary">{formatCOP(opcion.precio)}</span>
                        <Plus className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                  {catalogFiltered.length === 0 && (
                    <p className="text-center py-8 text-sm text-slate-400">No se encontraron resultados para "{search}"</p>
                  )}
                </div>
              </div>
            )}

            {tab === 'apu' && (
              <div className="space-y-4">
                {loadingApus ? (
                  <div className="flex items-center gap-2 py-8 justify-center"><Loader2 className="w-4 h-4 animate-spin text-slate-300" /><span className="text-sm text-slate-400">Cargando APUs...</span></div>
                ) : apus.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-400">No hay APUs registrados todavía. Créalos en el Constructor de APU.</div>
                ) : (
                  <>
                    <select
                      value={selectedAPUId ?? ''}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        setSelectedAPUId(id || null);
                        setSelectedAPU(id ? apus.find(a => a.id === id) || null : null);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-primary/50 cursor-pointer"
                    >
                      <option value="">Seleccionar APU...</option>
                      {apus.map(apu => (
                        <option key={apu.id} value={apu.id}>{apu.codigo} — {apu.descripcion}</option>
                      ))}
                    </select>

                    {selectedAPU && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-800">{selectedAPU.codigo}</span>
                            <p className="text-xs text-slate-500">{selectedAPU.descripcion}</p>
                          </div>
                          <span className="text-2xs text-slate-400 font-mono">/{selectedAPU.unidad}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setShowDesglose(true)} className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-white px-3 py-1.5 text-2xs font-bold text-primary hover:bg-primary/5 transition-all cursor-pointer">
                            Ver Desglose <ChevronRight className="w-3 h-3" />
                          </button>
                          <button onClick={handleAddAPU} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-2xs font-bold text-white hover:bg-primary-dark transition-all cursor-pointer">
                            Agregar APU <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-3 bg-slate-50/50 flex items-center justify-between shrink-0">
            <span className="text-2xs text-slate-400">También puedes crear un <span className="text-primary font-semibold">ítem personalizado</span> en la tabla principal</span>
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-all cursor-pointer">Cancelar</button>
          </div>
        </div>
      </div>

      {/* APU Desglose Modal */}
      {selectedAPUId && (
        <APUDesgloseModal
          apuId={selectedAPUId}
          open={showDesglose}
          onClose={() => setShowDesglose(false)}
          onAgregar={(apu) => { onAddAPU(apu); setShowDesglose(false); onClose(); }}
        />
      )}
    </>
  );
}
