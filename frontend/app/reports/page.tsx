"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  FileDown, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  Loader2,
  Search
} from "lucide-react";
import { HistoryItem } from "@/types";
import { fetchAnalyses, getReportDownloadUrl } from "@/lib/api";
import { formatTaskName } from "@/lib/utils";

export default function ReportsPage() {
  const [reports, setReports] = useState<HistoryItem[]>([]);
  const [filteredReports, setFilteredReports] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAnalyses(50)
      .then((data) => {
        setReports(data);
        setFilteredReports(data);
      })
      .catch((err) => console.error("Failed to load reports:", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReports(reports);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredReports(
        reports.filter(
          (r) =>
            (r.user_query && r.user_query.toLowerCase().includes(q)) ||
            r.natural_language_answer.toLowerCase().includes(q) ||
            r.task_type.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, reports]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            Intelligence PDF Reports Catalog
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Download and inspect publication-ready remote sensing intelligence dossiers.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports..."
            className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/20 shadow-soft"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center space-x-2 text-xs text-teal-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Scanning report repository...</span>
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between space-y-4 hover:border-teal-500/50 hover:shadow-card-hover transition-all shadow-soft group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-700 dark:text-teal-300">
                    {formatTaskName(report.task_type)}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                    {report.user_query ? `"${report.user_query}"` : "Automated Raster Intelligence Report"}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 mt-1 leading-relaxed font-sans">
                    {report.natural_language_answer}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono border-t border-border pt-2.5 text-muted-foreground">
                  <div className="flex items-center space-x-1 font-bold text-teal-700 dark:text-teal-300">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{report.execution_time_seconds}s latency</span>
                  </div>
                  {report.confidence && (
                    <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>{Math.round(report.confidence * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-border">
                <a
                  href={getReportDownloadUrl(report.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/20 hover:from-teal-700 hover:to-cyan-700 transition-all hover:scale-[1.01]"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  <span>Download PDF Report</span>
                </a>

                <Link
                  href={`/analyze?id=${report.id}`}
                  className="flex items-center justify-center rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary/80 transition-all shadow-sm"
                  title="Inspect in Studio"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-soft">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="text-sm font-bold text-foreground">No reports found</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Execute any satellite query in the Studio to automatically generate a downloadable PDF dossier.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-md"
          >
            <span>Launch Analysis Studio</span>
          </Link>
        </div>
      )}
    </div>
  );
}
