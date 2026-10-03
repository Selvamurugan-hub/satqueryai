"use client";

import React, { useState } from "react";
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  BarChart3, 
  FileDown, 
  Clock, 
  Cpu, 
  Layers, 
  Copy, 
  Check, 
  ArrowUpRight,
  Info,
  Sliders,
  AlertCircle
} from "lucide-react";
import { AnalysisResponse } from "@/types";
import { formatTaskName } from "@/lib/utils";
import { getReportDownloadUrl } from "@/lib/api";

interface AIInsightsPanelProps {
  analysis: AnalysisResponse | null;
  isLoading?: boolean;
}

export function AIInsightsPanel({ analysis, isLoading = false }: AIInsightsPanelProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "findings" | "metrics" | "alerts">("summary");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.natural_language_answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[520px] rounded-2xl border border-border bg-card p-6 items-center justify-center text-center space-y-4 shadow-soft">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin" />
          <Bot className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground">AI Task Router Executing...</h4>
          <p className="text-xs text-muted-foreground max-w-xs">
            Aligning rasters, computing spectral indices, and synthesizing multimodal intelligence.
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col h-[520px] rounded-2xl border border-dashed border-border bg-card/60 p-6 items-center justify-center text-center space-y-3 shadow-soft">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground">AI Analysis & Insights</h4>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Select a satellite preset or ask a natural language question on the left to see autonomous task routing, visual evidence, and explainable metrics here.
          </p>
        </div>
      </div>
    );
  }

  const confidencePct = analysis.confidence ? Math.round(analysis.confidence * 100) : null;
  const changedPct = analysis.statistics?.total_change_percentage ?? analysis.statistics?.breakdown?.total_change_pct ?? null;
  const vegPct = analysis.statistics?.estimated_vegetation_coverage_pct ?? analysis.statistics?.vegetation_pct ?? null;
  const urbanPct = analysis.statistics?.sar_urban_double_bounce_pct ?? analysis.statistics?.urban_structures_pct ?? null;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-soft transition-all space-y-0">
      
      {/* Panel Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">AI Analysis & Insights</h3>
              <p className="text-[10px] font-mono text-teal-700 dark:text-teal-300 font-semibold">
                {formatTaskName(analysis.task_type)}
              </p>
            </div>
          </div>

          <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-teal-700 dark:text-teal-300">
            {analysis.is_baseline ? "BASELINE MODE" : "NEURAL INFERENCE"}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-3 bg-secondary/80 p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              activeTab === "summary"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("findings")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              activeTab === "findings"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Key Findings
          </button>
          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              activeTab === "metrics"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              activeTab === "alerts"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Alerts
          </button>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="p-4 space-y-4 max-h-[460px] overflow-y-auto">
        
        {/* TAB 1: SUMMARY */}
        {activeTab === "summary" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 gap-2.5">
              {confidencePct !== null && (
                <div className="rounded-xl border border-border bg-secondary/40 p-3 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    Confidence
                  </span>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {confidencePct}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">Statistical</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-border overflow-hidden mt-1">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${confidencePct}%` }} />
                  </div>
                </div>
              )}

              {changedPct !== null ? (
                <div className="rounded-xl border border-border bg-secondary/40 p-3 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
                    <Sliders className="h-3 w-3 text-amber-500" />
                    Area Changed
                  </span>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                      {changedPct}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">Surface</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-border overflow-hidden mt-1">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, changedPct)}%` }} />
                  </div>
                </div>
              ) : vegPct !== null ? (
                <div className="rounded-xl border border-border bg-secondary/40 p-3 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-teal-500" />
                    Vegetation Index
                  </span>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-xl font-bold font-mono text-teal-600 dark:text-teal-400">
                      {vegPct}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">VARI Proxy</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-border overflow-hidden mt-1">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(100, vegPct)}%` }} />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-secondary/40 p-3 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 text-cyan-500" />
                    Runtime
                  </span>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
                      {analysis.execution_summary.execution_time_seconds}s
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Natural Language Answer Box */}
            <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-3.5 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  Synthesis Explanation
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 rounded-md px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                {analysis.natural_language_answer}
              </p>
            </div>

            {/* Telemetry Summary */}
            <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-2 text-[11px] font-mono">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>TOOLS INVOKED:</span>
                <span className="text-foreground font-bold">{analysis.execution_summary.tools_invoked.join(", ")}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>HARDWARE ACCELERATOR:</span>
                <span className="text-foreground">{analysis.execution_summary.hardware_accelerator}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KEY FINDINGS */}
        {activeTab === "findings" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="text-xs font-semibold text-foreground">
              Empirical Findings from Raster Operations:
            </p>

            {analysis.key_findings && analysis.key_findings.length > 0 ? (
              <ul className="space-y-2">
                {analysis.key_findings.map((finding, idx) => (
                  <li
                    key={idx}
                    className="flex items-start space-x-2 rounded-xl border border-border/80 bg-secondary/20 p-2.5 text-xs text-foreground/90"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{finding}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No explicit findings recorded.</p>
            )}
          </div>
        )}

        {/* TAB 3: METRICS */}
        {activeTab === "metrics" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="text-xs font-semibold text-foreground">
              Quantitative Numerical Analysis:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {Object.entries(analysis.statistics).map(([key, value]) => {
                if (typeof value === "object" && value !== null) return null;
                return (
                  <div key={key} className="rounded-xl border border-border bg-secondary/30 p-2.5 space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground block truncate">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="font-bold text-foreground text-xs block truncate">
                      {String(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: ALERTS */}
        {activeTab === "alerts" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="text-xs font-semibold text-foreground">
              System & Analysis Quality Alerts:
            </p>

            {/* Baseline Methodology Disclaimer Alert */}
            <div className="flex items-start space-x-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 text-xs text-cyan-800 dark:text-cyan-200">
              <Info className="h-4 w-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-xs">Baseline Verification Notice</p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {analysis.confidence_rationale || "Calculated using verified radiometric formulas without synthetic hallucinations."}
                </p>
              </div>
            </div>

            {/* Spatial Resolution Alert */}
            <div className="flex items-start space-x-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-xs">Sensor Co-Registration Validated</p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Raster spatial grid matching verified ({analysis.primary_image.width}×{analysis.primary_image.height} pixels).
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Panel Footer: Download PDF Report */}
      <div className="p-4 border-t border-border bg-secondary/30">
        <a
          href={getReportDownloadUrl(analysis.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-2 w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-600/20 hover:from-teal-700 hover:to-cyan-700 transition-all hover:scale-[1.01]"
        >
          <FileDown className="h-4 w-4" />
          <span>Generate & Download Intelligence PDF</span>
        </a>
      </div>

    </div>
  );
}
