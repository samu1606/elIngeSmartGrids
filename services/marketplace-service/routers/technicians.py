"""Technicians router — Registro y búsqueda de técnicos con geolocalización."""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from shared.supabase_client import get_supabase
import math

router = APIRouter()

class TechnicianCreate(BaseModel):
    user_id: str
    specialty: str
    hourly_rate: Optional[float] = None
    experience_years: Optional[int] = None

class TechnicianUpdate(BaseModel):
    specialty: Optional[str] = None
    hourly_rate: Optional[float] = None
    experience_years: Optional[int] = None
    availability_status: Optional[str] = None
    is_verified: Optional[bool] = None

@router.post("", response_model=dict)
def create_technician(tech: TechnicianCreate):
    """Registrar un nuevo técnico."""
    supabase = get_supabase()
    result = supabase.table("technicians").insert(tech.dict()).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Error creating technician")
    return result.data[0]

@router.get("", response_model=List[dict])
def list_technicians(
    specialty: Optional[str] = Query(None),
    is_verified: Optional[bool] = Query(None),
    min_rating: Optional[float] = Query(None),
    availability: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius_km: float = Query(50, le=500),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
):
    """Listar técnicos con filtros opcionales y búsqueda por geolocalización."""
    supabase = get_supabase()
    query = supabase.table("technicians").select("*")
    
    if specialty:
        query = query.eq("specialty", specialty)
    if is_verified is not None:
        query = query.eq("is_verified", is_verified)
    if min_rating is not None:
        query = query.gte("rating", min_rating)
    if availability:
        query = query.eq("availability_status", availability)
    
    result = query.order("rating", desc=True).range(offset, offset + limit - 1).execute()
    
    technicians = result.data
    
    # Filter by distance if lat/lng provided
    if lat is not None and lng is not None:
        filtered = []
        for tech in technicians:
            # Get tech location from profiles table
            user_id = tech.get("user_id")
            if user_id:
                profile_result = supabase.table("profiles").select("lat,lng").eq("id", user_id).execute()
                if profile_result.data:
                    tech_lat = profile_result.data[0].get("lat")
                    tech_lng = profile_result.data[0].get("lng")
                    if tech_lat and tech_lng:
                        dist = haversine(lat, lng, tech_lat, tech_lng)
                        if dist <= radius_km:
                            tech["distance_km"] = round(dist, 2)
                            filtered.append(tech)
        technicians = filtered
    
    return technicians

@router.get("/{technician_id}", response_model=dict)
def get_technician(technician_id: str):
    """Obtener perfil completo de un técnico con certificaciones y reseñas."""
    supabase = get_supabase()
    
    # Get technician
    result = supabase.table("technicians").select("*").eq("id", technician_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Technician not found")
    
    tech = result.data[0]
    
    # Get certifications
    certs = supabase.table("certifications").select("*").eq("technician_id", technician_id).execute()
    tech["certifications"] = certs.data
    
    # Get reviews
    reviews = supabase.table("reviews").select("*").eq("reviewee_id", tech.get("user_id")).execute()
    tech["reviews"] = reviews.data
    
    # Get profile info
    if tech.get("user_id"):
        profile = supabase.table("profiles").select("*").eq("id", tech["user_id"]).execute()
        if profile.data:
            tech["profile"] = profile.data[0]
    
    return tech

@router.put("/{technician_id}", response_model=dict)
def update_technician(technician_id: str, update: TechnicianUpdate):
    """Actualizar perfil de técnico."""
    supabase = get_supabase()
    data = {k: v for k, v in update.dict().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = supabase.table("technicians").update(data).eq("id", technician_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Technician not found")
    return result.data[0]

@router.delete("/{technician_id}", response_model=dict)
def delete_technician(technician_id: str):
    """Eliminar un técnico."""
    supabase = get_supabase()
    result = supabase.table("technicians").delete().eq("id", technician_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Technician not found")
    return {"id": technician_id, "deleted": True}

@router.put("/{technician_id}/verify", response_model=dict)
def verify_technician(technician_id: str, verified_by: str):
    """Verificar un técnico (solo admin)."""
    supabase = get_supabase()
    result = supabase.table("technicians").update({
        "is_verified": True,
        "verified_at": "now()"
    }).eq("id", technician_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Technician not found")
    return {"id": technician_id, "verified": True}

def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calcular distancia en km entre dos puntos GPS."""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c