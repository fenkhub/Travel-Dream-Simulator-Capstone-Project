import os
from app.agents.research_agent import ResearchAgent
from app.models.trip import TripParameters, TripPreferences


class DummyModel:
    def generate_content(self, prompt: str):
        raise RuntimeError("force synthesis fallback")


def test_research_uses_mock_without_keys_and_returns_structure():
    agent = ResearchAgent(api_key=os.getenv("GOOGLE_API_KEY", "dummy"), google_api_key="", google_cse_id="")
    agent.model_instance = DummyModel()
    params = TripParameters(
        destination="Tokyo",
        duration_days=3,
        travelers=1,
        original_request="Trip to Tokyo",
        preferences=TripPreferences(interests=["food"], budget_range="Moderate", travel_style="relaxed")
    )
    findings = agent._synthesize_findings(params, [{"query": "restaurants in Tokyo", "organic_results": []}])
    assert set(findings.keys()) == {"activities", "accommodations", "dining"}