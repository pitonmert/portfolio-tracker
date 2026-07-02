from fastapi.testclient import TestClient

from app.api import routes
from app.main import app
from app.models import AssetCatalogItem, AssetType


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
    assert body["error"] == "Symbol is required"


def test_asset_search_route_returns_normalized_assets():
    original_service = routes.quote_service

    class FakeQuoteService:
        def search_assets(self, q, asset_type, limit):
            return [
                AssetCatalogItem(
                    symbol="THYAO",
                    name="Türk Hava Yolları",
                    assetType=AssetType.STOCK,
                    market="BIST",
                    providerSymbol="THYAO",
                )
            ]

    routes.quote_service = FakeQuoteService()
    try:
        client = TestClient(app)
        response = client.get("/assets/search?q=thy")
    finally:
        routes.quote_service = original_service

    assert response.status_code == 200
    assert response.json()[0]["symbol"] == "THYAO"
    assert response.json()[0]["assetType"] == "stock"
