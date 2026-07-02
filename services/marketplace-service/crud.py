"""CRUD operations for marketplace-service using Supabase REST API."""

from typing import Any, Optional
from datetime import datetime, timezone
from shared.supabase_client import SupabaseClient


# ── Technicians ───────────────────────────────────────────────

def get_technicians(
    db: SupabaseClient,
    skip: int = 0,
    limit: int = 100,
    specialty: Optional[str] = None,
    verified: Optional[bool] = None,
    min_rating: Optional[float] = None,
) -> list[dict]:
    filters = {}
    if specialty:
        filters["specialty"] = f"eq.{specialty}"
    if verified is not None:
        filters["is_verified"] = "eq.true" if verified else "eq.false"
    return db.select(
        "technicians", limit=limit, offset=skip, order="rating.desc", filters=filters or None
    )


def get_technician(db: SupabaseClient, technician_id: str) -> Optional[dict]:
    result = db.select("technicians", filters={"id": f"eq.{technician_id}"}, limit=1)
    return result[0] if result else None


def create_technician(db: SupabaseClient, data: dict[str, Any]) -> dict:
    return db.insert("technicians", data)


def update_technician(db: SupabaseClient, technician_id: str, data: dict[str, Any]) -> list[dict]:
    return db.update("technicians", {"id": f"eq.{technician_id}"}, data)


def verify_technician(db: SupabaseClient, technician_id: str, is_verified: bool = True) -> list[dict]:
    data = {
        "is_verified": is_verified,
        "verified_at": datetime.now(timezone.utc).isoformat() if is_verified else None,
    }
    return db.update("technicians", {"id": f"eq.{technician_id}"}, data)


# ── Certifications ─────────────────────────────────────────────

def get_certifications(db: SupabaseClient, technician_id: str) -> list[dict]:
    return db.select(
        "certifications",
        filters={"technician_id": f"eq.{technician_id}"},
        order="created_at.desc",
    )


def create_certification(db: SupabaseClient, data: dict[str, Any]) -> dict:
    return db.insert("certifications", data)


def update_certification(db: SupabaseClient, cert_id: str, data: dict[str, Any]) -> list[dict]:
    return db.update("certifications", {"id": f"eq.{cert_id}"}, data)


# ── Jobs ──────────────────────────────────────────────────────

def get_jobs(
    db: SupabaseClient,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    category: Optional[str] = None,
) -> list[dict]:
    filters = {}
    if status:
        filters["status"] = f"eq.{status}"
    if category:
        filters["category"] = f"eq.{category}"
    return db.select("jobs", limit=limit, offset=skip, order="created_at.desc", filters=filters or None)


def get_job(db: SupabaseClient, job_id: str) -> Optional[dict]:
    result = db.select("jobs", filters={"id": f"eq.{job_id}"}, limit=1)
    return result[0] if result else None


def create_job(db: SupabaseClient, data: dict[str, Any]) -> dict:
    data.setdefault("status", "open")
    return db.insert("jobs", data)


def update_job(db: SupabaseClient, job_id: str, data: dict[str, Any]) -> list[dict]:
    return db.update("jobs", {"id": f"eq.{job_id}"}, data)


def assign_technician(db: SupabaseClient, job_id: str, technician_id: str) -> list[dict]:
    return db.update("jobs", {"id": f"eq.{job_id}"}, {
        "technician_id": technician_id,
        "status": "assigned",
    })


def complete_job(db: SupabaseClient, job_id: str) -> list[dict]:
    return db.update("jobs", {"id": f"eq.{job_id}"}, {"status": "completed"})


# ── Reviews ────────────────────────────────────────────────────

def get_reviews(
    db: SupabaseClient,
    skip: int = 0,
    limit: int = 100,
    reviewee_id: Optional[str] = None,
) -> list[dict]:
    filters = {"reviewee_id": f"eq.{reviewee_id}"} if reviewee_id else None
    return db.select("reviews", limit=limit, offset=skip, order="created_at.desc", filters=filters)


def create_review(db: SupabaseClient, data: dict[str, Any]) -> dict:
    return db.insert("reviews", data)


def update_technician_rating(db: SupabaseClient, technician_id: str) -> Optional[dict]:
    """Recalculate technician rating from reviews."""
    reviews = db.select("reviews", filters={"reviewee_id": f"eq.{technician_id}"}, limit=1000)
    if not reviews:
        return None
    avg_rating = sum(r.get("rating", 0) for r in reviews) / len(reviews)
    return db.update("technicians", {"id": f"eq.{technician_id}"}, {
        "rating": round(avg_rating, 2),
        "total_jobs": len(reviews),
    })