"""Router: Certifications endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "shared"))

from shared.supabase_client import SupabaseClient
from schemas import CertificationCreate, CertificationResponse
import crud

router = APIRouter(prefix="/certifications", tags=["certifications"])


def get_db():
    from database import get_db as _get_db
    return _get_db()


@router.post("", response_model=CertificationResponse, status_code=201)
async def upload_certification(cert: CertificationCreate, db: SupabaseClient = Depends(get_db)):
    """Submit a new certification for a technician."""
    tech = crud.get_technician(db, cert.technician_id)
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
    data = cert.model_dump(exclude_none=True)
    data.setdefault("status", "pending")
    return crud.create_certification(db, data)


@router.get("/{cert_id}", response_model=CertificationResponse)
async def get_certification(cert_id: str, db: SupabaseClient = Depends(get_db)):
    """Get a single certification by ID."""
    result = crud.update_certification(db, cert_id, {})
    if not result:
        raise HTTPException(status_code=404, detail="Certification not found")
    return result[0]


@router.put("/{cert_id}/verify", response_model=CertificationResponse)
async def verify_certification(
    cert_id: str,
    verified_by: str,
    db: SupabaseClient = Depends(get_db),
):
    """Verify a certification (admin only)."""
    from datetime import datetime, timezone
    data = {
        "status": "verified",
        "verified_by": verified_by,
        "verified_at": datetime.now(timezone.utc).isoformat(),
    }
    result = crud.update_certification(db, cert_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Certification not found")
    return result[0]
