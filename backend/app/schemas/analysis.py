from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class ImageMetadata(BaseModel):
    id: str
    filename: str
    width: int
    height: int
    channels: int
    file_size_bytes: int
    modality: str = "OPTICAL"
    url: str

class UploadResponse(BaseModel):
    image: ImageMetadata
    message: str

class VisualEvidenceItem(BaseModel):
    title: str
    description: str
    image_url: str
    layer_type: str  # overlay, difference_map, mask, heatmap, contours, false_color
    metadata: Optional[Dict[str, Any]] = None

class BoundingBox(BaseModel):
    label: str
    confidence: Optional[float] = None
    box: List[int] = Field(..., description="[xmin, ymin, xmax, ymax]")
    area_pixels: Optional[int] = None

class ExecutionSummary(BaseModel):
    task: str
    tools_invoked: List[str]
    parameters: Dict[str, Any]
    execution_time_seconds: float
    is_demo_mode: bool = True
    hardware_accelerator: str = "CPU (NumPy/OpenCV Engine)"

class AnalysisRequest(BaseModel):
    query: str
    primary_image_id: str
    secondary_image_id: Optional[str] = None
    task_override: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

class AnalysisResponse(BaseModel):
    id: str
    task_type: str
    user_query: Optional[str] = None
    natural_language_answer: str
    confidence: Optional[float] = None
    confidence_label: str
    confidence_rationale: str
    is_baseline: bool = True
    key_findings: List[str] = []
    visual_evidences: List[VisualEvidenceItem] = []
    bounding_boxes: Optional[List[BoundingBox]] = None
    statistics: Dict[str, Any] = {}
    execution_summary: ExecutionSummary
    primary_image: ImageMetadata
    secondary_image: Optional[ImageMetadata] = None
    report_url: Optional[str] = None
    created_at: datetime

class HistoryItem(BaseModel):
    id: str
    task_type: str
    user_query: Optional[str]
    natural_language_answer: str
    confidence: Optional[float]
    is_baseline: bool
    created_at: datetime
    execution_time_seconds: float
    primary_image_id: str
    primary_image_filename: str

class DashboardStats(BaseModel):
    total_analyses: int
    images_processed: int
    change_detections: int
    optical_sar_fusions: int
    vqa_queries: int
    avg_processing_time: float
    recent_analyses: List[HistoryItem]
    supported_tasks: List[str]
