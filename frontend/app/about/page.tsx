import React from "react";
import Link from "next/link";
import { 
  Satellite, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  GitBranch, 
  ArrowRight, 
  CheckCircle2, 
  Terminal,
  Code2,
  Database,
  Eye,
  Sparkles
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-5xl space-y-8">
      {/* Title Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-mono font-semibold text-teal-700 dark:text-teal-300">
          <Satellite className="h-3.5 w-3.5" />
          <span>Smart India Hackathon 2026 &bull; Problem Statement SIH26167</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          SatQuery AI Architecture & Specifications
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
          An interactive vision-language assistant for multimodal remote sensing image analysis through natural language text queries. Built to turn complex satellite rasters into actionable, explainable intelligence without generic chatbot hallucinations.
        </p>
      </div>

      {/* Problem Statement Card */}
      <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-card via-card to-teal-500/5 p-6 space-y-3 shadow-soft">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          SIH 2026 Problem Statement: SIH26167
        </h2>
        <div className="text-xs text-foreground/90 space-y-2 leading-relaxed">
          <p>
            <strong>Title:</strong> SatQuery AI – An Interactive Vision-Language Assistant for Multimodal Remote Sensing Image Analysis through Text Queries.
          </p>
          <p className="text-muted-foreground">
            <strong>Core Mission:</strong> Remote sensing imagery (Optical, Multispectral, SAR Radar) holds immense value for disaster response, agriculture, urban planning, and environmental surveillance. However, conventional GIS software requires complex manual workflows. SatQuery AI bridges this gap with an Agentic Vision-Language Architecture that interprets human language, selects the appropriate specialized remote sensing pipeline, and generates visual evidence with verified scientific metrics.
          </p>
        </div>
      </div>

      {/* Agentic Pipeline Diagram */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-soft">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          End-to-End Agentic Execution Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2 text-xs font-mono">
          <div className="rounded-xl border border-border bg-secondary/40 p-3.5 space-y-1.5 shadow-sm">
            <span className="text-teal-600 dark:text-teal-400 font-bold block text-[10px]">STEP 1: INGEST</span>
            <p className="text-foreground font-bold">Query & Rasters</p>
            <p className="text-[11px] text-muted-foreground font-sans">Optical, SAR, Multispectral, or temporal pairs.</p>
          </div>

          <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-3.5 space-y-1.5 shadow-sm">
            <span className="text-cyan-600 dark:text-cyan-400 font-bold block text-[10px]">STEP 2: ROUTE</span>
            <p className="text-foreground font-bold">Agent Router</p>
            <p className="text-[11px] text-muted-foreground font-sans">Task classifier routes query intent to specialized tool.</p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1.5 shadow-sm">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-[10px]">STEP 3: EXECUTE</span>
            <p className="text-foreground font-bold">Tool Registry</p>
            <p className="text-[11px] text-muted-foreground font-sans">SSIM, Otsu thresholding, HSV fusion, or deep models.</p>
          </div>

          <div className="rounded-xl border border-border bg-secondary/40 p-3.5 space-y-1.5 shadow-sm">
            <span className="text-amber-600 dark:text-amber-400 font-bold block text-[10px]">STEP 4: EVIDENCE</span>
            <p className="text-foreground font-bold">Visual Overlays</p>
            <p className="text-[11px] text-muted-foreground font-sans">Difference maps, spectral heatmaps, and bounding boxes.</p>
          </div>

          <div className="rounded-xl border border-border bg-secondary/40 p-3.5 space-y-1.5 shadow-sm">
            <span className="text-purple-600 dark:text-purple-400 font-bold block text-[10px]">STEP 5: DOSSIER</span>
            <p className="text-foreground font-bold">PDF Report</p>
            <p className="text-[11px] text-muted-foreground font-sans">Structured natural language synthesis with telemetry.</p>
          </div>
        </div>
      </div>

      {/* Specialized Tools Matrix */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Layers className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          Specialized Remote Sensing Analytical Tools
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2 shadow-soft">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <h3 className="font-bold text-foreground">ChangeDetectionAnalyzer</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Co-registration alignment, Structural Similarity Index (SSIM) dissimilarity maps, absolute radiometric differencing, Otsu adaptive thresholding, and morphological cluster classification (urban, vegetation loss, vegetation gain).
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2 shadow-soft">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              <h3 className="font-bold text-foreground">OpticalSARAnalyzer</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Speckle reduction (Lee-proxy bilateral filtering), dynamic log-scale calibration, backscatter signature extraction (specular water vs double-bounce urban), and HSV cross-modality color fusion.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2 shadow-soft">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-foreground">SingleImageAnalyzer</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Radiometric band statistics, dynamic range profiling, Visible Atmospherically Resistant Index (VARI) green biomass calculation, and Sobel/Canny structural edge density analysis.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2 shadow-soft">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              <h3 className="font-bold text-foreground">VQA & Localization Analyzer</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Spatial query parsing, target feature grounding, spatial contour bounding boxes with pixel coordinates, attention heatmaps, and factual question answering.
            </p>
          </div>
        </div>
      </div>

      {/* Model Adapter Architecture */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-soft">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Code2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          Model Adapter Extension Architecture
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The backend implements an abstract <code className="text-teal-600 dark:text-teal-400 font-mono font-bold">AnalysisTool</code> interface. This allows seamless plug-and-play integration of pretrained remote-sensing deep neural networks (e.g. ChangeFormer for bi-temporal segmentation, CLIP-RS / RemoteCLIP for zero-shot VQA, SAM-RS for foundation model segmentation):
        </p>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 font-mono text-[11px] text-slate-200 overflow-x-auto shadow-inner">
          <pre>{`class DeepLearningChangeDetectionAdapter(AnalysisTool):
    name = "ChangeFormer_V2"
    is_baseline = False

    def can_handle(self, task_type: str) -> bool:
        return task_type == "CHANGE_DETECTION"

    def execute(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Forward pass through PyTorch Transformer weights
        # 2. Output high-resolution semantic change mask
        # 3. Compute verified statistical confidence
        return { ... }`}</pre>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-soft">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Cpu className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          Production Technology Stack
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px]">FRONTEND</span>
            <p className="font-bold text-foreground">Next.js 14+ (App Router)</p>
            <p className="text-muted-foreground font-sans text-[11px]">React 18, TypeScript, Tailwind, Framer Motion</p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px]">BACKEND</span>
            <p className="font-bold text-foreground">FastAPI & Python 3.9+</p>
            <p className="text-muted-foreground font-sans text-[11px]">Pydantic, Uvicorn, SQLite</p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px]">COMPUTER VISION</span>
            <p className="font-bold text-foreground">OpenCV, NumPy, Scipy</p>
            <p className="text-muted-foreground font-sans text-[11px]">Scikit-Image, Pillow, Matplotlib</p>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px]">REPORTING & DEPLOY</span>
            <p className="font-bold text-foreground">ReportLab & Docker</p>
            <p className="text-muted-foreground font-sans text-[11px]">Docker Compose, Multi-stage builds</p>
          </div>
        </div>
      </div>
    </div>
  );
}
