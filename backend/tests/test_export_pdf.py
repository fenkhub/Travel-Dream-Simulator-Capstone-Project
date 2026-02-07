from fastapi.testclient import TestClient
from app.main import app
from app.models.trip import TripPlan, TripParameters, TripPreferences


def test_export_pdf_endpoint_returns_pdf_bytes():
    client = TestClient(app)
    plan = TripPlan(
        parameters=TripParameters(
            destination="Tokyo",
            duration_days=1,
            travelers=1,
            original_request="Tokyo",
            preferences=TripPreferences(interests=["food"], budget_range="Moderate", travel_style="relaxed")
        ),
        itinerary=[{
            "day_number": 1,
            "morning": {"activity": "Shrine", "description": "Visit Meiji", "location": "Shibuya"},
            "afternoon": {"activity": "Museum", "description": "Art", "location": "Roppongi"},
            "evening": {"activity": "Dinner", "description": "Sushi", "location": "Ginza"},
        }],
        status="generated"
    )
    resp = client.post("/api/v1/trip/export/pdf", json=plan.model_dump())
    assert resp.status_code == 200
    assert resp.headers.get("content-type") == "application/pdf"
    assert len(resp.content) > 100