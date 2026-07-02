"""
Router RETIE 2024 — Generación de documentos de diseño eléctrico.

Endpoints:
  POST /api/retie/generar-documento  — Genera memoria de diseño RETIE
  GET  /api/retie/clasificar         — Clasifica tipo de diseño por parámetros
  GET  /api/retie/items-diseno       — Lista items a-x del Art. 3.3.1.1
"""

from fastapi import APIRouter, Query
from app.services.retie_document_service import (
    RetieSolicitud,
    RetieDocumentoOutput,
    TipoInstalacion,
    clasificar_instalacion,
    ITEMS_DISENO_DETALLADO,
    LIMITE_SIMPLIFICADO_KVA,
    LIMITE_CUENTAS_SIMPLIFICADO,
)

router = APIRouter()


# =============================================================================
# 1. GENERAR DOCUMENTO RETIE COMPLETO
# =============================================================================

@router.post("/generar-documento", response_model=RetieDocumentoOutput)
async def generar_documento_retie(data: RetieSolicitud):
    """
    Genera la memoria de diseño RETIE 2024 completa.

    Incluye clasificación automática, items a-x con estado
    de cumplimiento y datos pre-calculados desde los endpoints
    de cálculo eléctrico existentes.
    """
    from app.services.retie_document_service import generar_documento_retie
    return generar_documento_retie(data)


# =============================================================================
# 2. CLASIFICAR INSTALACIÓN
# =============================================================================

@router.get("/clasificar")
async def clasificar(
    tipo: TipoInstalacion = Query(..., description="Tipo de instalación"),
    kva: float = Query(..., gt=0, description="kVA instalados"),
    cuentas: int = Query(1, ge=1, description="Número de cuentas/medidores"),
    dictamen: bool = Query(False, description="¿Requiere dictamen de inspección?"),
):
    """Determina si aplica diseño simplificado o detallado."""
    return clasificar_instalacion(
        tipo=tipo,
        kva_instalados=kva,
        num_cuentas=cuentas,
        requiere_dictamen=dictamen,
    )


# =============================================================================
# 3. LISTAR ITEMS DEL DISEÑO DETALLADO
# =============================================================================

@router.get("/items-diseno")
async def listar_items_diseno():
    """Devuelve la lista completa de items a-x del Art. 3.3.1.1."""
    items = []
    for item_id, item_data in ITEMS_DISENO_DETALLADO.items():
        items.append({
            "id": item_data["id"],
            "titulo": item_data["titulo"],
            "norma_ref": item_data["norma_ref"],
            "calculable_por_app": item_data["calculable_por_app"],
            "descripcion": item_data["descripcion"],
        })

    return {
        "total_items": len(items),
        "items_calculables_por_app": sum(1 for i in items if i["calculable_por_app"]),
        "items_requieren_profesional": sum(1 for i in items if not i["calculable_por_app"]),
        "limite_simplificado_kva": LIMITE_SIMPLIFICADO_KVA,
        "limite_simplificado_cuentas": LIMITE_CUENTAS_SIMPLIFICADO,
        "articulo_referencia": "RETIE 2024 Art. 3.3.1.1",
        "items": items,
    }
