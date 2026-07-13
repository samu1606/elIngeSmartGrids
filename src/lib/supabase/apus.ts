import { createClient } from '@/lib/supabase/client';
import type { APU, Insumo } from '@/types/apu';

export type { APU };

const supabase = createClient();

/** Respuesta de Supabase al hacer join `select(*, insumos(*))` — los campos de detalle_apu vienen planos */
export interface APUDetalleCompleto {
  id: number;
  apu_id: number;
  insumo_id: number;
  cantidad_rendimiento: number;
  created_at?: string;
  updated_at?: string;
  insumos: Insumo;
}

/** APU con todos sus detalles e insumos resueltos */
export interface APUCompleto {
  apu: APU;
  detalles: APUDetalleCompleto[];
  costoTotal: number;
}

/**
 * Obtiene todos los APUs activos
 */
export async function obtenerAPUs(): Promise<APU[]> {
  const { data, error } = await supabase
    .from('apus')
    .select('*')
    .order('codigo');

  if (error) {
    console.warn('Error obteniendo APUs:', error.message);
    return [];
  }
  return data || [];
}

/**
 * Obtiene un APU completo con sus detalles e insumos
 */
export async function obtenerAPUCompleto(apuId: number): Promise<APUCompleto | null> {
  // 1. Obtener el APU
  const { data: apu, error: apuError } = await supabase
    .from('apus')
    .select('*')
    .eq('id', apuId)
    .single();

  if (apuError || !apu) {
    console.warn('Error obteniendo APU:', apuError?.message);
    return null;
  }

  // 2. Obtener detalles con insumos (join!)
  const { data: detalles, error: detError } = await supabase
    .from('detalle_apu')
    .select('*, insumos(*)')
    .eq('apu_id', apuId);

  if (detError) {
    console.warn('Error obteniendo detalles:', detError.message);
    return { apu: apu as APU, detalles: [], costoTotal: 0 };
  }

  // 3. Calcular costo total
  const det = (detalles || []) as unknown as APUDetalleCompleto[];
  const costoTotal = det.reduce(
    (sum, d) => sum + (d.cantidad_rendimiento || 0) * (d.insumos?.precio_unitario || 0),
    0
  );

  return {
    apu: apu as APU,
    detalles: det,
    costoTotal,
  };
}

/**
 * Actualiza un APU existente (header + detalles via delete+insert)
 */
export async function actualizarAPU(
  apuId: number,
  datos: { codigo: string; descripcion: string; unidad: string },
  detalles: { insumo_id: number; cantidad_rendimiento: number }[]
): Promise<{ error: string | null }> {
  // 1. Actualizar header
  const { error: updError } = await supabase
    .from('apus')
    .update({ codigo: datos.codigo, descripcion: datos.descripcion, unidad: datos.unidad })
    .eq('id', apuId);

  if (updError) return { error: updError.message };

  // 2. Borrar detalles viejos e insertar nuevos
  await supabase.from('detalle_apu').delete().eq('apu_id', apuId);

  if (detalles.length > 0) {
    const { error: insError } = await supabase
      .from('detalle_apu')
      .insert(detalles.map(d => ({ apu_id: apuId, insumo_id: d.insumo_id, cantidad_rendimiento: d.cantidad_rendimiento })));

    if (insError) return { error: insError.message };
  }

  return { error: null };
}

/**
 * Elimina un APU y sus detalles
 */
export async function eliminarAPU(apuId: number): Promise<{ error: string | null }> {
  await supabase.from('detalle_apu').delete().eq('apu_id', apuId);
  const { error } = await supabase.from('apus').delete().eq('id', apuId);
  return { error: error?.message || null };
}
