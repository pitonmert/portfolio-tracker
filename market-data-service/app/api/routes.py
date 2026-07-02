from fastapi import APIRouter, Query

from app.models import AssetCatalogItem, AssetType, HealthResponse, QuoteResponse
from app.services.quote_service import QuoteService

router = APIRouter()
quote_service = QuoteService()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get("/quotes/{symbol}", response_model=QuoteResponse)
def get_quote(
    symbol: str,
    assetType: AssetType = Query(default=AssetType.AUTO),
) -> QuoteResponse:
    return quote_service.get_quote(symbol, assetType)


@router.get("/assets/stocks", response_model=list[AssetCatalogItem])
def get_stock_assets() -> list[AssetCatalogItem]:
    return quote_service.get_stock_assets()


@router.get("/assets/funds", response_model=list[AssetCatalogItem])
def get_fund_assets(
    fundType: str = Query(default="YAT", pattern="^(YAT|EMK)$"),
) -> list[AssetCatalogItem]:
    return quote_service.get_fund_assets(fundType)


@router.get("/assets/search", response_model=list[AssetCatalogItem])
def search_assets(
    q: str = Query(default=""),
    assetType: AssetType = Query(default=AssetType.AUTO),
    limit: int = Query(default=20, ge=1, le=100),
) -> list[AssetCatalogItem]:
    return quote_service.search_assets(q, assetType, limit)
