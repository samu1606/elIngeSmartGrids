"""SQLAlchemy models for quote-service.

These models are for documentation/migration purposes. The actual data
lives in Supabase (PostgreSQL). We use the Supabase REST API for all
operations.
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, JSON, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Material(Base):
    __tablename__ = "materials"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String)
    brand = Column(String)
    model = Column(String)
    specs = Column(JSON, default=dict)
    unit = Column(String, default="unit")
    created_at = Column(DateTime, default=datetime.utcnow)


class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("profiles.id"))
    company_name = Column(String, nullable=False)
    country_code = Column(String, default="MX")
    ships_international = Column(Boolean, default=False)
    rating = Column(Float, default=0.0)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Quote(Base):
    __tablename__ = "quotes"
    id = Column(String, primary_key=True)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=True)
    technician_id = Column(String, ForeignKey("technicians.id"), nullable=True)
    total_amount = Column(Float, default=0.0)
    currency = Column(String, default="USD")
    items = Column(JSON, default=list)
    pdf_url = Column(String)
    status = Column(String, default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)


class SupplierQuote(Base):
    __tablename__ = "supplier_quotes"
    id = Column(String, primary_key=True)
    quote_id = Column(String, ForeignKey("quotes.id"), nullable=False)
    supplier_id = Column(String, ForeignKey("suppliers.id"), nullable=False)
    material_id = Column(String, ForeignKey("materials.id"), nullable=False)
    unit_price = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    stock_available = Column(Integer, default=0)
    delivery_days = Column(Integer, default=7)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)