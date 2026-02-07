import os
from app.agents.dream_interpreter import DreamInterpreterAgent


class DummyModel:
    def generate_content(self, prompt: str):
        raise RuntimeError("force fallback")


def test_interpret_normalizes_destination_and_budget_and_duration():
    agent = DreamInterpreterAgent(api_key=os.getenv("GOOGLE_API_KEY", "dummy"))
    agent.model_instance = DummyModel()
    description = "10 day trip to bali under $1000"
    import asyncio
    params = asyncio.run(agent.process(description))
    assert params.destination.lower() == "bali"
    assert params.duration_days == 10
    assert params.budget_total == 1000
