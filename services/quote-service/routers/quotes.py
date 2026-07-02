"""Quotes router — CRUD de presupuestos + envío a proveedores."""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from shared.supabase_client import get_supabase
import uuid

router = APIRouter()

# ============ SCHEMAS ============

class QuoteItem(BaseModel):
    material_id: Optional[str] = None
    name: str
    category: str
    quantity: float
    unit: str = "unidad"
    unit_price: float
    discount_pct: float = 0
    notes: Optional[str] = None

class QuoteCreate(BaseModel):
    job_id: Optional[str] = None
    technician_id: str
    items: List[QuoteItem]
    currency: str = "USD"
    notes: Optional[str] = None
    
class QuoteUpdate(BaseModel):
    items: Optional[List[QuoteItem]] = None
    status: Optional[str] = None
    currency: Optional[str] = None
    notes: Optional[str] = None
    pdf_url: Optional[str] = None

class QuoteResponse(BaseModel):
    id: str
    job_id: Optional[str]
    technician_id: str
    total_amount: float
    currency: str
    items: list
    pdf_url: Optional[str]
    status: str
    created_at: str

# ============ ENDPOINTS ============

@router.post("", response_model=dict)
def create_quote(quote: QuoteCreate):
    """Crear un nuevo presupuesto."""
    supabase = get_supabase()
    
    total = sum(
        item.quantity * item.unit_price * (1 - item.discount_pct / 100)
        for item in quote.items
    )
    
    items_data = [item.dict() for item in quote.items]
    
    data = {
        "technician_id": quote.technician_id,
        "job_id": quote.job_id,
        "total_amount": round(total, 2),
        "currency": quote.currency,
        "items": items_data,
        "status": "draft",
    }
    
    result = supabase.table("quotes").insert(data).execute()
    
    if not result.data:
        raise HTTPException(status_code=400, detail="Error creating quote")
    
    return {"id": result.data[0]["id"], "total": round(total, 2), "status": "draft"}

@router.get("", response_model=List[dict])
def list_quotes(
    technician_id: Optional[str] = Query(None),
    job_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
):
    """Listar presupuestos con filtros opcionales."""
    supabase = get_supabase()
    
    query = supabase.table("quotes").select("*")
    
    if technician_id:
        query = query.eq("technician_id", technician_id)
    if job_id:
        query = query.eq("job_id", job_id)
    if status:
        query = query.eq("status", status)
    
    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    
    return result.data

@router.get("/{quote_id}", response_model=dict)
def get_quote(quote_id: str):
    """Obtener un presupuesto por ID, incluyendo cotizaciones de proveedores."""
    supabase = get_supabase()
    
    result = supabase.table("quotes").select("*").eq("id", quote_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    quote = result.data[0]
    
    # Get supplier quotes for this quote
    sq_result = supabase.table("supplier_quotes").select(
        "*, supplier:suppliers(*), material:materials(*)"
    ).eq("quote_id", quote_id).execute()
    
    quote["supplier_quotes"] = sq_result.data
    
    return quote

@router.put("/{quote_id}", response_model=dict)
def update_quote(quote_id: str, update: QuoteUpdate):
    """Actualizar un presupuesto."""
    supabase = get_supabase()
    
    data = {}
    if update.items is not None:
        data["items"] = [item.dict() for item in update.items]
        total = sum(
            item.quantity * item.unit_price * (1 - item.discount_pct / 100)
            for item in update.items
        )
        data["total_amount"] = round(total, 2)
    if update.status is not None:
        data["status"] = update.status
    if update.currency is not None:
        data["currency"] = update.currency
    if update.pdf_url is not None:
        data["pdf_url"] = update.pdf_url
    
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = supabase.table("quotes").update(data).eq("id", quote_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    return {"id": quote_id, "updated": True, "data": result.data[0]}

@router.delete("/{quote_id}", response_model=dict)
def delete_quote(quote_id: str):
    """Eliminar un presupuesto."""
    supabase = get_supabase()
    
    result = supabase.table("quotes").delete().eq("id", quote_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    return {"id": quote_id, "deleted": True}

@router.post("/{quote_id}/send-to-suppliers", response_model=dict)
def send_to_suppliers(quote_id: str, supplier_ids: List[str]):
    """Enviar presupuesto a proveedores seleccionados para cotización."""
    supabase = get_supabase()
    
    # Get the quote
    quote_result = supabase.table("quotes").select("*").eq("id", quote_id).execute()
    if not quote_result.data:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    quote = quote_result.data[0]
    items = quote.get("items", [])
    
    # Create supplier_quotes for each item + supplier combination
    created = []
    for supplier_id in supplier_ids:
        for item in items:
            if item.get("material_id"):
                sq_data = {
                    "quote_id": quote_id,
                    "supplier_id": supplier_id,
                    "material_id": item["material_id"],
                    "unit_price": 0,  # Supplier will fill this
                    "status": "pending",
                }
                result = supabase.table("supplier_quotes").insert(sq_data).execute()
                if result.data:
                    created.append(result.data[0]["id"])
    
    # Update quote status
    supabase.table("quotes").update({"status": "sent_to_suppliers"}).eq("id", quote_id).execute()
    
    return {
        "quote_id": quote_id,
        "suppliers_notified": len(supplier_ids),
        "supplier_quotes_created": len(created),
        "status": "sent_to_suppliers",
    }

@router.get("/{quote_id}/supplier-quotes", response_model=List[dict])
def get_supplier_quotes(quote_id: str):
    """Obtener todas las cotizaciones de proveedores para un presupuesto."""
    supabase = get_supabase()
    
    result = supabase.table("supplier_quotes").select(
        "*, supplier:suppliers(*), material:materials(*)"
    ).eq("quote_id", quote_id).execute()
    
    return result.data

@router.post("/{quote_id}/generate-pdf", response_model=dict)
def generate_pdf_endpoint(quote_id: str):
    """Marcar presupuesto como enviado y generar PDF (placeholder)."""
    supabase = get_supabase()
    
    result = supabase.table("quotes").update({
        "status": "sent",
        "pdf_url": f"/pdf/quote_{quote_id}.pdf"
    }).eq("id", quote_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    return {
        "quote_id": quote_id,
        "pdf_url": f"/pdf/quote_{quote_id}.pdf",
        "status": "sent",
    }