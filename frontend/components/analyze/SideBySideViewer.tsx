"use client";

import React from "react";
import { ImageMetadata } from "@/types";
import { formatBytes } from "@/lib/utils";
import { Eye, Layers } from "lucide-react";

interface SideBySideViewerProps {
  primaryImage: ImageMetadata;
  secondaryImage: ImageMetadata;
  zoom?: number;
}

export function SideBySideViewer({
  primaryImage,
  secondaryImage,
  zoom = 1,
}: SideBySideViewerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-[460px]">
      {/* Primary Image Viewport */}
      <div className="relative flex flex-col rounded-2xl border border-border bg-slate-950/90 dark:bg-black overflow-hidden shadow-sm">
        <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 rounded-lg bg-card/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-foreground border border-border">
          <Eye className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span>Primary: {primaryImage.filename}</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primaryImage.url}
            alt={primaryImage.filename}
            className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-75"
            style={{ transform: `scale(${zoom})` }}
          />
        </div>

        <div className="flex items-center justify-between px-3 py-1.5 bg-card/80 dark:bg-slate-900/80 border-t border-border text-[10px] font-mono text-muted-foreground">
          <span>{primaryImage.width}×{primaryImage.height} px &bull; {primaryImage.channels} Bands</span>
          <span className="text-teal-600 dark:text-teal-400 font-bold uppercase">{primaryImage.modality}</span>
        </div>
      </div>

      {/* Secondary Image Viewport */}
      <div className="relative flex flex-col rounded-2xl border border-border bg-slate-950/90 dark:bg-black overflow-hidden shadow-sm">
        <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 rounded-lg bg-card/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-foreground border border-border">
          <Layers className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Secondary: {secondaryImage.filename}</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={secondaryImage.url}
            alt={secondaryImage.filename}
            className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-75"
            style={{ transform: `scale(${zoom})` }}
          />
        </div>

        <div className="flex items-center justify-between px-3 py-1.5 bg-card/80 dark:bg-slate-900/80 border-t border-border text-[10px] font-mono text-muted-foreground">
          <span>{secondaryImage.width}×{secondaryImage.height} px &bull; {secondaryImage.channels} Bands</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-bold uppercase">{secondaryImage.modality}</span>
        </div>
      </div>
    </div>
  );
}
