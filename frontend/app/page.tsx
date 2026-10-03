"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Satellite, 
  Layers, 
  Sparkles, 
  Building2, 
  Ship, 
  Trees, 
  Flame, 
  AlertTriangle, 
  UploadCloud, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Activity, 
  BarChart2,
  FileText,
  Search,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Zap,
  Globe,
  FileDown
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";
import { DashboardStats, ImageMetadata, AnalysisResponse, LoadSampleResponse } from "@/types";
import { fetchDashboardMetrics, analyzeQuery } from "@/lib/api";
import { formatTaskName } from "@/lib/utils";
import { SamplePresets } from "@/components/analyze/SamplePresets";
import { ImageDropzone } from "@/components/analyze/ImageDropzone";
import { QueryInput } from "@/components/analyze/QueryInput";
import { VisualizerCanvas } from "@/components/analyze/VisualizerCanvas";
import { AIInsightsPanel } from "@/components/analyze/AIInsightsPanel";
import { StatisticsPanel } from "@/components/analyze/StatisticsPanel";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Embedded Studio State
  const [primaryImage, setPrimaryImage] = useState<ImageMetadata | null>(null);
  const [secondaryImage, setSecondaryImage] = useState<ImageMetadata | null>(null);
  const [query, setQuery] = useState<string>("");
  const [taskOverride, setTaskOverride] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardMetrics()
      .then((data) => {
        setStats(data);
      })
      .catch((err) => console.error("Could not load dashboard metrics:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSampleLoaded = (sample: LoadSampleResponse) => {
    setPrimaryImage(sample.primary_image);
    setSecondaryImage(sample.secondary_image || null);
    setQuery(sample.sample_query);
    setTaskOverride("");
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleExecute = async () => {
    if (!primaryImage) {
      setErrorMessage("Please upload or select a satellite raster first.");
      return;
    }
    if (!query.trim()) {
      setErrorMessage("Please enter an analysis query.");
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      const res = await analyzeQuery({
        query: query.trim(),
        primary_image_id: primaryImage.id,
        secondary_image_id: secondaryImage?.id,
        task_override: taskOverride || undefined,
      });
      setAnalysisResult(res);
      // Refresh dashboard stats
      fetchDashboardMetrics().then(setStats).catch(() => {});
    } catch (err: any) {
      setErrorMessage(err.message || "Analysis execution failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const taskChartData = stats
    ? [
        { name: "Change Detection", count: stats.change_detections, color: "#f59e0b" },
        { name: "Optical + SAR", count: stats.optical_sar_fusions, color: "#06b6d4" },
        { name: "VQA Queries", count: stats.vqa_queries, color: "#10b981" },
        { name: "Single Rasters", count: Math.max(0, stats.total_analyses - stats.change_detections - stats.optical_sar_fusions - stats.vqa_queries), color: "#0d9488" },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* 1. Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-teal-500/5 p-6 sm:p-8 lg:p-10 shadow-soft bg-grid-light">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-mono font-semibold text-teal-700 dark:text-teal-300">
              <Satellite className="h-3.5 w-3.5 animate-spin" />
              <span>Smart India Hackathon 2026 &bull; PS SIH26167</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                Welcome to <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-500 bg-clip-text text-transparent">SatQuery AI</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Interactive Vision-Language Assistant for Multimodal Remote Sensing Image Analysis through Natural Language Text Queries.
                Analyze, compare, and understand Earth observation data from space.
              </p>
            </div>

            {/* Feature Shortcuts */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link
                href="/analyze"
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-600/20 hover:from-teal-700 hover:to-cyan-700 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Analysis Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <button
                onClick={() => {
                  const el = document.getElementById("studio-workspace");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center space-x-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-secondary transition-all shadow-sm"
              >
                <Sliders className="h-3.5 w-3.5 text-amber-500" />
                <span>Change Detection</span>
              </button>

              <Link
                href="/reports"
                className="flex items-center space-x-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-secondary transition-all shadow-sm"
              >
                <FileDown className="h-3.5 w-3.5 text-cyan-600" />
                <span>PDF Reports</span>
              </Link>

              <Link
                href="/about"
                className="flex items-center space-x-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-secondary transition-all shadow-sm"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Architecture</span>
              </Link>
            </div>
          </div>

          {/* Floating Hero Branding Emblem */}
          <div className="hidden lg:flex items-center justify-center flex-shrink-0">
            <div className="relative h-32 w-32 rounded-3xl overflow-hidden shadow-xl shadow-teal-500/10 border-2 border-teal-500/30 p-1 bg-card/80 backdrop-blur-sm animate-pulse-slow">
              <Image
                src="/logo.svg"
                alt="SatQuery AI Platform"
                width={128}
                height={128}
                className="h-full w-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-card card-elevation">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Total Analyses</span>
          <p className="text-2xl font-bold text-foreground font-mono">{stats?.total_analyses ?? 0}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">&bull; Verifiable Logs</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-card card-elevation">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Images Profiled</span>
          <p className="text-2xl font-bold text-foreground font-mono">{stats?.images_processed ?? 0}</p>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">&bull; Multimodal Rasters</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-card card-elevation">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Change Detections</span>
          <p className="text-2xl font-bold text-foreground font-mono">{stats?.change_detections ?? 0}</p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">&bull; SSIM Co-Registered</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-card card-elevation">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Optical + SAR</span>
          <p className="text-2xl font-bold text-foreground font-mono">{stats?.optical_sar_fusions ?? 0}</p>
          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">&bull; HSV Fusion</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-card card-elevation">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">VQA Queries</span>
          <p className="text-2xl font-bold text-foreground font-mono">{stats?.vqa_queries ?? 0}</p>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">&bull; Grounding Heatmaps</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-card card-elevation">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Avg Latency</span>
          <p className="text-2xl font-bold text-foreground font-mono">{stats?.avg_processing_time ?? 0.45}s</p>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">&bull; Real-time CV</span>
        </div>
      </div>

      {/* 3. Interactive Sample Presets Grid */}
      <SamplePresets
        onSampleLoaded={handleSampleLoaded}
        disabled={isAnalyzing}
      />

      {/* 4. Main Satellite Image Analysis Studio Section */}
      <div id="studio-workspace" className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              Satellite Image Analysis Studio
            </h2>
            <p className="text-xs text-muted-foreground">
              Multi-modal comparison, spectral indices, autonomous task routing, and visual intelligence.
            </p>
          </div>

          <Link
            href="/analyze"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>Open Fullscreen Studio</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Studio 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Image Inputs & Query (4 of 12) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <ImageDropzone
                label="Primary Satellite Raster"
                sublabel="Optical RGB or Multispectral"
                image={primaryImage}
                onImageUploaded={(img) => {
                  setPrimaryImage(img);
                  setErrorMessage(null);
                }}
                onImageRemoved={() => setPrimaryImage(null)}
                defaultModality="OPTICAL"
                disabled={isAnalyzing}
              />
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <ImageDropzone
                label="Secondary / Comparison Raster"
                sublabel="Temporal T2 for change or SAR for radar fusion"
                image={secondaryImage}
                onImageUploaded={(img) => {
                  setSecondaryImage(img);
                  setErrorMessage(null);
                }}
                onImageRemoved={() => setSecondaryImage(null)}
                defaultModality="OPTICAL"
                disabled={isAnalyzing}
              />
            </div>

            <QueryInput
              query={query}
              setQuery={setQuery}
              taskOverride={taskOverride}
              setTaskOverride={setTaskOverride}
              onExecute={handleExecute}
              isLoading={isAnalyzing}
              disabled={!primaryImage}
            />
          </div>

          {/* Center Column: Visualizer Canvas (5 of 12) */}
          <div className="lg:col-span-5 space-y-4">
            <VisualizerCanvas
              primaryImage={primaryImage}
              secondaryImage={secondaryImage}
              visualEvidences={analysisResult?.visual_evidences || []}
              boundingBoxes={analysisResult?.bounding_boxes || []}
              taskType={analysisResult?.task_type}
            />

            {analysisResult && (
              <StatisticsPanel
                statistics={analysisResult.statistics}
                taskType={analysisResult.task_type}
              />
            )}
          </div>

          {/* Right Column: AI Insights Panel (3 of 12) */}
          <div className="lg:col-span-3 space-y-4">
            <AIInsightsPanel
              analysis={analysisResult}
              isLoading={isAnalyzing}
            />
          </div>

        </div>
      </div>

      {/* 5. Analytics Charts & Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Left 2 Cols: Recent Analyses Activity Table */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 space-y-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Recent Satellite Intelligence Analyses
            </h3>
            <Link
              href="/history"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>View History</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {stats?.recent_analyses && stats.recent_analyses.length > 0 ? (
            <div className="divide-y divide-border">
              {stats.recent_analyses.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3 group">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="rounded-lg bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-700 dark:text-teal-300">
                        {formatTaskName(item.task_type)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {item.execution_time_seconds}s
                      </span>
                      {item.confidence && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                          {Math.round(item.confidence * 100)}% Conf
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-foreground truncate">
                      {item.user_query || item.natural_language_answer}
                    </p>
                  </div>

                  <Link
                    href={`/analyze?id=${item.id}`}
                    className="rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-foreground hover:bg-teal-600 hover:text-white transition-all shadow-sm flex-shrink-0"
                  >
                    Inspect in Studio
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No recent analyses recorded. Select a preset above to run your first satellite query!
            </div>
          )}
        </div>

        {/* Right 1 Col: Task Distribution Chart */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-soft">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            Task Distribution
          </h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    fontSize: "11px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {taskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
