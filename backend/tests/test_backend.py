import pytest
import os
from pathlib import Path
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.core.config import settings

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "capabilities" in data

def test_samples_endpoint():
    response = client.get("/api/samples")
    assert response.status_code == 200
    data = response.json()
    assert "presets" in data
    assert len(data["presets"]) >= 3

def test_load_sample_and_change_detection():
    # Load urban expansion sample
    load_resp = client.post("/api/samples/load/urban_expansion")
    assert load_resp.status_code == 200
    load_data = load_resp.json()
    
    primary_id = load_data["primary_image"]["id"]
    secondary_id = load_data["secondary_image"]["id"]
    assert primary_id is not None
    assert secondary_id is not None

    # Run Change Detection Query
    req_body = {
        "query": "What changed between these before and after satellite images?",
        "primary_image_id": primary_id,
        "secondary_image_id": secondary_id
    }
    analyze_resp = client.post("/api/analyze", json=req_body)
    assert analyze_resp.status_code == 200
    result = analyze_resp.json()
    
    assert result["task_type"] == "CHANGE_DETECTION"
    assert result["is_baseline"] is True
    assert len(result["visual_evidences"]) >= 2
    assert "statistics" in result
    assert result["confidence"] is not None
    assert result["confidence"] > 0.5
    assert len(result["key_findings"]) >= 3

    # Verify Report Generation
    analysis_id = result["id"]
    report_resp = client.get(f"/api/analyses/{analysis_id}/report")
    assert report_resp.status_code == 200
    assert report_resp.headers["content-type"] == "application/pdf"

def test_single_image_and_vqa():
    # Load agriculture sample
    load_resp = client.post("/api/samples/load/agriculture_canopy")
    assert load_resp.status_code == 200
    load_data = load_resp.json()
    primary_id = load_data["primary_image"]["id"]

    # Run VQA Query
    req_body = {
        "query": "How much vegetation is visible in this satellite scene?",
        "primary_image_id": primary_id
    }
    analyze_resp = client.post("/api/analyze", json=req_body)
    assert analyze_resp.status_code == 200
    result = analyze_resp.json()
    
    assert result["task_type"] in ["VISUAL_QUESTION_ANSWERING", "SINGLE_IMAGE_ANALYSIS"]
    assert "vegetation" in result["natural_language_answer"].lower()
    assert len(result["visual_evidences"]) >= 1

def test_optical_sar_fusion():
    # Load harbor optical + SAR sample
    load_resp = client.post("/api/samples/load/coastal_harbor_sar")
    assert load_resp.status_code == 200
    load_data = load_resp.json()
    primary_id = load_data["primary_image"]["id"]
    secondary_id = load_data["secondary_image"]["id"]

    req_body = {
        "query": "Analyze optical and SAR radar imagery together for harbor ships",
        "primary_image_id": primary_id,
        "secondary_image_id": secondary_id
    }
    analyze_resp = client.post("/api/analyze", json=req_body)
    assert analyze_resp.status_code == 200
    result = analyze_resp.json()
    
    assert result["task_type"] == "OPTICAL_SAR_ANALYSIS"
    assert "fusion" in result["natural_language_answer"].lower() or "sar" in result["natural_language_answer"].lower()
    assert len(result["visual_evidences"]) >= 2
