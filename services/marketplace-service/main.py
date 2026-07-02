"""
Marketplace Service — Servicio #3: Marketplace de Técnicos e Ingenieros
El Inge Smart Grids — Microservicio FastAPI

Endpoints:
  /api/technicians     - Registro y búsqueda de técnicos
  /api/certifications - Verificación de matrículas
  /api/jobs           - Gestión de trabajos/solicitudes
  /api/reviews        - Sistema de reseñas
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn, os, sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from routers import technicians, jobs, reviews, certifications

app = FastAPI(
    title="Smart Grids — Marketplace Service",
    description="Marketplace de Técnicos e Ingenieros",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(technicians.router, prefix="/api/technicians", tags=["technicians"])
app.include_router(certifications.router, prefix="/api/certifications", tags=["certifications"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "marketplace-service", "version": "1.0.0"}

@app.get("/")
def root():
    return {"service": "marketplace-service", "docs": "/docs"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8007)))