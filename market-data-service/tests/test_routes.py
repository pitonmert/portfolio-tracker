from fastapi.testclient import TestClient

from app.main import app


def test_health_returns_ok():
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_blank_symbol_returns_controlled_unavailable_response():
    client = TestClient(app)

    response = client.get("/quotes/%20")

    assert response.status_code == 200
    body = response.json()
    assert body["isAvailable"] is False
    assert body["currentPrice"] is None
    assert body["error"] == "Sembol boş olamaz"
