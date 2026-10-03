"use client";

import Link from "next/link";
import { Satellite, Globe, Shield, Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/80 py-6 text-xs text-muted-foreground mt-auto transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <Satellite className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-foreground">SatQuery AI &bull; Earth Observation Intelligence</p>
              <p className="text-[11px] text-muted-foreground">SIH 2026 Problem Statement SIH26167: Multimodal Remote Sensing Assistant</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <span className="flex items-center gap-1.5 font-medium">
              <Globe className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Optical & SAR Multimodal</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              <span>Verifiable Scientific Metrics</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Code2 className="h-3.5 w-3.5 text-cyan-500" />
              <span>Open Model Adapters</span>
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground">
            &copy; 2026 SatQuery AI. Production Grade Satellite Intelligence Platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
