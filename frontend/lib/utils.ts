import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatTaskName(taskType: string): string {
  switch (taskType) {
    case "SINGLE_IMAGE_ANALYSIS":
      return "Single Raster Profiling";
    case "CHANGE_DETECTION":
      return "Bi-Temporal Change Detection";
    case "OPTICAL_SAR_ANALYSIS":
      return "Optical + SAR Microwave Fusion";
    case "OBJECT_LOCALIZATION":
      return "Object Grounding & Localization";
    case "VISUAL_QUESTION_ANSWERING":
      return "Visual Question Answering (VQA)";
    case "GENERAL_IMAGE_ANALYSIS":
      return "General Satellite Intelligence";
    default:
      return taskType.replace(/_/g, " ");
  }
}
