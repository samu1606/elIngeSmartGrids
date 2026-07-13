'use client';

import { useReducer, useCallback } from 'react';
import type {
  ConstructorAPUState,
  ConstructorAPUAction,
  Insumo,
  TipoInsumo,
} from '@/types/apu';

const initialTab: TipoInsumo = 'material';

function crearInsumoLocal(insumo: Insumo) {
  const localId = crypto.randomUUID();
  const cantidad = 1;
  return {
    localId,
    insumo,
    cantidad,
    valorTotal: cantidad * insumo.precio_unitario,
  };
}

function recalcularValores(insumos: ConstructorAPUState['insumos']) {
  return insumos.map((item) => ({
    ...item,
    valorTotal: item.cantidad * item.insumo.precio_unitario,
  }));
}

function reducer(
  state: ConstructorAPUState,
  action: ConstructorAPUAction
): ConstructorAPUState {
  switch (action.type) {
    case 'SET_APU_FIELD':
      return {
        ...state,
        isDirty: true,
        apu: { ...state.apu, [action.field]: action.value },
      };

    case 'SET_TAB':
      return { ...state, tabActivo: action.tab, busqueda: '' };

    case 'SET_BUSQUEDA':
      return { ...state, busqueda: action.value };

    case 'AGREGAR_INSUMO': {
      // Evitar duplicados
      const yaExiste = state.insumos.some(
        (item) => item.insumo.id === action.insumo.id
      );
      if (yaExiste) return state;

      const nuevo = crearInsumoLocal(action.insumo);
      return {
        ...state,
        isDirty: true,
        busqueda: '',
        insumos: [...state.insumos, nuevo],
      };
    }

    case 'ELIMINAR_INSUMO':
      return {
        ...state,
        isDirty: true,
        insumos: state.insumos.filter((item) => item.localId !== action.localId),
      };

    case 'ACTUALIZAR_CANTIDAD': {
      const cantidad = Math.max(0, action.cantidad);
      return {
        ...state,
        isDirty: true,
        insumos: state.insumos.map((item) =>
          item.localId === action.localId
            ? {
                ...item,
                cantidad,
                valorTotal: cantidad * item.insumo.precio_unitario,
              }
            : item
        ),
      };
    }

    case 'SET_SAVING':
      return { ...state, isSaving: action.value };

    case 'CARGAR_APU':
      return {
        ...state,
        isDirty: false,
        apu: { ...action.apu },
        insumos: action.insumos,
        tabActivo: action.insumos.length > 0 ? action.insumos[0].insumo.tipo : 'material',
        busqueda: '',
      };

    case 'RESET':
      return {
        apu: { codigo: '', descripcion: '', unidad: 'und' },
        insumos: [],
        tabActivo: 'material',
        busqueda: '',
        isDirty: false,
        isSaving: false,
      };

    default:
      return state;
  }
}

const initialState: ConstructorAPUState = {
  apu: { codigo: '', descripcion: '', unidad: 'und' },
  insumos: [],
  tabActivo: initialTab,
  busqueda: '',
  isDirty: false,
  isSaving: false,
};

export function useConstructorAPUReducer() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const insumosPorTipo = useCallback(
    (tipo: TipoInsumo) => state.insumos.filter((i) => i.insumo.tipo === tipo),
    [state.insumos]
  );

  const subtotalPorTipo = useCallback(
    (tipo: TipoInsumo) =>
      insumosPorTipo(tipo).reduce((sum, i) => sum + i.valorTotal, 0),
    [insumosPorTipo]
  );

  const costoTotal = state.insumos.reduce((sum, i) => sum + i.valorTotal, 0);

  return {
    state,
    dispatch,
    insumosPorTipo,
    subtotalPorTipo,
    costoTotal,
  };
}
