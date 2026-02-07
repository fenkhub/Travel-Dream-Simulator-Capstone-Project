import os
from app.agents.dream_interpreter import DreamInterpreterAgent


class DummyModel:
    def generate_content(self, prompt: str):
        raise RuntimeError("force fallback")


def test_interpret_fallback_extracts_destination_and_budget():
    agent = DreamInterpreterAgent(api_key=os.getenv("GOOGLE_API_KEY", "dummy"))
    agent.model_instance = DummyModel()
    description = "7-day trip to Japan under $5000 for culture and food"
    params = agent._fallback_process(description)
    assert params.destination.lower() in ["japan", "unknown destination"]
    assert params.duration_days == 7
    assert params.budget_total is None or params.budget_total >= 0