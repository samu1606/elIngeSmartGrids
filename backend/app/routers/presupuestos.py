"""
Routers de Presupuestos Eléctricos — El Inge Smart Grids.

Endpoints:
  POST /api/presupuestos/calcular       — Calcula presupuesto completo (items + totales)
  GET  /api/presupuestos/catalogo       — Catálogo de precios de referencia
  GET  /api/presupuestos/config/metros  — Opciones de metros por salida
"""

from fastapi import APIRouter
from app.services.presupuesto_service import (
    PresupuestoCompletoInput,
    PresupuestoCompletoOutput,
    BudgetItemInput,
    BudgetItemOutput,
    calcular_presupuesto_completo,
    calcular_item,
    PRECIOS_REFERENCIA_COP,
    OPCIONES_METROS_POR_SALIDA,
    METROS_DEFAULT_POR_SALIDA,
)

router = APIRouter()


# =============================================================================
# 1. CALCULAR PRESUPUESTO COMPLETO
# =============================================================================

@router.post("/calcular", response_model=PresupuestoCompletoOutput)
async def calcular_presupuesto(data: PresupuestoCompletoInput):
    """
    Recibe un presupuesto completo con todos sus ítems y devuelve
    los cálculos desglosados: subtotales, IVA, retención y total final.
    """
    return calcular_presupuesto_completo(data)


# =============================================================================
# 2. CATÁLOGO DE PRECIOS DE REFERENCIA
# =============================================================================

@router.get("/catalogo")
async def obtener_catalogo():
    """
    Devuelve el catálogo completo de precios de referencia en COP
    para todos los materiales y servicios eléctricos.
    """
    return {
        "catalogo": PRECIOS_REFERENCIA_COP,
        "total_items": len(PRECIOS_REFERENCIA_COP),
        "moneda": "COP",
        "actualizado": "2026-06",
        "nota": "Precios de referencia. Ajuste según su región y proveedor.",
    }


# =============================================================================
# 3. CONFIGURACIÓN DE METROS POR SALIDA
# =============================================================================

@router.get("/config/metros")
async def obtener_config_metros():
    """Devuelve la configuración de metros por salida para cableado."""
    return {
        "opciones_metros_por_salida": OPCIONES_METROS_POR_SALIDA,
        "default": METROS_DEFAULT_POR_SALIDA,
        "unidad": "metros lineales",
        "aplica_para": [
            "cableado",
            "canalizacion", 
            "tomacorriente",
            "iluminacion",
        ],
    }
