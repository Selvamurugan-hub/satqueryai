import os
import uuid
import datetime
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import cv2
from PIL import Image

from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.models.analysis import ImageAsset, AnalysisRecord
from backend.app.schemas.analysis import (
    UploadResponse, ImageMetadata, AnalysisRequest, AnalysisResponse,
    HistoryItem, DashboardStats, VisualEvidenceItem, BoundingBox, ExecutionSummary
)
from backend.app.agents.controller import agent_controller
from backend.app.services.pdf_report import generate_pdf_report
from backend.app.utils.sample_generator import generate_sample_datasets

router = APIRouter()

def _save_and_inspect_image(file_bytes: bytes, original_filename: str, modality: str = "OPTICAL", db: Session = None) -> ImageAsset:
    ext = Path(original_filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    if len(file_bytes) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    asset_id = str(uuid.uuid4())
    safe_filename = f"{asset_id}{ext}"
    file_path = settings.UPLOADS_DIR / safe_filename

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Inspect image with OpenCV / PIL
    w, h, channels = 0, 0, 3
    try:
        img = cv2.imread(str(file_path), cv2.IMREAD_UNCHANGED)
        if img is not None:
            h, w = img.shape[:2]
            channels = 1 if len(img.shape) == 2 else img.shape[2]
        else:
            pil_img = Image.open(file_path)
            w, h = pil_img.size
            channels = len(pil_img.getbands())
    except Exception:
        pass

    asset = ImageAsset(
        id=asset_id,
        original_filename=original_filename,
        file_path=str(file_path),
        file_type=ext.replace(".", "").upper(),
        file_size_bytes=len(file_bytes),
        width=w,
        height=h,
        channels=channels,
        modality=modality.upper()
    )
    if db:
        db.add(asset)
        db.commit()
        db.refresh(asset)
    return asset

@router.post("/upload", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    modality: str = Form("OPTICAL"),
    db: Session = Depends(get_db)
):
    """Upload a satellite/remote sensing image (Optical, SAR, Multispectral)."""
    try:
        content = await file.read()
        asset = _save_and_inspect_image(content, file.filename, modality, db)
        return UploadResponse(
            image=ImageMetadata(
                id=asset.id,
                filename=asset.original_filename,
                width=asset.width or 0,
                height=asset.height or 0,
                channels=asset.channels or 3,
                file_size_bytes=asset.file_size_bytes,
                modality=asset.modality,
                url=f"/static/uploads/{Path(asset.file_path).name}"
            ),
            message="Satellite image uploaded and profiled successfully."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process upload: {str(e)}")

@router.get("/samples")
def get_sample_presets():
    """Retrieve pre-generated satellite demonstration datasets."""
    samples = generate_sample_datasets()
    return {
        "presets": [
            {
                "key": "urban_expansion",
                "title": samples["urban_expansion"]["title"],
                "task": samples["urban_expansion"]["task"],
                "description": "Bi-temporal Landsat/Sentinel-2 simulation showing 4-year industrial and infrastructure development.",
                "sample_query": samples["urban_expansion"]["sample_query"],
                "requires_secondary": True,
                "badge": "Change Detection"
            },
            {
                "key": "agriculture_canopy",
                "title": samples["agriculture_canopy"]["title"],
                "task": samples["agriculture_canopy"]["task"],
                "description": "Multispectral agricultural parcels with circular irrigation pivot and vegetation indices.",
                "sample_query": samples["agriculture_canopy"]["sample_query"],
                "requires_secondary": False,
                "badge": "Spectral & NDVI"
            },
            {
                "key": "coastal_harbor_sar",
                "title": samples["coastal_harbor_sar"]["title"],
                "task": samples["coastal_harbor_sar"]["task"],
                "description": "Optical high-resolution harbor paired with SAR microwave radar backscatter for ship detection.",
                "sample_query": samples["coastal_harbor_sar"]["sample_query"],
                "requires_secondary": True,
                "badge": "Optical + SAR"
            },
            {
                "key": "deforestation",
                "title": samples["deforestation"]["title"],
                "task": samples["deforestation"]["task"],
                "description": "Rainforest canopy monitoring identifying fishbone logging tracks and forest clearings.",
                "sample_query": samples["deforestation"]["sample_query"],
                "requires_secondary": True,
                "badge": "Deforestation"
            },
            {
                "key": "disaster_flood",
                "title": samples["disaster_flood"]["title"],
                "task": samples["disaster_flood"]["task"],
                "description": "Post-monsoon flood inundation mapping across agricultural river basins.",
                "sample_query": samples["disaster_flood"]["sample_query"],
                "requires_secondary": True,
                "badge": "Disaster Response"
            },
            {
                "key": "custom",
                "title": "Custom Analysis",
                "task": "GENERAL_IMAGE_ANALYSIS",
                "description": "Upload your own GeoTIFF or high-resolution rasters for arbitrary vision-language querying.",
                "sample_query": "Analyze this satellite scene and summarize key land features.",
                "requires_secondary": False,
                "badge": "Custom Upload"
            }
        ]
    }

@router.post("/samples/load/{sample_key}")
def load_sample_dataset(sample_key: str, db: Session = Depends(get_db)):
    """Load sample preset into database assets and return their asset IDs."""
    if sample_key == "custom":
        return {
            "sample_key": "custom",
            "sample_query": "Analyze this satellite scene and summarize key land features.",
            "task": "GENERAL_IMAGE_ANALYSIS",
            "primary_image": None,
            "secondary_image": None
        }

    samples = generate_sample_datasets()
    if sample_key not in samples:
        raise HTTPException(status_code=404, detail=f"Sample '{sample_key}' not found.")

    preset = samples[sample_key]
    primary_asset = None
    secondary_asset = None

    if sample_key == "urban_expansion":
        with open(preset["before"], "rb") as f:
            primary_asset = _save_and_inspect_image(f.read(), "urban_expansion_2020_before.png", "OPTICAL", db)
        with open(preset["after"], "rb") as f:
            secondary_asset = _save_and_inspect_image(f.read(), "urban_expansion_2024_after.png", "OPTICAL", db)

    elif sample_key == "agriculture_canopy":
        with open(preset["primary"], "rb") as f:
            primary_asset = _save_and_inspect_image(f.read(), "agriculture_canopy_sentinel2.png", "MULTISPECTRAL", db)

    elif sample_key == "coastal_harbor_sar":
        with open(preset["optical"], "rb") as f:
            primary_asset = _save_and_inspect_image(f.read(), "harbor_optical_rgb.png", "OPTICAL", db)
        with open(preset["sar"], "rb") as f:
            secondary_asset = _save_and_inspect_image(f.read(), "harbor_sar_sentinel1_backscatter.png", "SAR", db)

    elif sample_key == "deforestation":
        with open(preset["before"], "rb") as f:
            primary_asset = _save_and_inspect_image(f.read(), "rainforest_pristine_2021_t1.png", "OPTICAL", db)
        with open(preset["after"], "rb") as f:
            secondary_asset = _save_and_inspect_image(f.read(), "rainforest_logging_2024_t2.png", "OPTICAL", db)

    elif sample_key == "disaster_flood":
        with open(preset["before"], "rb") as f:
            primary_asset = _save_and_inspect_image(f.read(), "river_basin_pre_flood_t1.png", "OPTICAL", db)
        with open(preset["after"], "rb") as f:
            secondary_asset = _save_and_inspect_image(f.read(), "river_basin_inundated_t2.png", "OPTICAL", db)

    return {
        "sample_key": sample_key,
        "sample_query": preset["sample_query"],
        "task": preset["task"],
        "primary_image": ImageMetadata(
            id=primary_asset.id,
            filename=primary_asset.original_filename,
            width=primary_asset.width or 0,
            height=primary_asset.height or 0,
            channels=primary_asset.channels or 3,
            file_size_bytes=primary_asset.file_size_bytes,
            modality=primary_asset.modality,
            url=f"/static/uploads/{Path(primary_asset.file_path).name}"
        ) if primary_asset else None,
        "secondary_image": ImageMetadata(
            id=secondary_asset.id,
            filename=secondary_asset.original_filename,
            width=secondary_asset.width or 0,
            height=secondary_asset.height or 0,
            channels=secondary_asset.channels or 3,
            file_size_bytes=secondary_asset.file_size_bytes,
            modality=secondary_asset.modality,
            url=f"/static/uploads/{Path(secondary_asset.file_path).name}"
        ) if secondary_asset else None
    }

@router.post("/analyze", response_model=AnalysisResponse)
def analyze_satellite_query(
    request: AnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Central AI Agent Vision-Language Remote Sensing Query Endpoint.
    Routes natural language query + satellite raster(s) through Agent Controller.
    """
    primary_asset = db.query(ImageAsset).filter(ImageAsset.id == request.primary_image_id).first()
    if not primary_asset:
        raise HTTPException(status_code=404, detail="Primary image asset not found.")

    secondary_asset = None
    if request.secondary_image_id:
        secondary_asset = db.query(ImageAsset).filter(ImageAsset.id == request.secondary_image_id).first()

    try:
        raw_result = agent_controller.process_query(
            query=request.query,
            primary_image_path=primary_asset.file_path,
            secondary_image_path=secondary_asset.file_path if secondary_asset else None,
            secondary_modality=secondary_asset.modality if secondary_asset else None,
            task_override=request.task_override,
            parameters=request.parameters
        )

        analysis_id = str(uuid.uuid4())
        
        record = AnalysisRecord(
            id=analysis_id,
            task_type=raw_result["task_type"],
            user_query=request.query,
            primary_image_id=primary_asset.id,
            secondary_image_id=secondary_asset.id if secondary_asset else None,
            status="COMPLETED",
            summary_text=raw_result["natural_language_answer"],
            findings=raw_result["key_findings"],
            confidence=raw_result.get("confidence"),
            confidence_rationale=raw_result.get("confidence_rationale"),
            is_baseline=1 if raw_result.get("is_baseline", True) else 0,
            visual_evidence=raw_result.get("visual_evidences", []),
            execution_summary=raw_result.get("execution_summary", {}),
            statistics=raw_result.get("statistics", {})
        )
        db.add(record)
        db.commit()

        visual_items = [
            VisualEvidenceItem(**ev) for ev in raw_result.get("visual_evidences", [])
        ]
        
        bboxes = [
            BoundingBox(**b) for b in raw_result.get("bounding_boxes", [])
        ] if raw_result.get("bounding_boxes") else None

        exec_summary = ExecutionSummary(**raw_result["execution_summary"])

        return AnalysisResponse(
            id=analysis_id,
            task_type=raw_result["task_type"],
            user_query=request.query,
            natural_language_answer=raw_result["natural_language_answer"],
            confidence=raw_result.get("confidence"),
            confidence_label=raw_result.get("confidence_label", "Baseline Metric"),
            confidence_rationale=raw_result.get("confidence_rationale", "Mathematical signal calculation"),
            is_baseline=raw_result.get("is_baseline", True),
            key_findings=raw_result.get("key_findings", []),
            visual_evidences=visual_items,
            bounding_boxes=bboxes,
            statistics=raw_result.get("statistics", {}),
            execution_summary=exec_summary,
            primary_image=ImageMetadata(
                id=primary_asset.id,
                filename=primary_asset.original_filename,
                width=primary_asset.width or 0,
                height=primary_asset.height or 0,
                channels=primary_asset.channels or 3,
                file_size_bytes=primary_asset.file_size_bytes,
                modality=primary_asset.modality,
                url=f"/static/uploads/{Path(primary_asset.file_path).name}"
            ),
            secondary_image=ImageMetadata(
                id=secondary_asset.id,
                filename=secondary_asset.original_filename,
                width=secondary_asset.width or 0,
                height=secondary_asset.height or 0,
                channels=secondary_asset.channels or 3,
                file_size_bytes=secondary_asset.file_size_bytes,
                modality=secondary_asset.modality,
                url=f"/static/uploads/{Path(secondary_asset.file_path).name}"
            ) if secondary_asset else None,
            report_url=f"/api/analyses/{analysis_id}/report",
            created_at=datetime.datetime.utcnow()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline error: {str(e)}")

@router.get("/analyses", response_model=List[HistoryItem])
def list_analyses(
    limit: int = Query(50, ge=1, le=200),
    task_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve historical satellite analyses."""
    query = db.query(AnalysisRecord)
    if task_type:
        query = query.filter(AnalysisRecord.task_type == task_type)
    
    records = query.order_by(AnalysisRecord.created_at.desc()).limit(limit).all()
    
    items = []
    for r in records:
        primary = db.query(ImageAsset).filter(ImageAsset.id == r.primary_image_id).first()
        exec_s = r.execution_summary or {}
        items.append(HistoryItem(
            id=r.id,
            task_type=r.task_type,
            user_query=r.user_query,
            natural_language_answer=r.summary_text,
            confidence=r.confidence,
            is_baseline=bool(r.is_baseline),
            created_at=r.created_at,
            execution_time_seconds=exec_s.get("execution_time_seconds", 0.0),
            primary_image_id=r.primary_image_id,
            primary_image_filename=primary.original_filename if primary else "raster.png"
        ))
    return items

@router.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
def get_analysis_detail(analysis_id: str, db: Session = Depends(get_db)):
    """Retrieve complete analysis detail including visual evidences and bounding boxes."""
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    primary_asset = db.query(ImageAsset).filter(ImageAsset.id == record.primary_image_id).first()
    secondary_asset = db.query(ImageAsset).filter(ImageAsset.id == record.secondary_image_id).first() if record.secondary_image_id else None

    visual_items = [
        VisualEvidenceItem(**ev) for ev in (record.visual_evidence or [])
    ]

    exec_s = record.execution_summary or {
        "task": record.task_type,
        "tools_invoked": ["RasterEngine"],
        "parameters": {},
        "execution_time_seconds": 0.5,
        "is_demo_mode": bool(record.is_baseline),
        "hardware_accelerator": "CPU"
    }

    return AnalysisResponse(
        id=record.id,
        task_type=record.task_type,
        user_query=record.user_query,
        natural_language_answer=record.summary_text,
        confidence=record.confidence,
        confidence_label="Calibrated Metric" if record.confidence else "N/A",
        confidence_rationale=record.confidence_rationale or "Empirical calculation",
        is_baseline=bool(record.is_baseline),
        key_findings=record.findings or [],
        visual_evidences=visual_items,
        bounding_boxes=None,
        statistics=record.statistics or {},
        execution_summary=ExecutionSummary(**exec_s),
        primary_image=ImageMetadata(
            id=primary_asset.id,
            filename=primary_asset.original_filename,
            width=primary_asset.width or 0,
            height=primary_asset.height or 0,
            channels=primary_asset.channels or 3,
            file_size_bytes=primary_asset.file_size_bytes,
            modality=primary_asset.modality,
            url=f"/static/uploads/{Path(primary_asset.file_path).name}"
        ) if primary_asset else ImageMetadata(id="", filename="", width=0, height=0, channels=0, file_size_bytes=0, modality="OPTICAL", url=""),
        secondary_image=ImageMetadata(
            id=secondary_asset.id,
            filename=secondary_asset.original_filename,
            width=secondary_asset.width or 0,
            height=secondary_asset.height or 0,
            channels=secondary_asset.channels or 3,
            file_size_bytes=secondary_asset.file_size_bytes,
            modality=secondary_asset.modality,
            url=f"/static/uploads/{Path(secondary_asset.file_path).name}"
        ) if secondary_asset else None,
        report_url=f"/api/analyses/{record.id}/report",
        created_at=record.created_at
    )

@router.delete("/analyses/{analysis_id}")
def delete_analysis(analysis_id: str, db: Session = Depends(get_db)):
    """Delete a single analysis record from history."""
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")
    
    db.delete(record)
    db.commit()
    return {"status": "success", "message": f"Analysis {analysis_id} deleted."}

@router.delete("/analyses")
def clear_all_analyses(db: Session = Depends(get_db)):
    """Clear all analysis records from history."""
    db.query(AnalysisRecord).delete()
    db.commit()
    return {"status": "success", "message": "All analysis history cleared."}

@router.get("/analyses/{analysis_id}/report")
def download_analysis_report(analysis_id: str, db: Session = Depends(get_db)):
    """Generate and return downloadable PDF Report."""
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    primary_asset = db.query(ImageAsset).filter(ImageAsset.id == record.primary_image_id).first()
    secondary_asset = db.query(ImageAsset).filter(ImageAsset.id == record.secondary_image_id).first() if record.secondary_image_id else None

    data = {
        "id": record.id,
        "task_type": record.task_type,
        "user_query": record.user_query,
        "natural_language_answer": record.summary_text,
        "key_findings": record.findings or [],
        "confidence": record.confidence,
        "confidence_label": "Calibrated Metric" if record.confidence else "N/A",
        "confidence_rationale": record.confidence_rationale,
        "is_baseline": bool(record.is_baseline),
        "visual_evidences": record.visual_evidence or [],
        "execution_summary": record.execution_summary or {},
        "created_at": record.created_at.strftime("%Y-%m-%d %H:%M:%S UTC")
    }

    pdf_file_path = generate_pdf_report(
        analysis_data=data,
        primary_img_path=primary_asset.file_path if primary_asset else None,
        secondary_img_path=secondary_asset.file_path if secondary_asset else None
    )

    return FileResponse(
        path=pdf_file_path,
        media_type="application/pdf",
        filename=f"SatQuery_Analysis_Report_{analysis_id[:8]}.pdf"
    )

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Retrieve top-level platform analytics and recent analyses."""
    total_analyses = db.query(AnalysisRecord).count()
    images_processed = db.query(ImageAsset).count()
    change_detections = db.query(AnalysisRecord).filter(AnalysisRecord.task_type == "CHANGE_DETECTION").count()
    optical_sar = db.query(AnalysisRecord).filter(AnalysisRecord.task_type == "OPTICAL_SAR_ANALYSIS").count()
    vqa_queries = db.query(AnalysisRecord).filter(AnalysisRecord.task_type == "VISUAL_QUESTION_ANSWERING").count()

    recent_records = db.query(AnalysisRecord).order_by(AnalysisRecord.created_at.desc()).limit(6).all()
    recent_items = []
    total_time = 0.0
    for r in recent_records:
        primary = db.query(ImageAsset).filter(ImageAsset.id == r.primary_image_id).first()
        exec_s = r.execution_summary or {}
        time_sec = exec_s.get("execution_time_seconds", 0.8)
        total_time += time_sec
        recent_items.append(HistoryItem(
            id=r.id,
            task_type=r.task_type,
            user_query=r.user_query,
            natural_language_answer=r.summary_text,
            confidence=r.confidence,
            is_baseline=bool(r.is_baseline),
            created_at=r.created_at,
            execution_time_seconds=time_sec,
            primary_image_id=r.primary_image_id,
            primary_image_filename=primary.original_filename if primary else "raster.png"
        ))

    avg_time = round(total_time / max(len(recent_records), 1), 2)

    return DashboardStats(
        total_analyses=total_analyses,
        images_processed=images_processed,
        change_detections=change_detections,
        optical_sar_fusions=optical_sar,
        vqa_queries=vqa_queries,
        avg_processing_time=avg_time if avg_time > 0 else 0.45,
        recent_analyses=recent_items,
        supported_tasks=[
            "SINGLE_IMAGE_ANALYSIS",
            "CHANGE_DETECTION",
            "OPTICAL_SAR_ANALYSIS",
            "OBJECT_LOCALIZATION",
            "VISUAL_QUESTION_ANSWERING",
            "GENERAL_IMAGE_ANALYSIS"
        ]
    )

@router.get("/health")
def health_check():
    """System health check and engine capability profile."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": "BASELINE / DEMO MODE (Mathematical Remote Sensing Engine)",
        "capabilities": [
            "Bi-Temporal Change Detection (SSIM + Otsu Morphology)",
            "Optical + SAR Microwave HSV Fusion & Lee Filter",
            "Spectral Indices (VARI, GLI, Water Mask)",
            "Morphological Object Grounding & Bounding Boxes",
            "Visual Question Answering (VQA)",
            "Automated PDF Intelligence Reporting",
            "Deforestation & Flood Inundation Assessment"
        ]
    }

@router.get("/system/status")
def system_status(db: Session = Depends(get_db)):
    """Comprehensive system telemetry for Settings and Dashboard."""
    total_images = db.query(ImageAsset).count()
    total_analyses = db.query(AnalysisRecord).count()
    return {
        "status": "online",
        "version": settings.VERSION,
        "backend_url": "http://127.0.0.1:8000",
        "database": "SQLite (Local File)",
        "database_records": {
            "images": total_images,
            "analyses": total_analyses
        },
        "hardware_engine": "CPU Multiprocessing (NumPy / OpenCV)",
        "model_adapters": {
            "active": "Baseline Calibrated Remote Sensing Engine",
            "ready_for_weights": ["ChangeFormer_V2", "CLIP-RS", "SAM-RS"]
        }
    }
