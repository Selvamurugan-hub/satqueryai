"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Layers, 
  Bot, 
  Sparkles, 
  AlertCircle, 
  RotateCcw,
  Sliders
} from "lucide-react";
import { ImageMetadata, AnalysisResponse, LoadSampleResponse } from "@/types";
import { ImageDropzone } from "@/components/analyze/ImageDropzone";
import { SamplePresets } from "@/components/analyze/SamplePresets";
import { QueryInput } from "@/components/analyze/QueryInput";
import { VisualizerCanvas } from "@/components/analyze/VisualizerCanvas";
import { AIInsightsPanel } from "@/components/analyze/AIInsightsPanel";
import { StatisticsPanel } from "@/components/analyze/StatisticsPanel";
import { analyzeQuery, fetchAnalysisDetail, loadSamplePreset } from "@/lib/api";

function AnalyzeStudioContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const initialPreset = searchParams.get("preset");

  // Studio State
  const [primaryImage, setPrimaryImage] = useState<ImageMetadata | null>(null);
  const [secondaryImage, setSecondaryImage] = useState<ImageMetadata | null>(null);
  const [query, setQuery] = useState<string>("");
  const [taskOverride, setTaskOverride] = useState<string>("");
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load existing analysis if ID present in URL
  useEffect(() => {
    if (initialId) {
      fetchAnalysisDetail(initialId)
        .then((data) => {
          setAnalysisResult(data);
          setPrimaryImage(data.primary_image);
          if (data.secondary_image) setSecondaryImage(data.secondary_image);
          if (data.user_query) setQuery(data.user_query);
        })
        .catch((err) => {
          console.error("Failed to load existing analysis:", err);
          setErrorMessage("Could not load requested analysis record.");
        });
    } else if (initialPreset) {
      loadSamplePreset(initialPreset)
        .then((data) => {
          setPrimaryImage(data.primary_image);
          setSecondaryImage(data.secondary_image || null);
          setQuery(data.sample_query);
        })
        .catch((err) => console.error("Could not load preset:", err));
    }
  }, [initialId, initialPreset]);

  const handleSampleLoaded = (sample: LoadSampleResponse) => {
    setPrimaryImage(sample.primary_image);
    setSecondaryImage(sample.secondary_image || null);
    setQuery(sample.sample_query);
    setTaskOverride("");
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleExecute = async () => {
    if (!primaryImage) {
      setErrorMessage("Please upload or select a primary satellite raster first.");
      return;
    }
    if (!query.trim()) {
      setErrorMessage("Please enter an analysis query.");
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      const res = await analyzeQuery({
        query: query.trim(),
        primary_image_id: primaryImage.id,
        secondary_image_id: secondaryImage?.id,
        task_override: taskOverride || undefined,
      });
      setAnalysisResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || "Analysis execution failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetAll = () => {
    setPrimaryImage(null);
    setSecondaryImage(null);
    setQuery("");
    setTaskOverride("");
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-foreground">Satellite Intelligence Studio</h1>
            <span className="rounded-full bg-teal-500/10 border border-teal-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-teal-700 dark:text-teal-300 uppercase">
              Vision-Language Workspace
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Query, align, compare, and reason over optical, multispectral, and SAR radar imagery.
          </p>
        </div>

        <button
          onClick={handleResetAll}
          disabled={isAnalyzing}
          className="flex items-center space-x-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-secondary transition-all shadow-sm"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Clear Workspace</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-center space-x-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3-Column Studio Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Inputs & Query (4 of 12 cols)                */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-4">
          <SamplePresets
            onSampleLoaded={handleSampleLoaded}
            disabled={isAnalyzing}
          />

          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <ImageDropzone
              label="Primary Satellite Raster"
              sublabel="Optical RGB or Multispectral"
              image={primaryImage}
              onImageUploaded={(img) => {
                setPrimaryImage(img);
                setErrorMessage(null);
              }}
              onImageRemoved={() => setPrimaryImage(null)}
              defaultModality="OPTICAL"
              disabled={isAnalyzing}
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <ImageDropzone
              label="Secondary / Comparison Raster"
              sublabel="Temporal T2 for change or SAR for radar fusion"
              image={secondaryImage}
              onImageUploaded={(img) => {
                setSecondaryImage(img);
                setErrorMessage(null);
              }}
              onImageRemoved={() => setSecondaryImage(null)}
              defaultModality="OPTICAL"
              disabled={isAnalyzing}
            />
          </div>

          <QueryInput
            query={query}
            setQuery={setQuery}
            taskOverride={taskOverride}
            setTaskOverride={setTaskOverride}
            onExecute={handleExecute}
            isLoading={isAnalyzing}
            disabled={!primaryImage}
          />
        </div>

        {/* ========================================================= */}
        {/* CENTER COLUMN: Visualizer Canvas (5 of 12 cols)          */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <VisualizerCanvas
            primaryImage={primaryImage}
            secondaryImage={secondaryImage}
            visualEvidences={analysisResult?.visual_evidences || []}
            boundingBoxes={analysisResult?.bounding_boxes || []}
            taskType={analysisResult?.task_type}
          />

          {analysisResult && (
            <StatisticsPanel
              statistics={analysisResult.statistics}
              taskType={analysisResult.task_type}
            />
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: AI Insights Panel (3 of 12 cols)           */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          <AIInsightsPanel
            analysis={analysisResult}
            isLoading={isAnalyzing}
          />
        </div>
      </div>
    </div>
  );
}

export default function AnalyzeStudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading Studio...</div>}>
      <AnalyzeStudioContent />
    </Suspense>
  );
}
