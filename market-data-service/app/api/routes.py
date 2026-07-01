from fastapi import APIRouter, Query

from app.models import AssetType, HealthResponse, QuoteResponse
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

