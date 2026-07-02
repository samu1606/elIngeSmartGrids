"""Router: Jobs endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "shared"))

from shared.supabase_client import SupabaseClient
from schemas import JobCreate, JobResponse, JobAssign, JobComplete
import crud

router = APIRouter(prefix="/jobs", tags=["jobs"])


def get_db():
    from database import get_db as _get_db
    return _get_db()


@router.post("", response_model=JobResponse, status_code=201)
async def create_job(job: JobCreate, db: SupabaseClient = Depends(get_db)):
    """Create a new job posting."""
    data = job.model_dump(exclude_none=True)
    return crud.create_job(db, data)


@router.get("", response_model=list[JobResponse])
async def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: SupabaseClient = Depends(get_db),
):
    """List jobs with optional filters."""
    return crud.get_jobs(db, skip=skip, limit=limit, status=status, category=category)


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, db: SupabaseClient = Depends(get_db)):
    """Get a single job by ID."""
    result = crud.get_job(db, job_id)
    if not result:
        raise HTTPException(status_code=404, detail="Job not found")
    return result


@router.put("/{job_id}/assign", response_model=JobResponse)
async def assign_job(
    job_id: str,
    assign: JobAssign,
    db: SupabaseClient = Depends(get_db),
):
    """Assign a technician to a job."""
    job = crud.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    tech = crud.get_technician(db, assign.technician_id)
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
    result = crud.assign_technician(db, job_id, assign.technician_id)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to assign technician")
    return result[0]


@router.put("/{job_id}/complete", response_model=JobResponse)
async def complete_job(
    job_id: str,
    complete: JobComplete,
    db: SupabaseClient = Depends(get_db),
):
    """Mark a job as completed."""
    job = crud.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.get("status") not in ("assigned", "in_progress"):
        raise HTTPException(status_code=400, detail=f"Job must be assigned or in_progress to complete. Current: {job.get('status')}")
    result = crud.complete_job(db, job_id)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to complete job")
    return result[0]
