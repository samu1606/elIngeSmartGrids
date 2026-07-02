"""Marketplace Service - FastAPI Application.

Servicio #3: Marketplace de Tecnicos
Gestiona tecnicos, certificaciones, trabajos y resenas.
"""

import sys
from pathlib import Path

# Add shared module to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "shared"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import technicians, certifications, jobs, reviews

app = FastAPI(
    title="El Inge Smart Grids - Marketplace Service",
    description="Microservicio de Marketplace de Tecnicos",
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

# Include routers
app.include_router(technicians.router, prefix="/api")
app.include_router(certifications.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "marketplace-service", "version": "1.0.0"}


@app.get("/")
async def root():
    return {
        "service": "marketplace-service",
        "docs": "/docs",
        "endpoints": [
            "/api/technicians",
            "/api/certifications",
            "/api/jobs",
            "/api/reviews",
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
