import time
from typing import Dict, Any, Optional
from pathlib import Path

from backend.app.agents.classifier import TaskClassifier
from backend.app.analysis.base import tool_registry
# Ensure all analyzers are registered
import backend.app.analysis.single_image
import backend.app.analysis.change_detection
import backend.app.analysis.optical_sar
import backend.app.analysis.localization
import backend.app.analysis.vqa

class AgentController:
    """
    Central Agent Controller orchestrating query parsing, task routing,
    input validation, tool execution, and explainable telemetry generation.
    """

    def __init__(self):
        self.classifier = TaskClassifier()

    def process_query(
        self,
        query: str,
        primary_image_path: str,
        secondary_image_path: Optional[str] = None,
        secondary_modality: Optional[str] = None,
        task_override: Optional[str] = None,
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        start_time = time.time()

        has_primary = bool(primary_image_path and Path(primary_image_path).exists())
        has_secondary = bool(secondary_image_path and Path(secondary_image_path).exists())

        if not has_primary:
            raise ValueError("A valid primary satellite image must be provided.")

        # 1. Classify Task
        task_type = self.classifier.classify(
            query=query,
            has_primary=has_primary,
            has_secondary=has_secondary,
            secondary_modality=secondary_modality,
            task_override=task_override
        )

        # 2. Input & Modality Validation
        if task_type in ["CHANGE_DETECTION", "OPTICAL_SAR_ANALYSIS"] and not has_secondary:
            # If user requested change detection or optical-SAR without a second image, fallback gracefully
            if "change" in (query or "").lower():
                task_type = "SINGLE_IMAGE_ANALYSIS"
            else:
                task_type = "VISUAL_QUESTION_ANSWERING"

        # 3. Resolve Tool from Registry
        tool = tool_registry.get_tool_for_task(task_type)
        if not tool:
            # Fallback to single image analyzer
            tool = tool_registry.get_tool_for_task("SINGLE_IMAGE_ANALYSIS")
            task_type = "SINGLE_IMAGE_ANALYSIS"

        # 4. Prepare Inputs
        inputs = {
            "primary_image_path": primary_image_path,
            "secondary_image_path": secondary_image_path,
            "user_query": query,
            "secondary_modality": secondary_modality
        }

        # 5. Execute Tool Pipeline
        result = tool.execute(inputs=inputs, parameters=parameters or {})
        elapsed_time = round(time.time() - start_time, 3)

        # 6. Format Execution Summary
        execution_summary = {
            "task": task_type,
            "tools_invoked": result.get("tools_invoked", [tool.name]),
            "parameters": {
                "user_query": query,
                "has_secondary": has_secondary,
                "input_parameters": parameters or {}
            },
            "execution_time_seconds": elapsed_time,
            "is_demo_mode": result.get("is_baseline", True),
            "hardware_accelerator": "CPU (NumPy/OpenCV Engine)"
        }

        result["task_type"] = task_type
        result["execution_summary"] = execution_summary

        return result

agent_controller = AgentController()
