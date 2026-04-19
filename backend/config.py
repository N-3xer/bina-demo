from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Database
    database_url: str

    # Auth
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours

    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str

    # AI agents
    gemini_api_key: str =''
    groq_api_key: str

    # CORS
    # Accept a JSON list in env or a comma-separated string (common in env files)
    frontend_urls: list[str] = ["http://localhost:3000"]

    @field_validator("frontend_urls", mode="before")
    def _parse_frontend_urls(cls, v):
        # If the env provides a single comma-separated string, split it.
        if isinstance(v, str):
            return [u.strip() for u in v.split(",") if u.strip()]
        # Otherwise assume it's already a list
        return v

    # File upload limits
    max_upload_size_mb: int = 10

    # Tutor rate limit
    tutor_requests_per_minute: int = 5


settings = Settings()
