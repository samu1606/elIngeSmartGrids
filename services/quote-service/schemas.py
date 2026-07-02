"""Pydantic schemas for quote-service."""

from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field, EmailStr


# ── Material ──────────────────────────────────────────────────

class MaterialBase(BaseModel):
    name: str
    category: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    specs: Optional[dict[str, Any]] = Field(default_factory=dict)
    unit: str = "unit"


class MaterialCreate(MaterialBase):
    pass


class MaterialResponse(MaterialBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Supplier ──────────────────────────────────────────────────

class SupplierBase(BaseModel):
    user_id: Optional[str] = None
    company_name: str
    country_code: str = "MX"
    ships_international: bool = False
    rating: float = 0.0
    is_verified: bool = False


class SupplierCreate(SupplierBase):
    pass


class SupplierResponse(SupplierBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Quote ─────────────────────────────────────────────────────

class QuoteItem(BaseModel):
    material_id: Optional[str] = None
    name: str
    quantity: int = 1
    unit_price: float = 0.0
    subtotal: float = 0.0


class QuoteBase(BaseModel):
    job_id: Optional[str] = None
    technician_id: Optional[str] = None
    total_amount: float = 0.0
    currency: str = "USD"
    items: list[QuoteItem] = Field(default_factory=list)
    pdf_url: Optional[str] = None
    status: str = "draft"


class QuoteCreate(QuoteBase):
    pass


class QuoteUpdate(BaseModel):
    job_id: Optional[str] = None
    technician_id: Optional[str] = None
    total_amount: Optional[float] = None
    currency: Optional[str] = None
    items: Optional[list[QuoteItem]] = None
    pdf_url: Optional[str] = None
    status: Optional[str] = None


class QuoteResponse(QuoteBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── SupplierQuote ─────────────────────────────────────────────

class SupplierQuoteBase(BaseModel):
    quote_id: str
    supplier_id: str
    material_id: str
    unit_price: float
    currency: str = "USD"
    stock_available: int = 0
    delivery_days: int = 7
    status: str = "pending"


class SupplierQuoteCreate(SupplierQuoteBase):
    pass


class SupplierQuoteResponse(SupplierQuoteBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Send to suppliers ──────────────────────────────────────────

class SendToSuppliersRequest(BaseModel):
    supplier_ids: list[str] = Field(default_factory=list)
    message: Optional[str] = None