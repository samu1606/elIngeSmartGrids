"""Pydantic schemas for marketplace-service."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, conint


# ── Technician ─────────────────────────────────────────────────

class TechnicianBase(BaseModel):
    user_id: Optional[str] = None
    specialty: str
    hourly_rate: float = 0.0
    experience_years: int = 0
    availability_status: str = "available"
    rating: float = 0.0
    total_jobs: int = 0
    is_verified: bool = False


class TechnicianCreate(TechnicianBase):
    pass


class TechnicianUpdate(BaseModel):
    specialty: Optional[str] = None
    hourly_rate: Optional[float] = None
    experience_years: Optional[int] = None
    availability_status: Optional[str] = None


class TechnicianVerify(BaseModel):
    is_verified: bool = True


class TechnicianResponse(TechnicianBase):
    id: str
    verified_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Certification ─────────────────────────────────────────────

class CertificationBase(BaseModel):
    technician_id: str
    type: str
    number: Optional[str] = None
    country_code: str = "MX"
    document_url: Optional[str] = None
    status: str = "pending"


class CertificationCreate(CertificationBase):
    pass


class CertificationResponse(CertificationBase):
    id: str
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Job ───────────────────────────────────────────────────────

class JobBase(BaseModel):
    user_id: str
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    budget_min: float = 0.0
    budget_max: float = 0.0
    lat: Optional[float] = None
    lng: Optional[float] = None
    address: Optional[str] = None
    scheduled_date: Optional[datetime] = None


class JobCreate(JobBase):
    pass


class JobAssign(BaseModel):
    technician_id: str


class JobComplete(BaseModel):
    notes: Optional[str] = None


class JobResponse(JobBase):
    id: str
    technician_id: Optional[str] = None
    status: str = "open"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Review ─────────────────────────────────────────────────────

class ReviewBase(BaseModel):
    job_id: str
    reviewer_id: str
    reviewee_id: str
    rating: conint(ge=1, le=5)
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True