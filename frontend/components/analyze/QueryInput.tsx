"use client";

import React from "react";
import { Send, Bot, Sparkles, SlidersHorizontal, Loader2 } from "lucide-react";

const SUGGESTED_QUERIES = [
  "Analyze the land use changes in this area.",
  "Identify water bodies in the uploaded satellite image.",
  "Compare vegetation coverage between the two images.",
  "Detect urban expansion.",
  "Calculate the percentage of changed area.",
  "Analyze optical and SAR radar imagery together.",
];

interface QueryInputProps {
  query: string;
  setQuery: (q: string) => void;
  taskOverride: string;
  setTaskOverride: (t: string) => void;
  onExecute: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export function QueryInput({
  query,
  setQuery,
  taskOverride,
  setTaskOverride,
  onExecute,
  isLoading,
  disabled,
}: QueryInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !isLoading && query.trim()) {
        onExecute();
      }
    }
  };

  return (
    <div className="flex flex-col space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Bot className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-foreground">Ask a Question About Your Satellite Data</span>
        </div>

        {/* Task Override Selector */}
        <div className="flex items-center space-x-1.5">
          <SlidersHorizontal className="h-3 w-3 text-muted-foreground" />
          <select
            value={taskOverride}
            onChange={(e) => setTaskOverride(e.target.value)}
            disabled={disabled || isLoading}
            className="rounded-lg bg-secondary border border-border px-2 py-1 text-[11px] font-mono font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Autonomous Router</option>
            <option value="CHANGE_DETECTION">Change Detection</option>
            <option value="OPTICAL_SAR_ANALYSIS">Optical + SAR</option>
            <option value="SINGLE_IMAGE_ANALYSIS">Single Raster</option>
            <option value="OBJECT_LOCALIZATION">Localization</option>
            <option value="VISUAL_QUESTION_ANSWERING">VQA</option>
          </select>
        </div>
      </div>

      {/* Query Text Area */}
      <div className="relative">
        <textarea
          rows={3}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask in natural language (e.g. 'What changed between these images?' or 'Identify vegetation changes and buildings')..."
          disabled={disabled || isLoading}
          className="w-full resize-none rounded-xl border border-border bg-secondary/30 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-500 focus:bg-card focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 transition-all font-sans"
        />

        <button
          onClick={onExecute}
          disabled={disabled || isLoading || !query.trim()}
          className="absolute bottom-2.5 right-2.5 flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-teal-600/20 transition-all hover:from-teal-700 hover:to-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Execute Query</span>
              <Send className="h-3 w-3" />
            </>
          )}
        </button>
      </div>

      {/* Example Prompt Chips */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        <span className="text-[10px] text-muted-foreground font-mono flex items-center mr-1">
          <Sparkles className="h-3 w-3 text-teal-600 dark:text-teal-400 mr-1" />
          Suggested:
        </span>
        {SUGGESTED_QUERIES.map((sq, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setQuery(sq)}
            disabled={disabled || isLoading}
            className="rounded-lg border border-border/80 bg-secondary/60 px-2.5 py-1 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:border-teal-500/40 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-500/5 transition-all"
          >
            {sq}
          </button>
        ))}
      </div>
    </div>
  );
}
