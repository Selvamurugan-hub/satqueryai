"use client";

import React, { useEffect, useState } from "react";
import { 
  Settings, 
  Sun, 
  Moon, 
  Laptop, 
  Server, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  User,
  Key
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { fetchSystemStatus, clearAllAnalyses } from "@/lib/api";
import { SystemStatus } from "@/types";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadStatus = () => {
    setIsLoadingStatus(true);
    fetchSystemStatus()
      .then(setSystemStatus)
      .catch((err) => console.error("Could not fetch system status:", err))
      .finally(() => setIsLoadingStatus(false));
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to delete all historical analysis records? This action cannot be undone.")) {
      return;
    }

    setIsClearing(true);
    try {
      await clearAllAnalyses();
      setNotification("Analysis history cleared successfully.");
      loadStatus();
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert("Failed to clear history: " + err.message);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          System Settings & Preferences
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure appearance, inspect remote sensing engine telemetry, and manage application data.
        </p>
      </div>

      {notification && (
        <div className="flex items-center space-x-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 font-semibold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Appearance & Theme Settings */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-soft">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Sun className="h-4 w-4 text-amber-500" />
          Interface Theme & Appearance
        </h2>
        <p className="text-xs text-muted-foreground">
          Choose your visual preference. Light Theme is optimized for bright daylight labs and report drafting; Dark Theme is suited for night operations.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex items-center space-x-3 rounded-2xl border p-4 text-left transition-all ${
              theme === "light"
                ? "border-teal-500 bg-teal-500/10 shadow-sm ring-2 ring-teal-500/20"
                : "border-border bg-secondary/30 hover:bg-secondary"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border shadow-sm">
              <Sun className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Light Theme</p>
              <p className="text-[10px] text-muted-foreground">Default Modern</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex items-center space-x-3 rounded-2xl border p-4 text-left transition-all ${
              theme === "dark"
                ? "border-teal-500 bg-teal-500/10 shadow-sm ring-2 ring-teal-500/20"
                : "border-border bg-secondary/30 hover:bg-secondary"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border shadow-sm">
              <Moon className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Dark Theme</p>
              <p className="text-[10px] text-muted-foreground">Low-Light Studio</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. User & Profile Info */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-soft">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          Operator Profile & Role
        </h2>

        <div className="flex items-center space-x-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-700 to-cyan-500 text-white font-bold text-lg shadow-md">
            SQ
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Earth Observation Specialist</p>
            <p className="text-xs text-muted-foreground">Smart India Hackathon 2026 Admin User</p>
            <span className="inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300">
              Role: Lead GIS / Remote Sensing Analyst
            </span>
          </div>
        </div>
      </div>

      {/* 3. Backend Connection & Telemetry Status */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Server className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            Backend Connection & Engine Telemetry
          </h2>
          <button
            onClick={loadStatus}
            disabled={isLoadingStatus}
            className="flex items-center space-x-1 text-xs text-teal-600 dark:text-teal-400 hover:underline"
          >
            <RefreshCw className={`h-3 w-3 ${isLoadingStatus ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {systemStatus ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-1">
              <span className="text-muted-foreground text-[10px]">API GATEWAY</span>
              <p className="font-bold text-foreground">{systemStatus.backend_url}</p>
              <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>ONLINE (v{systemStatus.version})</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-1">
              <span className="text-muted-foreground text-[10px]">DATABASE STORE</span>
              <p className="font-bold text-foreground">{systemStatus.database}</p>
              <p className="text-[10px] text-muted-foreground">
                {systemStatus.database_records.analyses} Analyses &bull; {systemStatus.database_records.images} Rasters
              </p>
            </div>

            <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-1">
              <span className="text-muted-foreground text-[10px]">COMPUTE ACCELERATOR</span>
              <p className="font-bold text-foreground">{systemStatus.hardware_engine}</p>
              <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">OpenCV / NumPy Multi-core</p>
            </div>

            <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-1">
              <span className="text-muted-foreground text-[10px]">MODEL ADAPTER INTERFACE</span>
              <p className="font-bold text-foreground">{systemStatus.model_adapters.active}</p>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                Ready for: {systemStatus.model_adapters.ready_for_weights.join(", ")}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-muted-foreground">
            Connecting to backend gateway...
          </div>
        )}
      </div>

      {/* 4. Data Management & Storage Controls */}
      <div className="rounded-2xl border border-red-500/30 bg-card p-6 space-y-4 shadow-soft">
        <h2 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Data Retention & History Clear
        </h2>
        <p className="text-xs text-muted-foreground">
          Clear cached audit logs and analytical summaries from the local database. Uploaded images in the data repository remain safe.
        </p>

        <button
          type="button"
          onClick={handleClearHistory}
          disabled={isClearing}
          className="flex items-center space-x-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all"
        >
          <Trash2 className="h-4 w-4" />
          <span>{isClearing ? "Clearing..." : "Clear Analysis History"}</span>
        </button>
      </div>
    </div>
  );
}
