"""Router: Quotes endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "shared"))

from shared.supabase_client import SupabaseClient
from shared.config import get_settings
from schemas import (
    QuoteCreate, QuoteUpdate, QuoteResponse,
    SupplierQuoteCreate, SupplierQuoteResponse,
    SendToSuppliersRequest,
)
import crud

router = APIRouter(prefix="/quotes", tags=["quotes"])


def get_db():
    from database import get_db as _get_db
    return _get_db()


@router.post("", response_model=QuoteResponse, status_code=201)
async def create_quote(quote: QuoteCreate, db: SupabaseClient = Depends(get_db)):
    """Create a new quote / presupuesto."""
    data = quote.model_dump(exclude_none=True)
    # Recalculate total if items present
    if data.get("items"):
        total = sum(
            (item.get("quantity", 1) * item.get("unit_price", 0))
            for item in data["items"]
        )
        data["total_amount"] = total
    return crud.create_quote(db, data)


@router.get("", response_model=list[QuoteResponse])
async def list_quotes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[str] = None,
    db: SupabaseClient = Depends(get_db),
):
    """List all quotes with optional status filter."""
    return crud.get_quotes(db, skip=skip, limit=limit, status=status)


@router.get("/{quote_id}", response_model=QuoteResponse)
async def get_quote(quote_id: str, db: SupabaseClient = Depends(get_db)):
    """Get a single quote by ID."""
    result = crud.get_quote(db, quote_id)
    if not result:
        raise HTTPException(status_code=404, detail="Quote not found")
    return result


@router.put("/{quote_id}", response_model=QuoteResponse)
async def update_quote(quote_id: str, quote: QuoteUpdate, db: SupabaseClient = Depends(get_db)):
    """Update a quote."""
    existing = crud.get_quote(db, quote_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Quote not found")
    data = quote.model_dump(exclude_unset=True, exclude_none=True)
    # Recalculate total if items changed
    if data.get("items"):
        total = sum(
            (item.get("quantity", 1) * item.get("unit_price", 0))
            for item in data["items"]
        )
        data["total_amount"] = total
    result = crud.update_quote(db, quote_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Quote not found")
    return result[0]


@router.delete("/{quote_id}", status_code=204)
async def delete_quote(quote_id: str, db: SupabaseClient = Depends(get_db)):
    """Delete a quote."""
    existing = crud.get_quote(db, quote_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Quote not found")
    crud.delete_quote(db, quote_id)
    return None


@router.post("/{quote_id}/send-to-suppliers", status_code=200)
async def send_to_suppliers(
    quote_id: str,
    request: SendToSuppliersRequest,
    db: SupabaseClient = Depends(get_db),
):
    """Send a quote to multiple suppliers for pricing."""
    quote = crud.get_quote(db, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    items = quote.get("items", [])
    if not items:
        raise HTTPException(status_code=400, detail="Quote has no items to send")

    supplier_ids = request.supplier_ids
    if not supplier_ids:
        # Send to all verified suppliers
        all_suppliers = crud.get_suppliers(db, verified=True, limit=500)
        supplier_ids = [s["id"] for s in all_suppliers]

    if not supplier_ids:
        raise HTTPException(status_code=400, detail="No suppliers available")

    created = []
    for supplier_id in supplier_ids:
        for item in items:
            sq_data = {
                "quote_id": quote_id,
                "supplier_id": supplier_id,
                "material_id": item.get("material_id", ""),
                "unit_price": 0.0,
                "currency": quote.get("currency", "USD"),
                "stock_available": 0,
                "delivery_days": 7,
                "status": "pending",
            }
            try:
                sq = crud.create_supplier_quote(db, sq_data)
                created.append(sq)
            except Exception:
                pass  # Continue with other suppliers

    # Update quote status
    crud.update_quote(db, quote_id, {"status": "sent_to_suppliers"})

    return {
        "message": f"Quote sent to {len(supplier_ids)} supplier(s)",
        "supplier_quotes_created": len(created),
        "supplier_ids": supplier_ids,
    }
