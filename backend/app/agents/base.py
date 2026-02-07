from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

class BaseAgent(ABC):
    def __init__(self, name: str, model: str = "gemini-pro"):
        self.name = name
        self.model = model
        self.memory: List[Dict[str, Any]] = []

    @abstractmethod
    async def process(self, input_data: Any) -> Any:
        """Process the input and return the result."""
        pass

    def add_to_memory(self, role: str, content: str):
        self.memory.append({"role": role, "content": content})
