import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.core.database import engine, Base
from backend.app.api.endpoints import router as api_router
from backend.app.utils.sample_generator import generate_sample_datasets

# Initialize DB tables
Base.metadata.create_all(bind=engine)

# Pre-generate sample datasets
try:
    generate_sample_datasets()
except Exception as e:
    print(f"Sample generation notice: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Interactive Vision-Language Assistant for Multimodal Remote Sensing Image Analysis (SIH 2026 PS SIH26167)",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router FIRST
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Mount static file endpoints for direct visual preview
app.mount("/static/uploads", StaticFiles(directory=str(settings.UPLOADS_DIR)), name="uploads")
app.mount("/static/outputs", StaticFiles(directory=str(settings.OUTPUTS_DIR)), name="outputs")
app.mount("/static/samples", StaticFiles(directory=str(settings.SAMPLES_DIR)), name="samples")
app.mount("/reports", StaticFiles(directory=str(settings.REPORTS_DIR)), name="reports")

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "tagline": "Ask. Analyze. Understand Earth from Space.",
        "problem_statement": "SIH 2026 SIH26167: Interactive Vision-Language Assistant for Multimodal Remote Sensing Image Analysis",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
