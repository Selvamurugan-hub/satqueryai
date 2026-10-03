"use client";

import React, { useState } from "react";
import { 
  Bot, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  FileDown, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle,
  Info,
  Layers,
  Copy,
  Check
} from "lucide-react";
import { AnalysisResponse } from "@/types";
import { formatTaskName } from "@/lib/utils";
import { getReportDownloadUrl } from "@/lib/api";

interface ExecutionTelemetryProps {
  analysis: AnalysisResponse;
}

export function ExecutionTelemetry({ analysis }: ExecutionTelemetryProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis.natural_language_answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confidencePct = analysis.confidence ? Math.round(analysis.confidence * 100) : null;

  return (
    <div className="flex flex-col space-y-4">
      {/* 1. Header: Task Route & Baseline Status */}
      <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                Agent Task Classified
              </span>
              <h4 className="text-xs font-bold text-foreground">
                {formatTaskName(analysis.task_type)}
              </h4>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-2.5 py-0.5 text-[10px] font-mono text-cyan-300">
            <Cpu className="h-3 w-3 text-cyan-400" />
            <span>{analysis.is_baseline ? "BASELINE / DEMO MODE" : "NEURAL AI INFERENCE"}</span>
          </div>
        </div>

        {/* User query echo */}
        {analysis.user_query && (
          <div className="mt-2.5 rounded-lg bg-secondary/40 p-2 text-xs text-muted-foreground border border-border/40">
            <span className="text-[10px] font-mono text-primary mr-1.5">&gt; Query:</span>
            <span className="text-foreground italic">&ldquo;{analysis.user_query}&rdquo;</span>
          </div>
        )}
      </div>

      {/* 2. Natural Language Answer */}
      <div className="rounded-xl border border-primary/30 bg-secondary/20 p-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-foreground">AI Intelligence Synthesis</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 rounded px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        <p className="text-xs leading-relaxed text-slate-200">
          {analysis.natural_language_answer}
        </p>

        {/* Key Findings Bullet List */}
        {analysis.key_findings && analysis.key_findings.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-border/60">
            <p className="text-[11px] font-semibold text-foreground mb-1.5">Key Findings & Spatial Insights:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {analysis.key_findings.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 3. Calibrated Confidence Metric Card */}
      <div className="rounded-xl border border-border bg-card p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Statistical Confidence Metric
          </span>
          {confidencePct !== null ? (
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              {confidencePct}% Confidence
            </span>
          ) : (
            <span className="text-xs font-mono text-muted-foreground">N/A</span>
          )}
        </div>

        {/* Confidence Progress Bar */}
        {confidencePct !== null && (
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          <strong className="text-foreground">{analysis.confidence_label}:</strong> {analysis.confidence_rationale}
        </p>
      </div>

      {/* 4. Execution Summary Telemetry */}
      <div className="rounded-xl border border-border bg-card p-3.5">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2.5">
          <Clock className="h-3.5 w-3.5 text-primary" />
          Agentic Execution Telemetry
        </span>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="rounded-lg bg-secondary/40 p-2 border border-border/40">
            <span className="text-muted-foreground block text-[10px]">EXECUTION TIME</span>
            <span className="font-bold text-foreground">{analysis.execution_summary.execution_time_seconds}s</span>
          </div>

          <div className="rounded-lg bg-secondary/40 p-2 border border-border/40">
            <span className="text-muted-foreground block text-[10px]">ENGINE / ACCELERATOR</span>
            <span className="font-bold text-foreground truncate block">{analysis.execution_summary.hardware_accelerator}</span>
          </div>
        </div>

        <div className="mt-2 rounded-lg bg-secondary/40 p-2 border border-border/40 text-[11px]">
          <span className="text-muted-foreground text-[10px] block font-mono">PIPELINE TOOLS INVOKED:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {analysis.execution_summary.tools_invoked.map((tool, idx) => (
              <span key={idx} className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-mono text-primary">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Download Official PDF Report Button */}
      <a
        href={getReportDownloadUrl(analysis.id)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-xs font-bold text-background shadow-lg shadow-primary/20 transition-all hover:opacity-95 hover:scale-[1.01]"
      >
        <FileDown className="h-4 w-4" />
        <span>Generate & Download Intelligence PDF Report</span>
      </a>
    </div>
  );
}
