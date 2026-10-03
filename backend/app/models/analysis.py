import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, JSON
from backend.app.core.database import Base

class ImageAsset(Base):
    __tablename__ = "image_assets"

    id = Column(String(36), primary_key=True, index=True)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    channels = Column(Integer, nullable=True)
    modality = Column(String(50), default="OPTICAL")  # OPTICAL, SAR, MULTISPECTRAL
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(String(36), primary_key=True, index=True)
    task_type = Column(String(50), index=True, nullable=False)
    user_query = Column(Text, nullable=True)
    primary_image_id = Column(String(36), nullable=False)
    secondary_image_id = Column(String(36), nullable=True)
    status = Column(String(50), default="COMPLETED")
    
    # Results
    summary_text = Column(Text, nullable=False)
    findings = Column(JSON, default=list)
    confidence = Column(Float, nullable=True)
    confidence_rationale = Column(String(255), nullable=True)
    is_baseline = Column(Integer, default=1)  # 1 for baseline, 0 for deep learning model
    
    # Metadata & outputs
    visual_evidence = Column(JSON, default=dict)
    execution_summary = Column(JSON, default=dict)
    statistics = Column(JSON, default=dict)
    
    # Report
    report_path = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
