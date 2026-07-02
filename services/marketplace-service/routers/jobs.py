"""Jobs router — Gestión de trabajos/solicitudes."""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from shared.supabase_client import get_supabase

router = APIRouter()

class JobCreate(BaseModel):
    user_id: str
    title: str
    description: Optional[str] = None
    category: str = "general"  # installation, repair, inspection, solar, ev_charging
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    address: Optional[str] = None
    scheduled_date: Optional[date] = None

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None

class JobAssign(BaseModel):
    technician_id: str

@router.post("", response_model=dict)
def create_job(job: JobCreate):
    """Crear una nueva solicitud de trabajo."""
    supabase = get_supabase()
    data = job.dict()
    data["status"] = "open"
    result = supabase.table("jobs").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Error creating job")
    return result.data[0]

@router.get("", response_model=List[dict])
def list_jobs(
    user_id: Optional[str] = Query(None),
    technician_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
):
    """Listar trabajos con filtros opcionales."""
    supabase = get_supabase()
    query = supabase.table("jobs").select("*")
    
    if user_id:
        query = query.eq("user_id", user_id)
    if technician_id:
        query = query.eq("technician_id", technician_id)
    if category:
        query = query.eq("category", category)
    if status:
        query = query.eq("status", status)
    
    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return result.data

@router.get("/{job_id}", response_model=dict)
def get_job(job_id: str):
    """Obtener un trabajo por ID con presupuesto asociado."""
    supabase = get_supabase()
    
    result = supabase.table("jobs").select("*").eq("id", job_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = result.data[0]
    
    # Get associated quotes
    quotes = supabase.table("quotes").select("*").eq("job_id", job_id).execute()
    job["quotes"] = quotes.data
    
    return job

@router.put("/{job_id}", response_model=dict)
def update_job(job_id: str, update: JobUpdate):
    """Actualizar un trabajo."""
    supabase = get_supabase()
    data = {k: v for k, v in update.dict().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = supabase.table("jobs").update(data).eq("id", job_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return result.data[0]

@router.put("/{job_id}/assign", response_model=dict)
def assign_technician(job_id: str, assign: JobAssign):
    """Asignar un técnico a un trabajo."""
    supabase = get_supabase()
    result = supabase.table("jobs").update({
        "technician_id": assign.technician_id,
        "status": "assigned",
    }).eq("id", job_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job_id, "technician_id": assign.technician_id, "status": "assigned"}

@router.put("/{job_id}/start", response_model=dict)
def start_job(job_id: str):
    """Marcar trabajo como en progreso."""
    supabase = get_supabase()
    result = supabase.table("jobs").update({"status": "in_progress"}).eq("id", job_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job_id, "status": "in_progress"}

@router.put("/{job_id}/complete", response_model=dict)
def complete_job(job_id: str):
    """Marcar trabajo como completado y actualizar stats del técnico."""
    supabase = get_supabase()
    
    # Get job first
    job_result = supabase.table("jobs").select("*").eq("id", job_id).execute()
    if not job_result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = job_result.data[0]
    
    # Update job status
    supabase.table("jobs").update({"status": "completed"}).eq("id", job_id).execute()
    
    # Update technician stats
    if job.get("technician_id"):
        tech = supabase.table("technicians").select("*").eq("id", job["technician_id"]).execute()
        if tech.data:
            tech_data = tech.data[0]
            new_total = (tech_data.get("total_jobs") or 0) + 1
            supabase.table("technicians").update({"total_jobs": new_total}).eq("id", job["technician_id"]).execute()
    
    return {"job_id": job_id, "status": "completed"}

@router.put("/{job_id}/cancel", response_model=dict)
def cancel_job(job_id: str):
    """Cancelar un trabajo."""
    supabase = get_supabase()
    result = supabase.table("jobs").update({"status": "cancelled"}).eq("id", job_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job_id, "status": "cancelled"}

@router.delete("/{job_id}", response_model=dict)
def delete_job(job_id: str):
    """Eliminar un trabajo."""
    supabase = get_supabase()
    result = supabase.table("jobs").delete().eq("id", job_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"id": job_id, "deleted": True}