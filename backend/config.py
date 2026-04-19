from pydantic_settings import BaseSettings, SettingsConfigDict


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
    frontend_url: str = "http://localhost:5173"

    # File upload limits
    max_upload_size_mb: int = 10

    # Tutor rate limit
    tutor_requests_per_minute: int = 5


settings = Settings()
