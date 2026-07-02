from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import calculos, health, presupuestos, retie

app = FastAPI(
    title="El Inge - Smart Grids API",
    description="Backend de cálculos eléctricos NTC 2050 / RETIE",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(calculos.router, prefix="/api/calculos", tags=["Cálculos"])
app.include_router(presupuestos.router, prefix="/api/presupuestos", tags=["Presupuestos"])
app.include_router(retie.router, prefix="/api/retie", tags=["RETIE 2024"])
