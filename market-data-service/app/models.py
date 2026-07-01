from datetime import datetime, timezone
from enum import StrEnum

from pydantic import BaseModel, Field


class AssetType(StrEnum):
    AUTO = "auto"
    STOCK = "stock"
    FUND = "fund"


class HealthResponse(BaseModel):
    status: str


class AssetCatalogItem(BaseModel):
    symbol: str
    name: str | None = None
    assetType: AssetType
    market: str
    currency: str = "TRY"
    providerSymbol: str
    source: str = "borsapy"
    fundType: str | None = None
    rawType: str | None = None


class QuoteResponse(BaseModel):
    symbol: str
    assetType: AssetType
    name: str | None = None
    currentPrice: float | None = Field(default=None, ge=0)
    currency: str = "TRY"
    fetchedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    source: str = "borsapy"
    isAvailable: bool
    error: str | None = None

    @classmethod
    def unavailable(
        cls,
        symbol: str,
        asset_type: AssetType,
        error: str = "Fiyat alınamadı",
    ) -> "QuoteResponse":
        return cls(
            symbol=symbol.strip().upper(),
            assetType=asset_type,
            isAvailable=False,
            error=error,
        )
