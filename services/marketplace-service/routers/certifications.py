"""Certifications router — Verificación de matrículas y certificaciones profesionales."""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from shared.supabase_client import get_supabase

router = APIRouter()

class CertificationCreate(BaseModel):
    technician_id: str
    type: str  # retie, matricula_profesional, nec_license, cedula_prof, iec_cert
    number: str
    country_code: str = "CO"
    document_url: Optional[str] = None

class CertificationVerify(BaseModel):
    verified_by: str
    status: str = "verified"  # verified, rejected

# Map of certification types by country
CERT_TYPES_BY_COUNTRY = {
    "CO": ["retie", "matricula_profesional", "certificado_competencia"],
    "US": ["nec_license", "journeyman_card", "master_electrician"],
    "MX": ["cedula_prof", "dro_responsable"],
    "CA": ["csa_certification", "red_seal"],
    "EC": ["registros_secretaria", "certificado_tecnico"],
    "ES": ["cie", "certificado_instalador_electrico"],
    "AR": ["matricula_coa", "certificado_instalador"],
    "CL": ["sec", "certificado_instalador"],
    "BR": ["nr10", "nbr5410_cert"],
    "PE": ["cip_ingeniero", "certificado_tecnico"],
}

@router.post("", response_model=dict)
def create_certification(cert: CertificationCreate):
    """Subir una certificación/matrícula para verificación."""
    supabase = get_supabase()
    
    # Validate certification type for country
    valid_types = CERT_TYPES_BY_COUNTRY.get(cert.country_code, [])
    if valid_types and cert.type not in valid_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid certification type '{cert.type}' for country '{cert.country_code}'. Valid types: {valid_types}"
        )
    
    data = cert.dict()
    data["status"] = "pending"
    
    result = supabase.table("certifications").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Error creating certification")
    return result.data[0]

@router.get("", response_model=List[dict])
def list_certifications(
    technician_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    country_code: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
):
    """Listar certificaciones con filtros."""
    supabase = get_supabase()
    query = supabase.table("certifications").select("*")
    
    if technician_id:
        query = query.eq("technician_id", technician_id)
    if status:
        query = query.eq("status", status)
    if country_code:
        query = query.eq("country_code", country_code)
    
    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return result.data

@router.get("/{cert_id}", response_model=dict)
def get_certification(cert_id: str):
    """Obtener una certificación por ID."""
    supabase = get_supabase()
    result = supabase.table("certifications").select("*").eq("id", cert_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Certification not found")
    return result.data[0]

@router.put("/{cert_id}/verify", response_model=dict)
def verify_certification(cert_id: str, verify: CertificationVerify):
    """Verificar o rechazar una certificación (solo admin)."""
    supabase = get_supabase()
    
    data = {
        "status": verify.status,
        "verified_by": verify.verified_by,
        "verified_at": "now()" if verify.status == "verified" else None,
    }
    data = {k: v for k, v in data.items() if v is not None}
    
    result = supabase.table("certifications").update(data).eq("id", cert_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Certification not found")
    
    # If certified, also verify the technician
    if verify.status == "verified":
        cert = result.data[0]
        tech_id = cert.get("technician_id")
        if tech_id:
            supabase.table("technicians").update({
                "is_verified": True,
                "verified_at": "now()"
            }).eq("id", tech_id).execute()
    
    return {"id": cert_id, "status": verify.status, "verified": True}

@router.delete("/{cert_id}", response_model=dict)
def delete_certification(cert_id: str):
    """Eliminar una certificación."""
    supabase = get_supabase()
    result = supabase.table("certifications").delete().eq("id", cert_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Certification not found")
    return {"id": cert_id, "deleted": True}

@router.get("/types/{country_code}", response_model=List[str])
def get_cert_types(country_code: str):
    """Obtener los tipos de certificación válidos para un país."""
    return CERT_TYPES_BY_COUNTRY.get(country_code.upper(), [])