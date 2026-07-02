"""SQLAlchemy models for marketplace-service.

Documented for reference. Actual operations use the Supabase REST API.
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Technician(Base):
    __tablename__ = "technicians"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("profiles.id"))
    specialty = Column(String)
    hourly_rate = Column(Float, default=0.0)
    experience_years = Column(Integer, default=0)
    availability_status = Column(String, default="available")
    rating = Column(Float, default=0.0)
    total_jobs = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Certification(Base):
    __tablename__ = "certifications"
    id = Column(String, primary_key=True)
    technician_id = Column(String, ForeignKey("technicians.id"), nullable=False)
    type = Column(String, nullable=False)
    number = Column(String)
    country_code = Column(String, default="MX")
    document_url = Column(String)
    status = Column(String, default="pending")
    verified_by = Column(String, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Job(Base):
    __tablename__ = "jobs"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("profiles.id"))
    technician_id = Column(String, ForeignKey("technicians.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    status = Column(String, default="open")
    budget_min = Column(Float, default=0.0)
    budget_max = Column(Float, default=0.0)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    address = Column(String)
    scheduled_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Review(Base):
    __tablename__ = "reviews"
    id = Column(String, primary_key=True)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    reviewer_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    reviewee_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)