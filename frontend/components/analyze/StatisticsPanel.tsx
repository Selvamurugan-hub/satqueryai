"use client";

import React from "react";
import { BarChart3, PieChart, Activity, Layers, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area } from "recharts";

interface StatisticsPanelProps {
  statistics: Record<string, any>;
  taskType?: string;
}

export function StatisticsPanel({ statistics, taskType }: StatisticsPanelProps) {
  if (!statistics || Object.keys(statistics).length === 0) return null;

  let chartData: Array<{ name: string; value: number; color: string }> = [];

  if (statistics.breakdown) {
    chartData = [
      { name: "Structural/Urban", value: statistics.breakdown.structural_or_urban_change_pct || 0, color: "#f59e0b" },
      { name: "Vegetation Loss", value: statistics.breakdown.vegetation_loss_pct || 0, color: "#ef4444" },
      { name: "Vegetation Gain", value: statistics.breakdown.vegetation_gain_pct || 0, color: "#10b981" },
    ];
  } else if (statistics.channel_means) {
    chartData = [
      { name: "Red Band", value: statistics.channel_means.red || 0, color: "#ef4444" },
      { name: "Green Band", value: statistics.channel_means.green || 0, color: "#10b981" },
      { name: "Blue Band", value: statistics.channel_means.blue || 0, color: "#06b6d4" },
    ];
  } else if (statistics.estimated_vegetation_coverage_pct !== undefined) {
    chartData = [
      { name: "Vegetation (VARI)", value: statistics.estimated_vegetation_coverage_pct || 0, color: "#10b981" },
      { name: "Water Proxy", value: statistics.estimated_water_coverage_pct || 0, color: "#06b6d4" },
      { name: "Edge Density", value: statistics.edge_density_pct || 0, color: "#0d9488" },
    ];
  } else if (statistics.sar_urban_double_bounce_pct !== undefined) {
    chartData = [
      { name: "SAR Built-Up/Metallic", value: statistics.sar_urban_double_bounce_pct || 0, color: "#f59e0b" },
      { name: "SAR Specular Water", value: statistics.sar_water_specular_pct || 0, color: "#06b6d4" },
    ];
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          Quantitative Spectral & Spatial Metrics
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">Calibrated Output</span>
      </div>

      {/* Recharts Visualization */}
      {chartData.length > 0 && (
        <div className="h-36 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "12px",
                  fontSize: "11px",
                  color: "var(--foreground)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Numerical Metrics Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-border/80 text-[11px] font-mono">
        {Object.entries(statistics).map(([key, val]) => {
          if (typeof val === "object" && val !== null) return null;
          return (
            <div key={key} className="rounded-xl bg-secondary/40 p-2 border border-border/60">
              <span className="text-muted-foreground block text-[9px] uppercase tracking-wider truncate">
                {key.replace(/_/g, " ")}
              </span>
              <span className="font-bold text-foreground truncate block text-xs">
                {String(val)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
