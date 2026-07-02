"""CRUD operations for quote-service using Supabase REST API."""

from typing import Any, Optional
from shared.supabase_client import SupabaseClient


# ── Materials ─────────────────────────────────────────────────

def get_materials(db: SupabaseClient, skip: int = 0, limit: int = 100, category: Optional[str] = None) -> list[dict]:
    filters = {"category": f"eq.{category}"} if category else None
    return db.select("materials", limit=limit, offset=skip, order="created_at.desc", filters=filters)


def get_material(db: SupabaseClient, material_id: str) -> Optional[dict]:
    result = db.select("materials", filters={"id": f"eq.{material_id}"}, limit=1)
    return result[0] if result else None


def create_material(db: SupabaseClient, data: dict[str, Any]) -> dict:
    return db.insert("materials", data)


def update_material(db: SupabaseClient, material_id: str, data: dict[str, Any]) -> list[dict]:
    return db.update("materials", {"id": f"eq.{material_id}"}, data)


def delete_material(db: SupabaseClient, material_id: str) -> list[dict]:
    return db.delete("materials", {"id": f"eq.{material_id}"})


# ── Suppliers ─────────────────────────────────────────────────

def get_suppliers(db: SupabaseClient, skip: int = 0, limit: int = 100, verified: Optional[bool] = None) -> list[dict]:
    filters = None
    if verified is not None:
        filters = {"is_verified": "eq.true" if verified else "eq.false"}
    return db.select("suppliers", limit=limit, offset=skip, order="created_at.desc", filters=filters)


def get_supplier(db: SupabaseClient, supplier_id: str) -> Optional[dict]:
    result = db.select("suppliers", filters={"id": f"eq.{supplier_id}"}, limit=1)
    return result[0] if result else None


def create_supplier(db: SupabaseClient, data: dict[str, Any]) -> dict:
    return db.insert("suppliers", data)


def get_supplier_quotes(db: SupabaseClient, supplier_id: str) -> list[dict]:
    return db.select("supplier_quotes", filters={"supplier_id": f"eq.{supplier_id}"}, order="created_at.desc")


# ── Quotes ────────────────────────────────────────────────────

def get_quotes(db: SupabaseClient, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> list[dict]:
    filters = {"status": f"eq.{status}"} if status else None
    return db.select("quotes", limit=limit, offset=skip, order="created_at.desc", filters=filters)


def get_quote(db: SupabaseClient, quote_id: str) -> Optional[dict]:
    result = db.select("quotes", filters={"id": f"eq.{quote_id}"}, limit=1)
    return result[0] if result else None


def create_quote(db: SupabaseClient, data: dict[str, Any]) -> dict:
    return db.insert("quotes", data)


def update_quote(db: SupabaseClient, quote_id: str, data: dict[str, Any]) -> list[dict]:
    return db.update("quotes", {"id": f"eq.{quote_id}"}, data)


def delete_quote(db: SupabaseClient, quote_id: str) -> list[dict]:
    return db.delete("quotes", {"id": f"eq.{quote_id}"})


# ── SupplierQuotes ────────────────────────────────────────────

def get_supplier_quote(db: SupabaseClient, sq_id: str) -> Optional[dict]:
    result = db.select("supplier_quotes", filters={"id": f"eq.{sq_id}"}, limit=1)
    return result[0] if result else None


def create_supplier_quote(db: SupabaseClient, data: dict[str, Any]) -> dict:
    from datetime import datetime, timezone
    data.setdefault("created_at", datetime.now(timezone.utc).isoformat())
    return db.insert("supplier_quotes", data)


def update_supplier_quote(db: SupabaseClient, sq_id: str, data: dict[str, Any]) -> list[dict]:
    return db.update("supplier_quotes", {"id": f"eq.{sq_id}"}, data)