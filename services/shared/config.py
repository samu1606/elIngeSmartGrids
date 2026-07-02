"""Shared configuration for Smart Grids microservices."""
import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://ziwwfjpiegkxpflfpmxs.supabase.co")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    
    # Service
    SERVICE_NAME: str = os.getenv("SERVICE_NAME", "smartgrids")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")
    
    # CORS
    CORS_ORIGINS: list = ["*"]

    class Config:
        env_file = ".env"

settings = Settings()