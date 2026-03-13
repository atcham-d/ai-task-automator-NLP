"""Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Global application settings, read from .env file."""

    # Supabase
    SUPABASE_URL: str = "https://wfoyhhmwjjgqrjaeqqzn.supabase.co"
    SUPABASE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmb3locG13ampncXJqYWVxcXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MzY3MjgsImV4cCI6MjA1ODEzMjcyOH0.80h6h55046233523035123023023023023023023"
    SUPABASE_JWT_SECRET: str = "9gff6rRDTbQF9gW3Ci4Hmkf4DrBwAkMrDwTmG3vUfvTbL/9BowCA61m5vMiMVY1CVJ4xbnV5+LXdeRlThPt9Ag=="

    # JWT
    SECRET_KEY: str = "2706306f1bdbb7a35f5a9b9a7bb015645ceda841769e4a002ddde4be62d89c94"
    ENCRYPTION_KEY: str = "placeholder_key_if_not_in_env"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS — stored as comma-separated string, accessed via .cors_origins
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    
    # Development Bypass
    ENABLE_AUTH_BYPASS: bool = False

    @property
    def cors_origins(self) -> list[str]:
        """Return ALLOWED_ORIGINS as a list, splitting on commas."""
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
