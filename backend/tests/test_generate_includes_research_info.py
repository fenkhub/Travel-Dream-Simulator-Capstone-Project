from fastapi.testclient import TestClient
from app.main import app


def test_generate_includes_research_info_when_keys_missing():
    client = TestClient(app)
    params = {
        "destination": "Tokyo",
        "duration_days": 2,
        "currency": "USD",
        "travelers": 1,
        "original_request": "Trip to Tokyo",
        "preferences": {
            "interests": ["food", "culture"],
            "budget_range": "Moderate",
            "travel_style": "relaxed",
            "dietary_restrictions": [],
        },
    }
    resp = client.post("/api/v1/trip/generate", json=params)
    assert resp.status_code == 200
    data = resp.json()
    assert "research_info" in data
    ri = data["research_info"]
    assert "weather" in ri
    assert "top_places" in ri
    # Without keys, weather may be unavailable and places empty
    assert ri["weather"].get("status") in {"unavailable", "error", "ok"}