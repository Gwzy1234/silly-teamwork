from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Environment-backed application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Silly Teamwork API"
    environment: Literal["development", "testing", "production"] = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    secret_key: str = "local-development-only-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=30, gt=0)

    database_url: str = (
        "postgresql+asyncpg://silly_teamwork:silly_teamwork@localhost:5432/silly_teamwork"
    )
    db_echo: bool = False

    allowed_origins: list[str] = Field(default_factory=list)
    upload_dir: Path = Path("uploads")
    max_file_size: int = Field(default=20 * 1024 * 1024, gt=0)
    max_upload_size_mb: int = Field(default=20, gt=0)

    deadline_reminders_enabled: bool = True
    deadline_reminder_interval_seconds: int = Field(default=300, gt=0)
    deadline_due_soon_hours: int = Field(default=72, gt=0)

    seed_admin_username: str = "admin"
    seed_admin_password: SecretStr = SecretStr("admin123456")
    seed_admin_nickname: str = "Administrator"
    seed_team_name: str = "Silly Teamwork Development Team"
    seed_invite_code: SecretStr = SecretStr("ST-DEV-2026")


@lru_cache
def get_settings() -> Settings:
    return Settings()
