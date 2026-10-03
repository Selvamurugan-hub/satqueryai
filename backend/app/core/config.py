import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
OUTPUTS_DIR = DATA_DIR / "outputs"
SAMPLES_DIR = DATA_DIR / "samples"
REPORTS_DIR = BASE_DIR / "reports"

for path in [UPLOADS_DIR, OUTPUTS_DIR, SAMPLES_DIR, REPORTS_DIR]:
    path.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "SatQuery AI"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Storage settings
    BASE_DIR: Path = BASE_DIR
    DATA_DIR: Path = DATA_DIR
    UPLOADS_DIR: Path = UPLOADS_DIR
    OUTPUTS_DIR: Path = OUTPUTS_DIR
    SAMPLES_DIR: Path = SAMPLES_DIR
    REPORTS_DIR: Path = REPORTS_DIR
    
    # SQLite Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'satquery.db'}"
    
    # Security & Upload constraints
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: set = {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".geotiff"}
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

    class Config:
        case_sensitive = True

settings = Settings()
