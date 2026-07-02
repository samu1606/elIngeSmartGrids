"""Suppliers router — Gestión de proveedores de materiales."""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from shared.supabase_client import get_supabase

router = APIRouter()

class SupplierCreate(BaseModel):
    user_id: Optional[str] = None
    company_name: str
    country_code: str = "CO"
    ships_international: bool = False

class SupplierUpdate(BaseModel):
    company_name: Optional[str] = None
    country_code: Optional[str] = None
    ships_international: Optional[bool] = None
    rating: Optional[float] = None
    is_verified: Optional[bool] = None

class SupplierQuoteResponse(BaseModel):
    unit_price: float
    currency: str = "USD"
    stock_available: int = 0
    delivery_days: int = 14

@router.post("", response_model=dict)
def create_supplier(supplier: SupplierCreate):
    """Registrar un nuevo proveedor."""
    supabase = get_supabase()
    result = supabase.table("suppliers").insert(supplier.dict()).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Error creating supplier")
    return result.data[0]

@router.get("", response_model=List[dict])
def list_suppliers(
    country_code: Optional[str] = Query(None),
    ships_international: Optional[bool] = Query(None),
    is_verified: Optional[bool] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
):
    """Listar proveedores con filtros opcionales."""
    supabase = get_supabase()
    query = supabase.table("suppliers").select("*")
    
    if country_code:
        query = query.eq("country_code", country_code)
    if ships_international is not None:
        query = query.eq("ships_international", ships_international)
    if is_verified is not None:
        query = query.eq("is_verified", is_verified)
    
    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return result.data

@router.get("/{supplier_id}", response_model=dict)
def get_supplier(supplier_id: str):
    """Obtener un proveedor por ID."""
    supabase = get_supabase()
    result = supabase.table("suppliers").select("*").eq("id", supplier_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return result.data[0]

@router.put("/{supplier_id}", response_model=dict)
def update_supplier(supplier_id: str, update: SupplierUpdate):
    """Actualizar un proveedor."""
    supabase = get_supabase()
    data = {k: v for k, v in update.dict().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = supabase.table("suppliers").update(data).eq("id", supplier_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return result.data[0]

@router.delete("/{supplier_id}", response_model=dict)
def delete_supplier(supplier_id: str):
    """Eliminar un proveedor."""
    supabase = get_supabase()
    result = supabase.table("suppliers").delete().eq("id", supplier_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return {"id": supplier_id, "deleted": True}

@router.get("/{supplier_id}/quotes", response_model=List[dict])
def get_supplier_quotes(supplier_id: str):
    """Obtener todas las cotizaciones que un proveedor ha recibido."""
    supabase = get_supabase()
    result = supabase.table("supplier_quotes").select(
        "*, quote:quotes(*), material:materials(*)"
    ).eq("supplier_id", supplier_id).order("created_at", desc=True).execute()
    return result.data

@router.put("/{supplier_quote_id}/respond", response_model=dict)
def respond_to_quote(
    supplier_quote_id: str,
    unit_price: float,
    currency: str = "USD",
    stock_available: int = 0,
    delivery_days: int = 14,
):
    """Proveedor responde a una cotización con precio y disponibilidad."""
    supabase = get_supabase()
    
    data = {
        "unit_price": unit_price,
        "currency": currency,
        "stock_available": stock_available,
        "delivery_days": delivery_days,
        "status": "sent",
    }
    
    result = supabase.table("supplier_quotes").update(data).eq("id", supplier_quote_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Supplier quote not found")
    
    return {"id": supplier_quote_id, "updated": True, "data": result.data[0]}