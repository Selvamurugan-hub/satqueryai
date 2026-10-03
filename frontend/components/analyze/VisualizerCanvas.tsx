"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Download, 
  Maximize2, 
  Sliders, 
  Eye,
  Crosshair,
  Columns,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { ImageMetadata, VisualEvidenceItem, BoundingBox } from "@/types";
import { ComparisonSlider } from "./ComparisonSlider";
import { SideBySideViewer } from "./SideBySideViewer";

interface VisualizerCanvasProps {
  primaryImage: ImageMetadata | null;
  secondaryImage?: ImageMetadata | null;
  visualEvidences: VisualEvidenceItem[];
  boundingBoxes?: BoundingBox[];
  taskType?: string;
}

export function VisualizerCanvas({
  primaryImage,
  secondaryImage,
  visualEvidences,
  boundingBoxes,
  taskType,
}: VisualizerCanvasProps) {
  // Layer Selection: 'primary' | 'secondary' | 'split' | 'side-by-side' | `evidence-${idx}`
  const [activeLayer, setActiveLayer] = useState<string>("primary");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeLayer === "split" || activeLayer === "side-by-side") return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && activeLayer !== "split" && activeLayer !== "side-by-side") {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);
      setCursorPos({ x, y });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  // Auto-switch to first visual evidence overlay when new result arrives
  useEffect(() => {
    if (visualEvidences && visualEvidences.length > 0) {
      setActiveLayer("evidence-0");
    } else if (secondaryImage) {
      setActiveLayer("split");
    } else if (primaryImage) {
      setActiveLayer("primary");
    }
  }, [visualEvidences, secondaryImage, primaryImage]);

  if (!primaryImage) {
    return (
      <div className="flex h-[520px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center bg-grid-light shadow-soft">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 mb-4">
          <Layers className="h-7 w-7 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-foreground">Interactive Satellite Visualizer Canvas</h3>
        <p className="max-w-md text-xs text-muted-foreground mt-1.5 leading-relaxed">
          Upload satellite rasters or select a demonstration preset from the sidebar to inspect multispectral layers, temporal change maps, and visual grounding evidence.
        </p>
      </div>
    );
  }

  // Determine current active image URL to display
  let currentImageUrl = primaryImage.url;
  let currentLayerTitle = "Input Primary Raster";
  let currentLayerDescription = `${primaryImage.filename} (${primaryImage.width}×${primaryImage.height})`;

  if (activeLayer === "secondary" && secondaryImage) {
    currentImageUrl = secondaryImage.url;
    currentLayerTitle = "Input Secondary / SAR Raster";
    currentLayerDescription = `${secondaryImage.filename} (${secondaryImage.width}×${secondaryImage.height})`;
  } else if (activeLayer.startsWith("evidence-")) {
    const idx = parseInt(activeLayer.replace("evidence-", ""), 10);
    if (visualEvidences[idx]) {
      currentImageUrl = visualEvidences[idx].image_url;
      currentLayerTitle = visualEvidences[idx].title;
      currentLayerDescription = visualEvidences[idx].description;
    }
  }

  return (
    <div className="flex flex-col space-y-3">
      {/* Top Toolbar: View Mode Tabs & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card p-2.5 shadow-soft">
        
        {/* Comparison Mode Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveLayer("primary")}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              activeLayer === "primary"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Primary</span>
          </button>

          {secondaryImage && (
            <>
              <button
                onClick={() => setActiveLayer("secondary")}
                className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeLayer === "secondary"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Secondary</span>
              </button>

              <button
                onClick={() => setActiveLayer("split")}
                className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeLayer === "split"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Split Slider</span>
              </button>

              <button
                onClick={() => setActiveLayer("side-by-side")}
                className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeLayer === "side-by-side"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Side-by-Side</span>
              </button>
            </>
          )}

          {/* Evidence Overlays */}
          {visualEvidences.map((ev, idx) => (
            <button
              key={idx}
              onClick={() => setActiveLayer(`evidence-${idx}`)}
              className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                activeLayer === `evidence-${idx}`
                  ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="truncate max-w-[130px]">{ev.title.split(" ")[0]} Overlay</span>
            </button>
          ))}
        </div>

        {/* Zoom & Inspection Controls */}
        <div className="flex items-center space-x-1 bg-secondary/80 p-1 rounded-xl border border-border">
          <button
            onClick={handleZoomIn}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            title="Reset Pan & Zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <span className="px-2 text-[10px] font-mono font-bold text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative h-[480px] w-full overflow-hidden rounded-2xl border border-border bg-slate-950 dark:bg-black select-none shadow-card cursor-grab active:cursor-grabbing"
      >
        {activeLayer === "split" && secondaryImage ? (
          <ComparisonSlider
            beforeUrl={primaryImage.url}
            afterUrl={secondaryImage.url}
            beforeLabel="Before (T1)"
            afterLabel="After (T2)"
          />
        ) : activeLayer === "side-by-side" && secondaryImage ? (
          <div className="p-4 h-full">
            <SideBySideViewer
              primaryImage={primaryImage}
              secondaryImage={secondaryImage}
              zoom={zoom}
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-75"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImageUrl}
              alt={currentLayerTitle}
              className="max-h-[440px] max-w-full object-contain pointer-events-none rounded-lg shadow-2xl"
            />
          </div>
        )}

        {/* Top-left Active Layer Badge */}
        {activeLayer !== "split" && activeLayer !== "side-by-side" && (
          <div className="absolute top-3 left-3 z-10 rounded-xl bg-card/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-xs border border-border max-w-[80%] shadow-sm">
            <p className="font-bold text-foreground truncate">{currentLayerTitle}</p>
            <p className="text-[10px] text-muted-foreground truncate">{currentLayerDescription}</p>
          </div>
        )}

        {/* Bottom-right Coordinate Cursor Readout */}
        {cursorPos && (
          <div className="absolute bottom-3 right-3 z-10 flex items-center space-x-2 rounded-lg bg-card/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono text-muted-foreground border border-border shadow-sm">
            <Crosshair className="h-3 w-3 text-teal-600 dark:text-teal-400" />
            <span>X: {cursorPos.x}px</span>
            <span>Y: {cursorPos.y}px</span>
          </div>
        )}
      </div>
    </div>
  );
}
