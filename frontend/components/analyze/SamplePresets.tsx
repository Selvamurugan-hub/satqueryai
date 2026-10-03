"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Building2, Trees, Ship, Flame, AlertTriangle, UploadCloud, ArrowRight, Loader2 } from "lucide-react";
import { SamplePreset, LoadSampleResponse } from "@/types";
import { fetchSamplePresets, loadSamplePreset } from "@/lib/api";

const PRESET_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  urban_expansion: { icon: Building2, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  agriculture_canopy: { icon: Trees, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  coastal_harbor_sar: { icon: Ship, color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/20" },
  deforestation: { icon: Flame, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
  disaster_flood: { icon: AlertTriangle, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  custom: { icon: UploadCloud, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
};

interface SamplePresetsProps {
  onSampleLoaded: (sample: LoadSampleResponse) => void;
  disabled?: boolean;
}

export function SamplePresets({ onSampleLoaded, disabled }: SamplePresetsProps) {
  const [presets, setPresets] = useState<SamplePreset[]>([]);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  useEffect(() => {
    fetchSamplePresets()
      .then(setPresets)
      .catch((err) => console.error("Could not fetch samples:", err));
  }, []);

  const handleSelect = async (key: string) => {
    if (disabled || loadingKey) return;
    setLoadingKey(key);
    try {
      const data = await loadSamplePreset(key);
      onSampleLoaded(data);
    } catch (err) {
      console.error("Failed to load sample:", err);
    } finally {
      setLoadingKey(null);
    }
  };

  if (presets.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-bold text-foreground">Interactive Sample Analysis Cards</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">Click to Load</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {presets.map((preset) => {
          const config = PRESET_CONFIG[preset.key] || {
            icon: Sparkles,
            color: "text-teal-500",
            bg: "bg-teal-500/10 border-teal-500/20",
          };
          const Icon = config.icon;
          const isLoading = loadingKey === preset.key;

          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => handleSelect(preset.key)}
              disabled={disabled || Boolean(loadingKey)}
              className="flex items-center justify-between text-left rounded-xl border border-border/80 bg-secondary/30 p-2.5 text-xs transition-all hover:border-teal-500/40 hover:bg-secondary/70 hover:shadow-sm group"
            >
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl border flex-shrink-0 ${config.bg}`}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                  ) : (
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-foreground text-xs truncate group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                    {preset.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{preset.badge || preset.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-[10px] font-mono text-muted-foreground group-hover:text-teal-700 dark:group-hover:text-teal-300 flex-shrink-0">
                <span>Load</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
