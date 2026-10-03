# SatQuery AI 🛰️

> **"Ask. Analyze. Understand Earth from Space."**  
> *Production-Quality Full-Stack Web Application for Smart India Hackathon (SIH 2026)*  
> **Problem Statement ID:** `SIH26167` — *"SatQuery AI – An Interactive Vision-Language Assistant for Multimodal Remote Sensing Image Analysis through Text Queries."*

---

## 🌍 1. Overview & Problem Statement

Remote sensing satellites produce gigabytes of optical, multispectral, and Synthetic Aperture Radar (SAR) imagery daily. However, extracting actionable intelligence traditionally requires complex GIS software, domain expertise in radiometric calibration, and manual spatial thresholding.

**SatQuery AI** solves this by providing an **Agentic Vision-Language Remote Sensing Assistant**. Users upload raw satellite rasters and ask questions in natural language. An autonomous **Task Router** classifies user intent, delegates execution to specialized image-processing and computer vision pipelines, produces interactive visual evidence overlays, and generates publication-ready PDF intelligence reports — with **zero hallucinated AI claims** and verifiable scientific metrics.

---

## 🏛️ 2. Architectural Design

```
User Query + Satellite Image(s)
            │
            ▼
┌──────────────────────────────────────────────────────────┐
│              Next.js 14 Scientific Studio                │
│    (Interactive Canvas, Split Slider, Layer Toggles)     │
└───────────────────────────┬──────────────────────────────┘
                            │ REST API
                            ▼
┌──────────────────────────────────────────────────────────┐
│                  FastAPI Backend Gateway                 │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│             Autonomous Agent Controller                  │
│       ┌──────────────────────────────────────────┐       │
│       │ Multimodal Intent & Task Classifier      │       │
│       └────────────────────┬─────────────────────┘       │
│                            │                             │
│       ┌────────────────────▼─────────────────────┐       │
│       │ Specialized Remote Sensing Tool Registry │       │
│       └────┬────────────┬─────────────┬──────────┘       │
└────────────┼────────────┼─────────────┼──────────────────┘
             │            │             │
             ▼            ▼             ▼
┌──────────────────┐┌─────────────┐┌────────────────────────┐
│ Change Detection ││ Optical+SAR ││ Single Image & VQA     │
│ - Registration   ││ - Speckle   ││ - VARI / GLI Index     │
│ - SSIM Dissimilar││   Filter    ││ - Radiometric Histogram│
│ - Otsu Morphology││ - HSV Fusion││ - Attention Heatmaps   │
│ - Shift Cluster  ││ - Backscatt ││ - Bounding Box Ground  │
└────────────┬─────┘└─────┬───────┘└────────────┬───────────┘
             │            │                     │
             └────────────┼─────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│         Visual Evidence & Telemetry Generator            │
│   (Diff Maps, Overlays, Heatmaps, Bounding Boxes, DB)    │
└───────────────────────────┬──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│          ReportLab Automated PDF Report Engine           │
└──────────────────────────────────────────────────────────┘
```

---

## ✨ 3. Core Capabilities & Workflows

### 🔍 A. Autonomous Task Router
- Automatically classifies natural language queries into:
  - `CHANGE_DETECTION`
  - `OPTICAL_SAR_ANALYSIS`
  - `SINGLE_IMAGE_ANALYSIS`
  - `OBJECT_LOCALIZATION`
  - `VISUAL_QUESTION_ANSWERING`
  - `GENERAL_IMAGE_ANALYSIS`

### 🔄 B. Bi-Temporal Change Detection (`ChangeDetectionAnalyzer`)
- **Spatial Alignment:** Feature matching & co-registration.
- **Structural Similarity (SSIM):** Inverted structural dissimilarity heatmaps.
- **Otsu Adaptive Thresholding & Morphology:** Removes high-frequency speckle noise and aggregates 8-connected change clusters.
- **Spectral Shift Categorization:** Differentiates vegetation clearing (red), vegetation expansion (green), and urban/structural ground modifications (amber).
- **Interactive UI:** Split-screen comparison slider with real-time before/after dragging.

### 📡 C. Multimodal Optical + SAR Fusion (`OpticalSARAnalyzer`)
- **Radar Denoising:** Bilateral / Lee-filter equivalent for radar speckle suppression.
- **Backscatter Analysis:** Isolates specular reflection (water bodies) and high double-bounce dielectric returns (metallic hulls, vertical buildings).
- **HSV Multimodal Synthesis:** Fuses optical spectral hue & saturation with all-weather microwave radar roughness (intensity).

### 🌿 D. Single Image Spectral Profiling (`SingleImageAnalyzer`)
- **Radiometric Bands:** R/G/B channel statistics, dynamic range, contrast metrics.
- **Vegetation Indices:** Visible Atmospherically Resistant Index (VARI) & Green Leaf Index (GLI).
- **Edge Density:** Canny & Sobel spatial complexity profiling.
- **Radiometric Histograms:** Channel distribution graphs.

### 🎯 E. Visual Question Answering & Object Grounding (`VQAAnalyzer` & `ObjectLocalizationAnalyzer`)
- Grounding queries for buildings, water bodies, agricultural parcels, roads, and ships.
- Generates pixel-accurate bounding box coordinates `[xmin, ymin, xmax, ymax]`, confidence scores, and query attention heatmaps.

### 📄 F. Automated Intelligence PDF Dossier
- Generates formatted, downloadable PDF intelligence reports via ReportLab containing metadata, executive summaries, side-by-side visual evidence overlays, and execution telemetry.

---

## 🛠️ 4. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Python 3.9+, FastAPI, Pydantic v2, Uvicorn, SQLAlchemy |
| **Computer Vision & GIS** | OpenCV, NumPy, Scikit-Image, Pillow, SciPy, Matplotlib |
| **Document Generation** | ReportLab |
| **Database & Storage** | SQLite (PostgreSQL/PostGIS ready), Local Raster Storage |
| **DevOps & Containers**| Docker, Docker Compose (Multi-stage builds) |

---

## 🚀 5. Quick Start (Local Setup)

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (3.9+)

### Step 1: Clone and Set Up Backend
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server (Runs on port 8000)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend Swagger Docs will be live at `http://127.0.0.1:8000/docs`*

### Step 2: Set Up Frontend
```bash
# Navigate to frontend directory in another terminal
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server (Runs on port 3000)
npm run dev
```
*Frontend Studio will be live at `http://localhost:3000`*

---

## 🐳 6. Running with Docker Compose

To launch the full-stack system with a single command:

```bash
docker compose up --build
```

- **Frontend Application:** `http://localhost:3000`
- **Backend API & Swagger:** `http://localhost:8000/docs`

---

## 🔌 7. REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload Optical/SAR/Multispectral raster (PNG, JPG, TIFF, GeoTIFF) |
| `GET` | `/api/samples` | Retrieve pre-generated satellite demonstration datasets |
| `POST` | `/api/samples/load/{key}` | Load demonstration preset rasters into the studio |
| `POST` | `/api/analyze` | Central vision-language agentic query endpoint |
| `GET` | `/api/analyses` | Paginated analysis audit history with search and filter |
| `GET` | `/api/analyses/{id}` | Complete analysis details, bounding boxes, and overlays |
| `GET` | `/api/analyses/{id}/report` | Download official intelligence PDF report |
| `GET` | `/api/dashboard` | Dashboard platform analytics & recent queries |
| `GET` | `/api/health` | Service health status and engine capability profile |

---

## 🧩 8. Deep Learning Model Adapter Extension

SatQuery AI includes a pluggable `AnalysisTool` interface. To connect pretrained neural network weights (such as ChangeFormer, CLIP-RS, or SAM-RS):

```python
from backend.app.analysis.base import AnalysisTool, tool_registry

class ChangeFormerV2Adapter(AnalysisTool):
    name = "ChangeFormer_V2"
    description = "Transformer-based bi-temporal change segmentation model"
    is_baseline = False

    def can_handle(self, task_type: str) -> bool:
        return task_type == "CHANGE_DETECTION"

    def execute(self, inputs: dict, parameters: dict = None) -> dict:
        # 1. Run inference through PyTorch model
        # 2. Extract semantic change mask
        # 3. Return structured analysis dictionary
        return { ... }

# Register the model adapter
tool_registry.register(ChangeFormerV2Adapter())
```

---

## 🛡️ 9. Scientific Integrity & Zero-Hallucination Policy

- **Transparent Labeling:** Every baseline algorithmic computation is explicitly badged as `BASELINE / DEMO MODE`.
- **Honest Confidence:** Confidence scores are mathematically derived from verified signal-to-noise ratios, SSIM coefficients, and Otsu thresholds — never fabricated.

---

## 📜 10. License & Attribution

Built for **Smart India Hackathon 2026 (SIH 2026)** under Problem Statement **SIH26167**.  
Developed by the SatQuery AI Team.
