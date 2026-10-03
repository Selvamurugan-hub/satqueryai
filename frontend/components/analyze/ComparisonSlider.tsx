"use client";

import React, { useState, useRef, useCallback } from "react";
import { MoveHorizontal } from "lucide-react";

interface ComparisonSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function ComparisonSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = "Before (T1)",
  afterLabel = "After (T2)",
}: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
      setSliderPosition(percent);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      className="relative w-full h-[460px] select-none overflow-hidden rounded-xl border border-border bg-black cursor-ew-resize shadow-2xl"
    >
      {/* After Image (Background) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterUrl}
        alt="After"
        className="absolute inset-0 h-full w-full object-contain pointer-events-none"
      />
      <div className="absolute top-3 right-3 z-10 rounded-md bg-black/70 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono font-semibold text-emerald-400 border border-emerald-500/30">
        {afterLabel}
      </div>

      {/* Before Image (Clipped Overlay) */}
      <div
        className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeUrl}
          alt="Before"
          className="absolute inset-0 h-full w-full object-contain"
        />
        <div className="absolute top-3 left-3 z-10 rounded-md bg-black/70 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono font-semibold text-cyan-400 border border-cyan-500/30">
          {beforeLabel}
        </div>
      </div>

      {/* Divider Bar & Handle */}
      <div
        className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={() => setIsDragging(true)}
      >
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-background shadow-lg transition-transform hover:scale-110">
          <MoveHorizontal className="h-4 w-4 stroke-[2.5]" />
        </div>
      </div>

      {/* Bottom helper tooltip */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-black/80 backdrop-blur-md px-3 py-1 text-[10px] font-mono text-muted-foreground border border-border">
        Drag slider left/right to compare temporal changes
      </div>
    </div>
  );
}
