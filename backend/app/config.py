from pydantic_settings import BaseSettings
from pathlib import Path
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "SagarMitra Marine Intelligence API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # LLM Settings
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # Bhashini / Regional Voice
    BHASHINI_USER_ID: str = ""
    BHASHINI_API_KEY: str = ""
    BHASHINI_PIPELINE_ID: str = ""
    
    # Base Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = Path(__file__).resolve().parent / "data"
    CACHE_DIR: Path = Path(__file__).resolve().parent / "data" / "cache"
    GEO_DIR: Path = Path(__file__).resolve().parent / "data" / "geo"
    DEMO_DIR: Path = Path(__file__).resolve().parent / "data" / "demo"
    I18N_DIR: Path = Path(__file__).resolve().parent / "i18n"
    
    # Analytics Thresholds (Safety Matrix)
    WAVE_NO_GO_THRESHOLD_M: float = 2.5
    WAVE_CAUTION_THRESHOLD_M: float = 1.5
    WIND_NO_GO_THRESHOLD_KMH: float = 45.0  # ~25 knots (IMD Fisherman Warning)
    WIND_CAUTION_THRESHOLD_KMH: float = 25.0
    SWELL_SURGE_PERIOD_S: float = 14.0
    SWELL_SURGE_HEIGHT_M: float = 1.0
    
    # Geofence Tiers (Nautical Miles)
    GEOFENCE_ADVISORY_NM: float = 10.0
    GEOFENCE_ALERT_NM: float = 5.0
    GEOFENCE_CRITICAL_NM: float = 2.0
    
    # Scenario Mode
    ENABLE_SCENARIO_MODE: bool = False

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
