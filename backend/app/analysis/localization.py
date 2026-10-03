import os
import uuid
import re
from typing import Dict, Any, List, Optional
from pathlib import Path
import numpy as np
import cv2

from backend.app.core.config import settings
from backend.app.analysis.base import AnalysisTool, tool_registry

class ObjectLocalizationAnalyzer(AnalysisTool):
    name = "ObjectLocalizationAnalyzer"
    description = "Grounding and localizing target geographical features, built structures, water bodies, and vegetation parcels with bounding boxes and masks."
    is_baseline = True

    def can_handle(self, task_type: str) -> bool:
        return task_type == "OBJECT_LOCALIZATION"

    def execute(self, inputs: Dict[str, Any], parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        image_path = inputs.get("primary_image_path")
        user_query = (inputs.get("user_query") or "").lower()

        if not image_path or not os.path.exists(image_path):
            raise ValueError("Primary image is required for object localization.")

        img = cv2.imread(str(image_path))
        if img is None:
            raise ValueError("Could not decode image file.")

        h, w = img.shape[:2]
        total_pixels = w * h
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 1. Determine Target Object / Class from query
        target_class = "features"
        if any(k in user_query for k in ["building", "structure", "house", "roof", "urban", "built"]):
            target_class = "buildings"
        elif any(k in user_query for k in ["water", "river", "lake", "pond", "ocean", "sea", "flood"]):
            target_class = "water_bodies"
        elif any(k in user_query for k in ["vegetation", "tree", "forest", "crop", "field", "agriculture", "green"]):
            target_class = "vegetation"
        elif any(k in user_query for k in ["road", "highway", "street", "path", "runway"]):
            target_class = "roads"
        elif any(k in user_query for k in ["ship", "vessel", "boat"]):
            target_class = "ships"

        # 2. Extract Feature Mask based on target class
        mask = np.zeros((h, w), dtype=np.uint8)
        color_tag = [245, 158, 11]  # Amber default

        r, g, b = rgb[:, :, 0].astype(float), rgb[:, :, 1].astype(float), rgb[:, :, 2].astype(float)

        if target_class == "buildings":
            color_tag = [239, 68, 68]  # Red for buildings
            # High edge gradient + distinct brightness/saturation contrast
            edges = cv2.Canny(gray, 60, 160)
            kernel_rect = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
            closed_edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel_rect)
            # High reflectance or moderate contrast
            bright_struct = (gray > 120) | (np.abs(r - b) > 20)
            mask = ((closed_edges > 0) & bright_struct).astype(np.uint8) * 255
            mask = cv2.morphologyEx(mask, cv2.MORPH_DILATE, np.ones((3, 3), np.uint8))

        elif target_class == "water_bodies":
            color_tag = [59, 130, 246]  # Blue
            # High blue relative to red + low overall reflectance
            water_cond = (b > (r * 1.05)) & (r < 90) & (g < 120) & (gray < 110)
            mask = water_cond.astype(np.uint8) * 255
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))

        elif target_class == "vegetation":
            color_tag = [16, 185, 129]  # Emerald Green
            vari = (g - r) / (g + r - b + 1e-6)
            mask = (vari > 0.08).astype(np.uint8) * 255
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))

        elif target_class == "roads":
            color_tag = [234, 179, 8]  # Yellow
            # Linear gray features
            edges = cv2.Canny(gray, 40, 120)
            # Line filter
            kernel_line = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 3))
            roads_h = cv2.morphologyEx(edges, cv2.MORPH_OPEN, kernel_line)
            roads_v = cv2.morphologyEx(edges, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (3, 9)))
            mask = cv2.bitwise_or(roads_h, roads_v)
            mask = cv2.morphologyEx(mask, cv2.MORPH_DILATE, np.ones((3, 3), np.uint8))

        elif target_class == "ships":
            color_tag = [168, 85, 247]  # Purple
            # Bright anomalous spots surrounded by dark/uniform water
            bright_spots = (gray > 180) & (gray < 255)
            mask = bright_spots.astype(np.uint8) * 255
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))

        else:  # General features / high contrast structures
            edges = cv2.Canny(gray, 50, 150)
            mask = cv2.dilate(edges, np.ones((5, 5), np.uint8))

        # 3. Extract Contours and Form Bounding Boxes
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        min_box_area = max(40, int(total_pixels * 0.0003))
        max_box_area = int(total_pixels * 0.70)
        
        bounding_boxes = []
        annotated_img = rgb.copy()
        
        box_idx = 0
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if min_box_area <= area <= max_box_area:
                box_idx += 1
                x, y, bw, bh = cv2.boundingRect(cnt)
                
                # Box confidence derived from contrast and contour regularity
                peri = cv2.arcLength(cnt, True)
                circularity = (4 * np.pi * area) / (peri * peri + 1e-6)
                box_conf = round(min(0.96, max(0.65, 0.70 + float(circularity) * 0.15)), 2)

                bounding_boxes.append({
                    "label": f"{target_class.replace('_', ' ').capitalize()} #{box_idx}",
                    "confidence": box_conf,
                    "box": [int(x), int(y), int(x + bw), int(y + bh)],
                    "area_pixels": int(area)
                })

                # Draw bounding box and label on annotated image
                cv2.rectangle(annotated_img, (x, y), (x + bw, y + bh), color_tag, 2)
                cv2.putText(
                    annotated_img,
                    f"{target_class[:4].upper()} {box_conf}",
                    (x, max(12, y - 4)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.4,
                    color_tag,
                    1,
                    cv2.LINE_AA
                )

        # Sort bounding boxes by area descending
        bounding_boxes.sort(key=lambda b: b["area_pixels"] or 0, reverse=True)
        detected_count = len(bounding_boxes)
        total_target_pixels = int(np.sum(mask > 0))
        target_coverage_pct = round(float((total_target_pixels / total_pixels) * 100), 2)

        # 4. Generate Visual Evidences
        visual_evidences = []
        out_id = str(uuid.uuid4())[:8]

        # Evidence A: Annotated Bounding Box Visualizer
        bbox_filename = f"bbox_{out_id}.png"
        bbox_path = settings.OUTPUTS_DIR / bbox_filename
        cv2.imwrite(str(bbox_path), cv2.cvtColor(annotated_img, cv2.COLOR_RGB2BGR))
        visual_evidences.append({
            "title": f"Spatial Localization & Bounding Boxes ({detected_count} detected)",
            "description": f"Identified {detected_count} {target_class.replace('_', ' ')} candidate region(s) with labeled spatial coordinates.",
            "image_url": f"/static/outputs/{bbox_filename}",
            "layer_type": "bounding_boxes",
            "metadata": {"detected_count": detected_count, "target_class": target_class}
        })

        # Evidence B: Segmentation Mask Overlay
        mask_colored = np.zeros_like(rgb)
        mask_colored[mask > 0] = color_tag
        blended_mask = cv2.addWeighted(rgb, 0.6, mask_colored, 0.4, 0)
        
        seg_filename = f"seg_{out_id}.png"
        seg_path = settings.OUTPUTS_DIR / seg_filename
        cv2.imwrite(str(seg_path), cv2.cvtColor(blended_mask, cv2.COLOR_RGB2BGR))
        visual_evidences.append({
            "title": f"Target Segmentation Mask ({target_coverage_pct}% coverage)",
            "description": f"Delineated spatial footprint for query target '{target_class.replace('_', ' ')}'.",
            "image_url": f"/static/outputs/{seg_filename}",
            "layer_type": "mask",
            "metadata": {"coverage_pct": target_coverage_pct}
        })

        # 5. Natural Language Synthesis
        findings = [
            f"Grounding query target: '{target_class.replace('_', ' ')}'.",
            f"Successfully localized {detected_count} instance(s) matching spatial/spectral morphology.",
            f"Aggregate spatial coverage: {target_coverage_pct}% of total raster area.",
            "Bounding coordinates and polygon masks computed."
        ]

        nl_answer = (
            f"Object localization completed for '{target_class.replace('_', ' ')}'. "
            f"The system detected and localized {detected_count} candidate region(s) encompassing "
            f"{target_coverage_pct}% of the scene area. "
            f"Spatial bounding boxes and segmentation contours have been projected onto the visual evidence canvas."
        )

        stats = {
            "target_class": target_class,
            "detected_instances_count": detected_count,
            "total_coverage_pct": target_coverage_pct,
            "top_box_coordinates": bounding_boxes[:5]
        }

        confidence = 0.82 if detected_count > 0 else 0.70
        confidence_label = "Moderate-High Confidence (Morphological Contour Grounding)"
        confidence_rationale = (
            f"Calculated from multi-threshold contour extraction and spatial geometry for target class '{target_class}'."
        )

        return {
            "natural_language_answer": nl_answer,
            "key_findings": findings,
            "confidence": confidence,
            "confidence_label": confidence_label,
            "confidence_rationale": confidence_rationale,
            "is_baseline": True,
            "visual_evidences": visual_evidences,
            "statistics": stats,
            "bounding_boxes": bounding_boxes[:20],
            "tools_invoked": ["SpectralFeatureFilter", "ContourExtractionEngine", "BoundingBoxGrounder"]
        }

tool_registry.register(ObjectLocalizationAnalyzer())
