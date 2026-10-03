from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pathlib import Path
import numpy as np
import cv2
from PIL import Image

class AnalysisTool(ABC):
    """
    Abstract Base Class for all Remote Sensing Analysis Tools.
    Enables modular swapping between baseline algorithmic pipelines and deep learning adapters.
    """
    name: str = "BaseAnalysisTool"
    description: str = "Base interface for satellite analysis tools"
    is_baseline: bool = True

    @abstractmethod
    def can_handle(self, task_type: str) -> bool:
        """Determines if this tool can execute the given task type."""
        pass

    @abstractmethod
    def execute(self, inputs: Dict[str, Any], parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executes the analysis pipeline.
        Returns:
            Dict containing:
            - natural_language_answer (str)
            - key_findings (List[str])
            - confidence (Optional[float])
            - confidence_label (str)
            - confidence_rationale (str)
            - visual_evidences (List[Dict])
            - statistics (Dict[str, Any])
            - bounding_boxes (Optional[List[Dict]])
            - tools_invoked (List[str])
        """
        pass

class ToolRegistry:
    """Registry to discover and route to remote sensing tools."""
    def __init__(self):
        self._tools: List[AnalysisTool] = []

    def register(self, tool: AnalysisTool):
        self._tools.append(tool)

    def get_tool_for_task(self, task_type: str) -> Optional[AnalysisTool]:
        for tool in self._tools:
            if tool.can_handle(task_type):
                return tool
        return None

    def list_tools(self) -> List[str]:
        return [tool.name for tool in self._tools]

tool_registry = ToolRegistry()
