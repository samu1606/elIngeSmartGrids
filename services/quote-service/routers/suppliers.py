"""Router: Suppliers endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "shared"))

from shared.supabase_client import SupabaseClient
from schemas import SupplierCreate, SupplierResponse, SupplierQuoteResponse
import crud

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


def get_db():
    from database import get_db as _get_db
    return _get_db()


@router.get("", response_model=list[SupplierResponse])
async def list_suppliers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    verified: Optional[bool] = None,
    db: SupabaseClient = Depends(get_db),
):
    """List all suppliers with optional verification filter."""
    return crud.get_suppliers(db, skip=skip, limit=limit, verified=verified)


@router.post("", response_model=SupplierResponse, status_code=201)
async def create_supplier(supplier: SupplierCreate, db: SupabaseClient = Depends(get_db)):
    """Register a new supplier."""
    data = supplier.model_dump(exclude_none=True)
    return crud.create_supplier(db, data)


@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(supplier_id: str, db: SupabaseClient = Depends(get_db)):
    """Get a single supplier by ID."""
    result = crud.get_supplier(db, supplier_id)
    if not result:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return result


@router.get("/{supplier_id}/quotes", response_model=list[SupplierQuoteResponse])
async def get_supplier_quotes(supplier_id: str, db: SupabaseClient = Depends(get_db)):
    """Get all quotes submitted by a supplier."""
    supplier = crud.get_supplier(db, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return crud.get_supplier_quotes(db, supplier_id)
