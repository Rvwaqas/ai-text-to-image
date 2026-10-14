from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ai_horde_api_key: str = "0000000000"
    ai_horde_base_url: str = "https://aihorde.net/api/v2"
    client_agent: str = "ai-image-studio:1.0:user@example.com"
    default_model: str = "stable_diffusion"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
