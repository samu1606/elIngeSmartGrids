"""Shared configuration for all microservices."""

import os
from functools import lru_cache


class Settings:
    """Application settings loaded from environment variables."""

    SUPABASE_URL: str = os.getenv(
        "SUPABASE_URL",
        "https://ziwwfjpiegkxpflfpmxs.supabase.co",
    )
    SUPABASE_SERVICE_KEY: str = os.getenv(
        "SUPABASE_SERVICE_KEY",
        "",
    )
    SUPABASE_ANON_KEY: str = os.getenv(
        "SUPABASE_ANON_KEY",
        "",
    )
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "",
    )
    API_V1_PREFIX: str = "/api"
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "El Inge Smart Grids")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    @property
    def supabase_headers(self) -> dict:
        """Headers for Supabase REST API calls."""
        return {
            "apikey": self.SUPABASE_SERVICE_KEY or self.SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {self.SUPABASE_SERVICE_KEY or self.SUPABASE_ANON_KEY}",
            "Content-Type": "application/json",
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()