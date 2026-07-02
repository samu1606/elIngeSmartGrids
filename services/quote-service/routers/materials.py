"""Router: Materials endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "shared"))

from shared.supabase_client import SupabaseClient
from schemas import MaterialCreate, MaterialResponse
import crud

router = APIRouter(prefix="/materials", tags=["materials"])


def get_db():
    from database import get_db as _get_db
    return _get_db()


@router.get("", response_model=list[MaterialResponse])
async def list_materials(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    category: Optional[str] = None,
    db: SupabaseClient = Depends(get_db),
):
    """List all materials with optional category filter."""
    return crud.get_materials(db, skip=skip, limit=limit, category=category)


@router.post("", response_model=MaterialResponse, status_code=201)
async def create_material(material: MaterialCreate, db: SupabaseClient = Depends(get_db)):
    """Create a new material."""
    data = material.model_dump(exclude_none=True)
    return crud.create_material(db, data)


@router.get("/{material_id}", response_model=MaterialResponse)
async def get_material(material_id: str, db: SupabaseClient = Depends(get_db)):
    """Get a single material by ID."""
    result = crud.get_material(db, material_id)
    if not result:
        raise HTTPException(status_code=404, detail="Material not found")
    return result


@router.put("/{material_id}", response_model=MaterialResponse)
async def update_material(
    material_id: str,
    material: MaterialCreate,
    db: SupabaseClient = Depends(get_db),
):
    """Update a material."""
    existing = crud.get_material(db, material_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Material not found")
    data = material.model_dump(exclude_none=True)
    result = crud.update_material(db, material_id, data)
    return result[0] if result else existing


@router.delete("/{material_id}", status_code=204)
async def delete_material(material_id: str, db: SupabaseClient = Depends(get_db)):
    """Delete a material."""
    existing = crud.get_material(db, material_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Material not found")
    crud.delete_material(db, material_id)
    return None
