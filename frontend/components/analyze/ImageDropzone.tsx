"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, CheckCircle, AlertCircle, X, Layers, Image as ImageIcon } from "lucide-react";
import { ImageMetadata } from "@/types";
import { uploadImage } from "@/lib/api";
import { formatBytes } from "@/lib/utils";

interface ImageDropzoneProps {
  label: string;
  sublabel: string;
  image: ImageMetadata | null;
  onImageUploaded: (img: ImageMetadata) => void;
  onImageRemoved: () => void;
  defaultModality?: "OPTICAL" | "SAR" | "MULTISPECTRAL";
  disabled?: boolean;
}

export function ImageDropzone({
  label,
  sublabel,
  image,
  onImageUploaded,
  onImageRemoved,
  defaultModality = "OPTICAL",
  disabled = false,
}: ImageDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modality, setModality] = useState<"OPTICAL" | "SAR" | "MULTISPECTRAL">(defaultModality);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setError(null);
    setIsUploading(true);

    try {
      const res = await uploadImage(file, modality);
      onImageUploaded(res.image);
    } catch (err: any) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || isUploading) return;
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setError(null);
    setIsUploading(true);

    try {
      const res = await uploadImage(file, modality);
      onImageUploaded(res.image);
    } catch (err: any) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-foreground">{label}</span>
          <p className="text-[11px] text-muted-foreground">{sublabel}</p>
        </div>

        {/* Modality Selector */}
        {!image && (
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value as any)}
            disabled={disabled || isUploading}
            className="rounded-lg bg-secondary border border-border px-2 py-0.5 text-[11px] font-mono text-teal-700 dark:text-teal-300 font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="OPTICAL">OPTICAL (RGB)</option>
            <option value="SAR">SAR (Radar)</option>
            <option value="MULTISPECTRAL">MULTISPECTRAL</option>
          </select>
        )}
      </div>

      {image ? (
        /* Uploaded Image Card */
        <div className="relative group rounded-2xl border border-teal-500/40 bg-teal-500/5 p-3 overflow-hidden transition-all shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="relative h-14 w-14 rounded-xl bg-slate-950 overflow-hidden flex-shrink-0 border border-border shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.filename}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-foreground truncate">{image.filename}</span>
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-muted-foreground font-mono mt-0.5">
                <span>{image.width}×{image.height} px</span>
                <span>&bull;</span>
                <span>{image.channels} Bands</span>
                <span>&bull;</span>
                <span>{formatBytes(image.file_size_bytes)}</span>
              </div>
              <span className="inline-block mt-1 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 uppercase">
                {image.modality}
              </span>
            </div>

            <div className="flex flex-col space-y-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="px-2 py-1 text-[10px] font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-500/10 rounded-lg transition-colors"
                title="Replace image"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={onImageRemoved}
                disabled={disabled}
                className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center"
                title="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Drag and Drop Zone */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-all ${
            isUploading
              ? "border-teal-500 bg-teal-500/5 cursor-wait"
              : "border-border hover:border-teal-500/60 hover:bg-teal-500/5 bg-secondary/30"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".png,.jpg,.jpeg,.tif,.tiff,.geotiff"
            className="hidden"
            disabled={disabled || isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center space-y-2 py-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
              <p className="text-xs text-teal-700 dark:text-teal-300 font-semibold">Profiling raster & extracting bands...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-1.5 py-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-teal-600 dark:text-teal-400 shadow-sm border border-border">
                <UploadCloud className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-foreground">
                Click to upload or drag & drop
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                PNG, JPG, TIFF, GeoTIFF (Max 50MB)
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-1.5 text-[11px] text-red-500 font-medium">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
