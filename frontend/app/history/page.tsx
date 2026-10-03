"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  History, 
  Search, 
  Filter, 
  ExternalLink, 
  FileDown, 
  Clock, 
  ShieldCheck, 
  Trash2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { HistoryItem } from "@/types";
import { fetchAnalyses, deleteAnalysis, getReportDownloadUrl } from "@/lib/api";
import { formatTaskName } from "@/lib/utils";

const TASK_OPTIONS = [
  { value: "", label: "All Analysis Tasks" },
  { value: "CHANGE_DETECTION", label: "Change Detection" },
  { value: "OPTICAL_SAR_ANALYSIS", label: "Optical + SAR" },
  { value: "SINGLE_IMAGE_ANALYSIS", label: "Single Raster" },
  { value: "OBJECT_LOCALIZATION", label: "Localization" },
  { value: "VISUAL_QUESTION_ANSWERING", label: "VQA" },
];

function HistoryContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = () => {
    setIsLoading(true);
    fetchAnalyses(50, selectedTask || undefined)
      .then((data) => {
        setItems(data);
        setFilteredItems(data);
      })
      .catch((err) => console.error("Failed to load history:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedTask]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredItems(
        items.filter(
          (item) =>
            (item.user_query && item.user_query.toLowerCase().includes(q)) ||
            item.natural_language_answer.toLowerCase().includes(q) ||
            item.task_type.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, items]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this analysis record?")) return;
    setDeletingId(id);
    try {
      await deleteAnalysis(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      alert("Failed to delete record: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <History className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            Analysis Audit History
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Complete audit trail of all remote sensing queries, agent task routing decisions, and generated reports.
          </p>
        </div>

        <Link
          href="/analyze"
          className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/20 hover:from-teal-700 hover:to-cyan-700 self-start sm:self-auto"
        >
          <span>New Analysis</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search query text, land findings, or task type..."
            className="w-full rounded-2xl border border-border bg-card pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-soft"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            className="w-full sm:w-auto rounded-2xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-soft font-mono"
          >
            {TASK_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center space-x-2 text-xs text-teal-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading historical audit records...</span>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-secondary/50 text-[10px] font-mono uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Task & Query</th>
                  <th className="px-4 py-3 font-semibold">Intelligence Summary</th>
                  <th className="px-4 py-3 font-semibold">Confidence</th>
                  <th className="px-4 py-3 font-semibold">Date & Latency</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                    {/* Task & Query */}
                    <td className="px-4 py-3.5 align-top max-w-[220px]">
                      <div className="space-y-1">
                        <span className="inline-block rounded-lg bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-700 dark:text-teal-300">
                          {formatTaskName(item.task_type)}
                        </span>
                        <p className="font-bold text-foreground text-xs line-clamp-2">
                          {item.user_query ? `"${item.user_query}"` : "Automated raster profiling"}
                        </p>
                      </div>
                    </td>

                    {/* Summary */}
                    <td className="px-4 py-3.5 align-top max-w-[340px]">
                      <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed font-sans">
                        {item.natural_language_answer}
                      </p>
                    </td>

                    {/* Confidence */}
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      {item.confidence ? (
                        <div className="flex items-center space-x-1.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>{Math.round(item.confidence * 100)}%</span>
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">N/A</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 align-top whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                      <div>{new Date(item.created_at).toLocaleString()}</div>
                      <div className="flex items-center space-x-1 text-[10px] text-teal-600 dark:text-teal-400 mt-0.5 font-bold">
                        <Clock className="h-3 w-3" />
                        <span>{item.execution_time_seconds}s</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Link
                          href={`/analyze?id=${item.id}`}
                          className="flex items-center space-x-1 rounded-xl bg-secondary px-2.5 py-1 text-xs font-bold text-foreground hover:bg-teal-600 hover:text-white transition-all shadow-sm"
                        >
                          <span>Open</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        
                        <a
                          href={getReportDownloadUrl(item.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 rounded-xl border border-border bg-card p-1 text-muted-foreground hover:text-teal-600 hover:border-teal-500/40 transition-all shadow-sm"
                          title="Download PDF Report"
                        >
                          <FileDown className="h-3.5 w-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="flex items-center space-x-1 rounded-xl border border-border bg-card p-1 text-muted-foreground hover:text-red-500 hover:border-red-500/40 transition-all shadow-sm"
                          title="Delete record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-soft">
          <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="text-sm font-bold text-foreground">No analyses found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search filter or execute a query in the Analysis Studio.
          </p>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading History...</div>}>
      <HistoryContent />
    </Suspense>
  );
}
