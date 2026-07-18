from functools import lru_cache

from pydantic import Field
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
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
