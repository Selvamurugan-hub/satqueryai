"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Layers, 
  History, 
  FileText, 
  Settings, 
  Building2, 
  Trees, 
  Ship, 
  Flame, 
  AlertTriangle, 
  UploadCloud, 
  Sparkles,
  ChevronRight,
  Cpu,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchSamplePresets } from "@/lib/api";
import { SamplePreset } from "@/types";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Analysis Studio", href: "/analyze", icon: Layers },
  { name: "History", href: "/history", icon: History },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "About & Arch", href: "/about", icon: Info },
];

const PRESET_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  urban_expansion: { icon: Building2, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  agriculture_canopy: { icon: Trees, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  coastal_harbor_sar: { icon: Ship, color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/20" },
  deforestation: { icon: Flame, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
  disaster_flood: { icon: AlertTriangle, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  custom: { icon: UploadCloud, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset?: (key: string) => void;
}

export function Sidebar({ isOpen, onClose, onSelectPreset }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [presets, setPresets] = useState<SamplePreset[]>([]);

  useEffect(() => {
    fetchSamplePresets()
      .then(setPresets)
      .catch((err) => console.error("Could not load presets in sidebar:", err));
  }, []);

  const handlePresetClick = (key: string) => {
    if (onSelectPreset) {
      onSelectPreset(key);
    } else {
      router.push(`/analyze?preset=${key}`);
    }
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto shadow-sm",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col flex-1 p-4 space-y-5">
          
          {/* Sidebar Branding Bar */}
          <div className="flex items-center space-x-3 px-2 py-2 rounded-xl bg-secondary/40 border border-border/70 select-none">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden shadow-sm border border-teal-500/30 flex-shrink-0">
              <Image 
                src="/icon.svg" 
                alt="SatQuery AI Icon" 
                width={32} 
                height={32} 
                className="h-full w-full object-cover" 
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1 leading-none">
                <span className="font-bold tracking-tight text-xs text-foreground">SatQuery</span>
                <span className="font-extrabold tracking-tight text-xs bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">AI</span>
              </div>
              <p className="text-[9px] font-medium text-muted-foreground truncate mt-0.5">Satellite Intelligence</p>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Main Navigation
            </p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all group",
                    isActive
                      ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold border border-teal-500/30 shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground group-hover:text-foreground")} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Start Interactive Presets */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between px-3">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                Quick Start Analysis
              </p>
            </div>

            <div className="space-y-1.5">
              {presets.map((preset) => {
                const config = PRESET_ICONS[preset.key] || {
                  icon: Sparkles,
                  color: "text-teal-500",
                  bg: "bg-teal-500/10 border-teal-500/20",
                };
                const Icon = config.icon;

                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handlePresetClick(preset.key)}
                    className="w-full flex items-center justify-between text-left rounded-xl border border-border/80 bg-secondary/30 p-2.5 text-xs transition-all hover:bg-secondary hover:border-primary/40 hover:shadow-sm group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg border flex-shrink-0", config.bg)}>
                        <Icon className={cn("h-3.5 w-3.5", config.color)} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-xs truncate group-hover:text-primary transition-colors">
                          {preset.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">{preset.badge || preset.task}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Telemetry Widget */}
          <div className="mt-auto pt-4 border-t border-border">
            <div className="rounded-2xl border border-border bg-gradient-to-br from-secondary/50 to-secondary/20 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1 text-teal-700 dark:text-teal-300 font-semibold">
                  <Zap className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                  ENGINE STATUS
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <p className="text-[11px] text-foreground font-semibold">
                Multimodal Remote Sensing Core
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono text-muted-foreground pt-1">
                <div className="rounded-lg bg-card/80 p-1.5 border border-border/60">
                  <span>LATENCY</span>
                  <p className="font-bold text-foreground">~0.45s</p>
                </div>
                <div className="rounded-lg bg-card/80 p-1.5 border border-border/60">
                  <span>ACCELERATOR</span>
                  <p className="font-bold text-foreground truncate">CPU CV/GIS</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}
