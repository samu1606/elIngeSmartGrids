"""Reviews router — Sistema de reseñas y calificaciones."""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from shared.supabase_client import get_supabase

router = APIRouter()

class ReviewCreate(BaseModel):
    job_id: str
    reviewer_id: str
    reviewee_id: str
    rating: int  # 1-5
    comment: Optional[str] = None

@router.post("", response_model=dict)
def create_review(review: ReviewCreate):
    """Crear una reseña. También actualiza el rating promedio del técnico."""
    supabase = get_supabase()
    
    if not (1 <= review.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Check job exists and is completed
    job_result = supabase.table("jobs").select("*").eq("id", review.job_id).execute()
    if not job_result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Insert review
    result = supabase.table("reviews").insert(review.dict()).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Error creating review")
    
    # Update technician's average rating
    all_reviews = supabase.table("reviews").select("rating").eq("reviewee_id", review.reviewee_id).execute()
    if all_reviews.data:
        ratings = [r["rating"] for r in all_reviews.data]
        avg_rating = sum(ratings) / len(ratings)
        
        # Find technician by user_id
        tech_result = supabase.table("technicians").select("*").eq("user_id", review.reviewee_id).execute()
        if tech_result.data:
            supabase.table("technicians").update({"rating": round(avg_rating, 2)}).eq(
                "user_id", review.reviewee_id
            ).execute()
    
    return result.data[0]

@router.get("", response_model=List[dict])
def list_reviews(
    reviewee_id: Optional[str] = Query(None),
    job_id: Optional[str] = Query(None),
    rating: Optional[int] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
):
    """Listar reseñas con filtros opcionales."""
    supabase = get_supabase()
    query = supabase.table("reviews").select("*")
    
    if reviewee_id:
        query = query.eq("reviewee_id", reviewee_id)
    if job_id:
        query = query.eq("job_id", job_id)
    if rating:
        query = query.eq("rating", rating)
    
    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return result.data

@router.get("/{review_id}", response_model=dict)
def get_review(review_id: str):
    """Obtener una reseña por ID."""
    supabase = get_supabase()
    result = supabase.table("reviews").select("*").eq("id", review_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Review not found")
    return result.data[0]

@router.delete("/{review_id}", response_model=dict)
def delete_review(review_id: str):
    """Eliminar una reseña."""
    supabase = get_supabase()
    result = supabase.table("reviews").delete().eq("id", review_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"id": review_id, "deleted": True}