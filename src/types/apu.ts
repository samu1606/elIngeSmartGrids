// ============================================================
// Tipos para el Motor de APUs (Análisis de Precios Unitarios)
// ============================================================

/** Tipos de insumo según la clasificación de obra */
export type TipoInsumo = 'equipo' | 'material' | 'transporte' | 'mano_obra';

/** Insumo registrado en la tabla `insumos` */
export interface Insumo {
  id: number;
  descripcion: string;
  unidad: string;
  tipo: TipoInsumo;
  categoria?: string;
  descripcion_tecnica?: string;
  precio_unitario: number;
  created_at?: string;
  updated_at?: string;
}

/** APU registrado en la tabla `apus` */
export interface APU {
  id: number;
  codigo: string;
  descripcion: string;
  unidad: string;
  created_at?: string;
  updated_at?: string;
}

/** Detalle de APU en la tabla `detalle_apu` (relación APU ↔ Insumo) */
export interface DetalleAPU {
  id: number;
  apu_id: number;
  insumo_id: number;
  cantidad_rendimiento: number;
  created_at?: string;
  updated_at?: string;
}

/** APU con costo total calculado desde la vista `apu_costo_total` */
export interface APUCostoTotal {
  apu_id: number;
  codigo: string;
  descripcion: string;
  unidad: string;
  total_insumos: number;
  costo_total: number;
}

/**
 * Ítem local en el constructor de APU (antes de guardar).
 * Representa un insumo seleccionado con su cantidad/rendimiento/distancia.
 */
export interface InsumoEnAPU {
  /** ID temporal local mientras se construye */
  localId: string;
  insumo: Insumo;
  /** Cantidad para materiales, rendimiento para equipos/MO, distancia para transporte */
  cantidad: number;
  /** Valor total = cantidad * precio_unitario */
  valorTotal: number;
}

/** Estado del constructor de APU gestionado por useReducer */
export interface ConstructorAPUState {
  /** APU que se está creando/editando */
  apu: {
    codigo: string;
    descripcion: string;
    unidad: string;
  };
  /** Insumos agregados agrupados por tipo */
  insumos: InsumoEnAPU[];
  /** Pestaña activa */
  tabActivo: TipoInsumo;
  /** Búsqueda en el select */
  busqueda: string;
  /** Borrador pendiente de guardar */
  isDirty: boolean;
  /** Guardando... */
  isSaving: boolean;
}

/** Acciones del reducer */
export type ConstructorAPUAction =
  | { type: 'SET_APU_FIELD'; field: 'codigo' | 'descripcion' | 'unidad'; value: string }
  | { type: 'SET_TAB'; tab: TipoInsumo }
  | { type: 'SET_BUSQUEDA'; value: string }
  | { type: 'AGREGAR_INSUMO'; insumo: Insumo }
  | { type: 'ELIMINAR_INSUMO'; localId: string }
  | { type: 'ACTUALIZAR_CANTIDAD'; localId: string; cantidad: number }
  | { type: 'SET_SAVING'; value: boolean }
  | { type: 'CARGAR_APU'; apu: { codigo: string; descripcion: string; unidad: string }; insumos: InsumoEnAPU[] }
  | { type: 'RESET' };
