from functools import lru_cache
from typing import Any

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "NHỊP VIỆN API"
    app_version: str = "0.1.0"
    app_env: str = "development"
    docs_enabled: bool = True
    demo_simulation_enabled: bool = True
    database_url: str = "sqlite:///./nhip_vien.db"
    ai_service_url: str = "http://localhost:8010"
    ai_request_timeout_seconds: float = Field(default=5.0, gt=0, le=30)
    cors_origins: Any = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            import json
            # Try parsing as JSON first
            try:
                decoded = json.loads(v)
                if isinstance(decoded, list):
                    return [str(item).strip() for item in decoded]
            except Exception:
                pass
            # Try splitting by semicolon first (to avoid Cloud Run comma-split issues)
            if ";" in v:
                return [origin.strip() for origin in v.split(";") if origin.strip()]
            # Fallback to comma or space
            for sep in (",", " "):
                if sep in v:
                    return [origin.strip() for origin in v.split(sep) if origin.strip()]
            return [v.strip()]
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()
