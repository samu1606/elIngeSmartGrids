"""Quote Service - FastAPI Application.

Servicio #2: Presupuesto + Cotizacion
Gestiona presupuestos, materiales y proveedores con cotizaciones.
"""

import sys
from pathlib import Path

# Add shared module to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "shared"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import quotes, materials, suppliers

app = FastAPI(
    title="El Inge Smart Grids - Quote Service",
    description="Microservicio de Presupuestos y Cotizaciones",
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
app.include_router(quotes.router, prefix="/api")
app.include_router(materials.router, prefix="/api")
app.include_router(suppliers.router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "quote-service", "version": "1.0.0"}


@app.get("/")
async def root():
    return {
        "service": "quote-service",
        "docs": "/docs",
        "endpoints": [
            "/api/quotes",
            "/api/materials",
            "/api/suppliers",
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
