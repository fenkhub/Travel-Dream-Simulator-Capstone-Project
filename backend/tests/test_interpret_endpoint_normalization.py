from fastapi.testclient import TestClient
from app.main import app


def test_interpret_normalizes_bali_budget():
    client = TestClient(app)
    resp = client.post("/api/v1/trip/interpret", json={"description": "10 day trip to bali under $1000"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["destination"].lower() == "bali"
    assert data["duration_days"] == 10
    assert data.get("budget_total") == 1000
