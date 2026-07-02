"""Materials router — Catálogo de materiales eléctricos."""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from shared.supabase_client import get_supabase

router = APIRouter()

class MaterialCreate(BaseModel):
    name: str
    category: str
    brand: Optional[str] = None
    model: Optional[str] = None
    specs: dict = {}
    unit: str = "unidad"

class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    specs: Optional[dict] = None
    unit: Optional[str] = None

@router.post("", response_model=dict)
def create_material(material: MaterialCreate):
    """Crear un nuevo material en el catálogo."""
    supabase = get_supabase()
    result = supabase.table("materials").insert(material.dict()).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Error creating material")
    return result.data[0]

@router.get("", response_model=List[dict])
def list_materials(
    category: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
):
    """Listar materiales con filtros opcionales."""
    supabase = get_supabase()
    query = supabase.table("materials").select("*")
    
    if category:
        query = query.eq("category", category)
    if brand:
        query = query.eq("brand", brand)
    if search:
        query = query.ilike("name", f"%{search}%")
    
    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return result.data

@router.get("/{material_id}", response_model=dict)
def get_material(material_id: str):
    """Obtener un material por ID."""
    supabase = get_supabase()
    result = supabase.table("materials").select("*").eq("id", material_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Material not found")
    return result.data[0]

@router.put("/{material_id}", response_model=dict)
def update_material(material_id: str, update: MaterialUpdate):
    """Actualizar un material."""
    supabase = get_supabase()
    data = {k: v for k, v in update.dict().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = supabase.table("materials").update(data).eq("id", material_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Material not found")
    return result.data[0]

@router.delete("/{material_id}", response_model=dict)
def delete_material(material_id: str):
    """Eliminar un material."""
    supabase = get_supabase()
    result = supabase.table("materials").delete().eq("id", material_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"id": material_id, "deleted": True}

@router.get("/categories/list", response_model=List[str])
def list_categories():
    """Listar todas las categorías de materiales disponibles."""
    supabase = get_supabase()
    result = supabase.table("materials").select("category").execute()
    categories = list(set(item["category"] for item in result.data if item.get("category")))
    return sorted(categories)

@router.post("/bulk", response_model=dict)
def bulk_create_materials(materials: List[MaterialCreate]):
    """Crear múltiples materiales a la vez (bulk insert)."""
    supabase = get_supabase()
    data = [m.dict() for m in materials]
    result = supabase.table("materials").insert(data).execute()
    return {"created": len(result.data) if result.data else 0, "data": result.data}