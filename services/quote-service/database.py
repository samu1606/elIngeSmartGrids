"""Database connection for quote-service using Supabase REST API."""

import sys
from pathlib import Path

# Add shared module to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "shared"))

from shared.supabase_client import SupabaseClient, get_supabase_client
from shared.config import get_settings


def get_db() -> SupabaseClient:
    """Get the Supabase client instance."""
    return get_supabase_client()