from typing import Dict, Any, List
from app.agents.base import BaseAgent
import json
from pathlib import Path

class MemoryAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Memory Agent")
        self.context: Dict[str, Any] = {}
        self.history: List[Dict[str, Any]] = []
        self.storage_path = Path(__file__).resolve().parent.parent / "data" / "memory.json"
        self._ensure_storage()
        self._load()

    async def process(self, input_data: Any) -> Any:
        # Placeholder for processing
        pass

    def update_context(self, key: str, value: Any):
        self.context[key] = value
        self._save()

    def get_context(self, key: str) -> Any:
        return self.context.get(key)

    def add_interaction(self, user_input: str, agent_response: Any):
        self.history.append({
            "user": user_input,
            "agent": agent_response
        })
        self._save()

    def _ensure_storage(self):
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.storage_path.exists():
            with self.storage_path.open("w") as f:
                json.dump({"context": {}, "history": []}, f)

    def _load(self):
        try:
            with self.storage_path.open("r") as f:
                data = json.load(f)
                self.context = data.get("context", {})
                self.history = data.get("history", [])
        except Exception:
            self.context = {}
            self.history = []

    def _save(self):
        try:
            with self.storage_path.open("w") as f:
                json.dump({"context": self.context, "history": self.history}, f)
        except Exception:
            pass
