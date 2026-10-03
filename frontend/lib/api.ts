import {
  ImageMetadata,
  AnalysisResponse,
  HistoryItem,
  DashboardStats,
  SamplePreset,
  LoadSampleResponse,
  SystemStatus
} from "@/types";

const API_BASE = "/api";

export async function uploadImage(file: File, modality = "OPTICAL"): Promise<{ image: ImageMetadata; message: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("modality", modality);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Failed to upload image.");
  }
  return res.json();
}

export async function fetchSamplePresets(): Promise<SamplePreset[]> {
  const res = await fetch(`${API_BASE}/samples`);
  if (!res.ok) throw new Error("Failed to load sample presets.");
  const data = await res.json();
  return data.presets;
}

export async function loadSamplePreset(key: string): Promise<LoadSampleResponse> {
  const res = await fetch(`${API_BASE}/samples/load/${key}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Failed to load preset '${key}'.`);
  return res.json();
}

export async function analyzeQuery(payload: {
  query: string;
  primary_image_id: string;
  secondary_image_id?: string;
  task_override?: string;
  parameters?: Record<string, any>;
}): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(err.detail || "Analysis request failed.");
  }
  return res.json();
}

export async function fetchAnalyses(limit = 50, taskType?: string): Promise<HistoryItem[]> {
  const url = new URL(`${window.location.origin}${API_BASE}/analyses`);
  url.searchParams.append("limit", String(limit));
  if (taskType) url.searchParams.append("task_type", taskType);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch analysis history.");
  return res.json();
}

export async function fetchAnalysisDetail(id: string): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE}/analyses/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch analysis detail for ID ${id}.`);
  return res.json();
}

export async function deleteAnalysis(id: string): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/analyses/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete analysis.");
  return res.json();
}

export async function clearAllAnalyses(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/analyses`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to clear analysis history.");
  return res.json();
}

export async function fetchDashboardMetrics(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch dashboard metrics.");
  return res.json();
}

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const res = await fetch(`${API_BASE}/system/status`);
  if (!res.ok) throw new Error("Failed to fetch system status.");
  return res.json();
}

export function getReportDownloadUrl(analysisId: string): string {
  return `${API_BASE}/analyses/${analysisId}/report`;
}
