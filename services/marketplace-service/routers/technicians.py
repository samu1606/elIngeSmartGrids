"""Router: Technicians endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "shared"))

from shared.supabase_client import SupabaseClient
from schemas import (
    TechnicianCreate, TechnicianUpdate, TechnicianVerify,
    TechnicianResponse, CertificationResponse,
)
import crud

router = APIRouter(prefix="/technicians", tags=["technicians"])


def get_db():
    from database import get_db as _get_db
    return _get_db()


@router.post("", response_model=TechnicianResponse, status_code=201)
async def register_technician(tech: TechnicianCreate, db: SupabaseClient = Depends(get_db)):
    """Register a new technician."""
    data = tech.model_dump(exclude_none=True)
    return crud.create_technician(db, data)


@router.get("", response_model=list[TechnicianResponse])
async def list_technicians(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    specialty: Optional[str] = None,
    verified: Optional[bool] = None,
    min_rating: Optional[float] = None,
    db: SupabaseClient = Depends(get_db),
):
    """List technicians with filters (specialty, verified, min_rating)."""
    results = crud.get_technicians(db, skip=skip, limit=limit, specialty=specialty, verified=verified)
    if min_rating is not None:
        results = [t for t in results if t.get("rating", 0) >= min_rating]
    return results


@router.get("/{technician_id}", response_model=TechnicianResponse)
async def get_technician(technician_id: str, db: SupabaseClient = Depends(get_db)):
    """Get a technician's profile."""
    result = crud.get_technician(db, technician_id)
    if not result:
        raise HTTPException(status_code=404, detail="Technician not found")
    return result


@router.put("/{technician_id}", response_model=TechnicianResponse)
async def update_technician(
    technician_id: str,
    tech: TechnicianUpdate,
    db: SupabaseClient = Depends(get_db),
):
    """Update technician profile."""
    existing = crud.get_technician(db, technician_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Technician not found")
    data = tech.model_dump(exclude_unset=True, exclude_none=True)
    result = crud.update_technician(db, technician_id, data)
    return result[0] if result else existing


@router.put("/{technician_id}/verify", response_model=TechnicianResponse)
async def verify_technician(
    technician_id: str,
    verify: TechnicianVerify,
    db: SupabaseClient = Depends(get_db),
):
    """Verify a technician (admin only)."""
    existing = crud.get_technician(db, technician_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Technician not found")
    result = crud.verify_technician(db, technician_id, verify.is_verified)
    return result[0] if result else existing


@router.get("/{technician_id}/certifications", response_model=list[CertificationResponse])
async def get_certifications(technician_id: str, db: SupabaseClient = Depends(get_db)):
    """List all certifications for a technician."""
    tech = crud.get_technician(db, technician_id)
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
    return crud.get_certifications(db, technician_id)
