"""Shared Supabase REST client for all microservices."""

import httpx
from typing import Any, Optional


class SupabaseClient:
    """Lightweight Supabase REST API client using httpx."""

    def __init__(self, base_url: str, service_key: str, anon_key: str = ""):
        self.base_url = base_url.rstrip("/")
        self.service_key = service_key
        self.anon_key = anon_key or service_key
        self._client = httpx.Client(timeout=30.0)

    def _headers(self, use_service: bool = True) -> dict:
        key = self.service_key if use_service else self.anon_key
        return {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    # ── Generic table operations ──────────────────────────────

    def select(
        self,
        table: str,
        columns: str = "*",
        filters: Optional[dict] = None,
        limit: int = 100,
        offset: int = 0,
        order: Optional[str] = None,
        use_service: bool = True,
    ) -> list[dict[str, Any]]:
        """Select rows from a Supabase table."""
        params: dict[str, Any] = {
            "select": columns,
            "limit": limit,
            "offset": offset,
        }
        if order:
            params["order"] = order
        if filters:
            for key, value in filters.items():
                if isinstance(value, bool):
                    params[key] = "true" if value else "false"
                elif value is not None:
                    params[key] = value
        resp = self._client.get(
            f"{self.base_url}/rest/v1/{table}",
            params=params,
            headers=self._headers(use_service),
        )
        resp.raise_for_status()
        return resp.json()

    def insert(
        self,
        table: str,
        data: dict[str, Any],
        use_service: bool = True,
    ) -> dict[str, Any]:
        """Insert a row and return the created record."""
        resp = self._client.post(
            f"{self.base_url}/rest/v1/{table}",
            json=data,
            headers=self._headers(use_service),
        )
        resp.raise_for_status()
        result = resp.json()
        return result[0] if isinstance(result, list) and result else result

    def update(
        self,
        table: str,
        filters: dict[str, Any],
        data: dict[str, Any],
        use_service: bool = True,
    ) -> list[dict[str, Any]]:
        """Update rows matching filters and return updated records."""
        params = {k: f"eq.{v}" for k, v in filters.items()}
        resp = self._client.patch(
            f"{self.base_url}/rest/v1/{table}",
            params=params,
            json=data,
            headers=self._headers(use_service),
        )
        resp.raise_for_status()
        return resp.json()

    def delete(
        self,
        table: str,
        filters: dict[str, Any],
        use_service: bool = True,
    ) -> list[dict[str, Any]]:
        """Delete rows matching filters and return deleted records."""
        params = {k: f"eq.{v}" for k, v in filters.items()}
        resp = self._client.delete(
            f"{self.base_url}/rest/v1/{table}",
            params=params,
            headers=self._headers(use_service),
        )
        resp.raise_for_status()
        return resp.json()

    def rpc(
        self,
        function: str,
        params: Optional[dict[str, Any]] = None,
        use_service: bool = True,
    ) -> Any:
        """Call a Supabase RPC function."""
        resp = self._client.post(
            f"{self.base_url}/rest/v1/rpc/{function}",
            json=params or {},
            headers=self._headers(use_service),
        )
        resp.raise_for_status()
        return resp.json()

    def close(self):
        self._client.close()


# Singleton factory
_client_instance: Optional[SupabaseClient] = None


def get_supabase_client() -> SupabaseClient:
    global _client_instance
    if _client_instance is None:
        import sys
        from pathlib import Path
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        from config import get_settings
        settings = get_settings()
        _client_instance = SupabaseClient(
            base_url=settings.SUPABASE_URL,
            service_key=settings.SUPABASE_SERVICE_KEY,
            anon_key=settings.SUPABASE_ANON_KEY,
        )
    return _client_instance