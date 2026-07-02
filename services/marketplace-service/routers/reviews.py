"""Router: Reviews endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "shared"))

from shared.supabase_client import SupabaseClient
from schemas import ReviewCreate, ReviewResponse
import crud

router = APIRouter(prefix="/reviews", tags=["reviews"])


def get_db():
    from database import get_db as _get_db
    return _get_db()


@router.post("", response_model=ReviewResponse, status_code=201)
async def create_review(review: ReviewCreate, db: SupabaseClient = Depends(get_db)):
    """Create a review for a completed job."""
    job = crud.get_job(db, review.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Job must be completed before reviewing")
    data = review.model_dump(exclude_none=True)
    result = crud.create_review(db, data)
    # Update technician rating after review
    if review.reviewee_id:
        try:
            crud.update_technician_rating(db, review.reviewee_id)
        except Exception:
            pass  # Rating update is best-effort
    return result


@router.get("", response_model=list[ReviewResponse])
async def list_reviews(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    reviewee_id: Optional[str] = None,
    db: SupabaseClient = Depends(get_db),
):
    """List reviews with optional reviewee filter."""
    return crud.get_reviews(db, skip=skip, limit=limit, reviewee_id=reviewee_id)


@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(review_id: str, db: SupabaseClient = Depends(get_db)):
    """Get a single review by ID."""
    result = db.select("reviews", filters={"id": f"eq.{review_id}"}, limit=1)
    if not result:
        raise HTTPException(status_code=404, detail="Review not found")
    return result[0]
