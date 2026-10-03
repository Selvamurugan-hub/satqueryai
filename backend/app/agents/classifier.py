import re
from typing import Dict, Any, Optional

class TaskClassifier:
    """
    Task Classifier for Remote Sensing natural language queries and multimodal inputs.
    Routes queries to specialized remote sensing tools.
    """

    @staticmethod
    def classify(query: str, has_primary: bool, has_secondary: bool, secondary_modality: Optional[str] = None, task_override: Optional[str] = None) -> str:
        if task_override and task_override in [
            "SINGLE_IMAGE_ANALYSIS",
            "CHANGE_DETECTION",
            "OPTICAL_SAR_ANALYSIS",
            "OBJECT_LOCALIZATION",
            "VISUAL_QUESTION_ANSWERING",
            "GENERAL_IMAGE_ANALYSIS"
        ]:
            return task_override

        q = (query or "").strip().lower()

        # Check for Optical + SAR multimodal analysis
        if has_secondary and (secondary_modality == "SAR" or any(w in q for w in ["sar", "radar", "backscatter", "microwave", "optical and sar", "optical + sar"])):
            return "OPTICAL_SAR_ANALYSIS"

        # Check for Change Detection (2 images or temporal change query)
        if has_secondary or any(w in q for w in [
            "change", "difference", "differ", "compare", "temporal", "between", "before and after", "what changed", "evolution", "shift"
        ]):
            if has_secondary or any(w in q for w in ["change", "differ", "before and after"]):
                return "CHANGE_DETECTION"

        # Check for Object Localization / Grounding
        if any(w in q for w in [
            "where", "localize", "detect", "bounding box", "find the", "highlight", "outline", "delineate", "segment", "locate", "box"
        ]) and any(w in q for w in ["building", "structure", "water", "river", "road", "field", "ship", "vegetation", "forest", "crop"]):
            return "OBJECT_LOCALIZATION"

        # Check for Visual Question Answering (questions starting with is/are/how/does/what)
        if q.endswith("?") or any(q.startswith(w) for w in ["is ", "are ", "how ", "what ", "does ", "can ", "do ", "why ", "which "]):
            return "VISUAL_QUESTION_ANSWERING"

        # Check for spectral / single image analysis keywords
        if any(w in q for w in ["histogram", "spectral", "statistics", "band", "reflectance", "ndvi", "vari", "brightness", "contrast", "edge", "metadata", "profile", "overview", "analyze"]):
            return "SINGLE_IMAGE_ANALYSIS"

        # Default fallback
        return "SINGLE_IMAGE_ANALYSIS" if has_primary else "GENERAL_IMAGE_ANALYSIS"
