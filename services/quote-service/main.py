"""
Quote Service — Servicio #2: Presupuesto + Cotización con Proveedores
El Inge Smart Grids — Microservicio FastAPI

Endpoints:
  /api/quotes        - CRUD de presupuestos
  /api/materials     - CRUD de materiales
  /api/suppliers     - CRUD de proveedores
  /api/supplier-quotes - Cotizaciones de proveedores
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os, sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from routers import quotes, materials, suppliers

app = FastAPI(
    title="Smart Grids — Quote Service",
    description="Presupuesto + Cotización con Proveedores",
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

app.include_router(quotes.router, prefix="/api/quotes", tags=["quotes"])
app.include_router(materials.router, prefix="/api/materials", tags=["materials"])
app.include_router(suppliers.router, prefix="/api/suppliers", tags=["suppliers"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "quote-service", "version": "1.0.0"}

@app.get("/")
def root():
    return {"service": "quote-service", "docs": "/docs"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8006)))