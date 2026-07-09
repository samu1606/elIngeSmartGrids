import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routers import calculos, health, presupuestos, retie

ENV = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENV == "production"

# Rate limiter: 60 requests/min per IP
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(
    title="El Inge - Smart Grids API",
    description="Backend de cálculos eléctricos NTC 2050 / RETIE",
    version="1.0.0",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS: dominios específicos, NO wildcard
ALLOWED_ORIGINS = [
    "https://elingesmartgrids.cloud",
    "https://www.elingesmartgrids.cloud",
]
if not IS_PRODUCTION:
    ALLOWED_ORIGINS.extend(["http://localhost:3000", "http://localhost:3005"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(calculos.router, prefix="/api/calculos", tags=["Cálculos"])
app.include_router(presupuestos.router, prefix="/api/presupuestos", tags=["Presupuestos"])
app.include_router(retie.router, prefix="/api/retie", tags=["RETIE 2024"])
