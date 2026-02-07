from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Travel Dream Simulator"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    GOOGLE_API_KEY: str = ""
    SERPAPI_API_KEY: str = ""
    GOOGLE_CSE_ID: str = ""
    LOG_LEVEL: str = "INFO"
    OPENWEATHERMAP_API_KEY: str = ""
    CURRENCYLAYER_API_KEY: str = ""
    OPENROUTESERVICE_API_KEY: str = ""
    GOOGLE_PLACES_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
