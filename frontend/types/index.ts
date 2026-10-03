export interface ImageMetadata {
  id: string;
  filename: string;
  width: number;
  height: number;
  channels: number;
  file_size_bytes: number;
  modality: 'OPTICAL' | 'SAR' | 'MULTISPECTRAL';
  url: string;
}

export interface VisualEvidenceItem {
  title: string;
  description: string;
  image_url: string;
  layer_type: 'overlay' | 'difference_map' | 'mask' | 'heatmap' | 'contours' | 'false_color' | 'edges' | 'histogram' | 'bounding_boxes';
  metadata?: Record<string, any>;
}

export interface BoundingBox {
  label: string;
  confidence?: number;
  box: [number, number, number, number]; // [xmin, ymin, xmax, ymax]
  area_pixels?: number;
}

export interface ExecutionSummary {
  task: string;
  tools_invoked: string[];
  parameters: Record<string, any>;
  execution_time_seconds: number;
  is_demo_mode: boolean;
  hardware_accelerator: string;
}

export interface AnalysisResponse {
  id: string;
  task_type: string;
  user_query?: string;
  natural_language_answer: string;
  confidence?: number;
  confidence_label: string;
  confidence_rationale: string;
  is_baseline: boolean;
  key_findings: string[];
  visual_evidences: VisualEvidenceItem[];
  bounding_boxes?: BoundingBox[];
  statistics: Record<string, any>;
  execution_summary: ExecutionSummary;
  primary_image: ImageMetadata;
  secondary_image?: ImageMetadata;
  report_url?: string;
  created_at: string;
}

export interface HistoryItem {
  id: string;
  task_type: string;
  user_query?: string;
  natural_language_answer: string;
  confidence?: number;
  is_baseline: boolean;
  created_at: string;
  execution_time_seconds: number;
  primary_image_id: string;
  primary_image_filename: string;
}

export interface DashboardStats {
  total_analyses: number;
  images_processed: number;
  change_detections: number;
  optical_sar_fusions: number;
  vqa_queries: number;
  avg_processing_time: number;
  recent_analyses: HistoryItem[];
  supported_tasks: string[];
}

export interface SamplePreset {
  key: string;
  title: string;
  task: string;
  description: string;
  sample_query: string;
  requires_secondary: boolean;
  badge?: string;
}

export interface LoadSampleResponse {
  sample_key: string;
  sample_query: string;
  task: string;
  primary_image: ImageMetadata | null;
  secondary_image?: ImageMetadata | null;
}

export interface SystemStatus {
  status: string;
  version: string;
  backend_url: string;
  database: string;
  database_records: {
    images: number;
    analyses: number;
  };
  hardware_engine: string;
  model_adapters: {
    active: string;
    ready_for_weights: string[];
  };
}
