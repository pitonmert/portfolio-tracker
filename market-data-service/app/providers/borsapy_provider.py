from collections.abc import Mapping
from typing import Any

import borsapy as bp

from app.core.settings import get_settings
from app.models import AssetCatalogItem, AssetType, QuoteResponse


class BorsapyProvider:
    def __init__(self) -> None:
        self._settings = get_settings()

    def get_stock_assets(self) -> list[AssetCatalogItem]:
        try:
            frame = bp.screen_stocks()
        except Exception:
            return []

        return [
            AssetCatalogItem(
                symbol=symbol,
                name=name,
                assetType=AssetType.STOCK,
                market="BIST",
                providerSymbol=symbol,
                source=self._settings.source_name,
                rawType="screen_stocks",
            )
            for row in dataframe_records(frame)
            if (symbol := normalize_symbol(str(row.get("symbol", ""))))
            for name in [to_text(row.get("name"))]
        ]

    def get_fund_assets(self, fund_type: str) -> list[AssetCatalogItem]:
        normalized_fund_type = normalize_symbol(fund_type)

        try:
            frame = bp.screen_funds(fund_type=normalized_fund_type, limit=5000)
        except Exception:
            return []

        return [
            AssetCatalogItem(
                symbol=symbol,
                name=name,
                assetType=AssetType.FUND,
                market="TEFAS",
                providerSymbol=symbol,
                source=self._settings.source_name,
                fundType=normalized_fund_type,
                rawType=to_text(row.get("fund_type")),
            )
            for row in dataframe_records(frame)
            if (symbol := normalize_symbol(str(row.get("fund_code", ""))))
            for name in [to_text(row.get("name"))]
        ]

    def get_stock_quote(self, symbol: str) -> QuoteResponse:
        normalized_symbol = normalize_symbol(symbol)

        try:
            ticker = bp.Ticker(normalized_symbol)
            fast_info = safe_object_get(ticker, "fast_info")
            info = safe_object_get(ticker, "info")
            current_price = first_number(
                fast_info,
                "last_price",
                "lastPrice",
                "last",
                "price",
                "current_price",
                "regularMarketPrice",
            )
            name = first_text(
                info,
                "name",
                "shortName",
                "longName",
                "company_name",
                "companyName",
            )

            if current_price is None or current_price <= 0:
                return QuoteResponse.unavailable(
                    normalized_symbol,
                    AssetType.STOCK,
                    "Hisse fiyatı bulunamadı",
                )

            return QuoteResponse(
                symbol=normalized_symbol,
                assetType=AssetType.STOCK,
                name=name,
                currentPrice=current_price,
                source=self._settings.source_name,
                isAvailable=True,
            )
        except Exception:
            return QuoteResponse.unavailable(
                normalized_symbol,
                AssetType.STOCK,
                "Hisse fiyatı alınamadı",
            )

    def get_fund_quote(self, symbol: str) -> QuoteResponse:
        normalized_symbol = normalize_symbol(symbol)

        try:
            fund = bp.Fund(normalized_symbol)
            info = safe_object_get(fund, "info")
            current_price = first_number(
                info,
                "price",
                "last_price",
                "lastPrice",
                "last",
                "current_price",
                "currentPrice",
                "unit_price",
                "unitPrice",
                "fund_price",
                "fundPrice",
                "fiyat",
                "son_fiyat",
            )
            name = first_text(
                info,
                "name",
                "fund_name",
                "fundName",
                "title",
                "unvan",
                "fon_adi",
            )

            if current_price is None or current_price <= 0:
                current_price = latest_history_price(fund)

            if current_price is None or current_price <= 0:
                return QuoteResponse.unavailable(
                    normalized_symbol,
                    AssetType.FUND,
                    "Fon fiyatı bulunamadı",
                )

            return QuoteResponse(
                symbol=normalized_symbol,
                assetType=AssetType.FUND,
                name=name,
                currentPrice=current_price,
                source=self._settings.source_name,
                isAvailable=True,
            )
        except Exception:
            return QuoteResponse.unavailable(
                normalized_symbol,
                AssetType.FUND,
                "Fon fiyatı alınamadı",
            )


def normalize_symbol(symbol: str) -> str:
    return symbol.strip().upper()


def dataframe_records(frame: Any) -> list[dict[str, Any]]:
    if frame is None:
        return []

    try:
        return frame.to_dict(orient="records")
    except Exception:
        return []


def safe_object_get(source: Any, key: str) -> Any:
    try:
        value = getattr(source, key)
    except Exception:
        return None

    return value


def safe_get(data: Any, key: str) -> Any:
    if data is None:
        return None

    if isinstance(data, Mapping):
        return data.get(key)

    try:
        return data[key]
    except Exception:
        return None


def first_number(data: Any, *keys: str) -> float | None:
    for key in keys:
        number = to_number(safe_get(data, key))
        if number is not None:
            return number

    return None


def first_text(data: Any, *keys: str) -> str | None:
    for key in keys:
        value = safe_get(data, key)
        if value is None:
            continue

        text = str(value).strip()
        if text:
            return text

    return None


def to_text(value: Any) -> str | None:
    if value is None:
        return None

    text = str(value).strip()
    return text or None


def latest_history_price(fund: Any) -> float | None:
    try:
        history = fund.history(period="1mo")
    except Exception:
        return None

    if history is None:
        return None

    try:
        if hasattr(history, "empty") and history.empty:
            return None

        for key in ("close", "kapanis", "price", "fiyat"):
            if key in history:
                series = history[key].dropna()
                if len(series) > 0:
                    return to_number(series.iloc[-1])
    except Exception:
        return None

    return None


def to_number(value: Any) -> float | None:
    if value is None:
        return None

    if isinstance(value, str):
        normalized = value.strip()
        if not normalized:
            return None

        if "," in normalized and "." in normalized:
            normalized = normalized.replace(".", "").replace(",", ".")
        elif "," in normalized:
            normalized = normalized.replace(",", ".")

        value = normalized

    try:
        number = float(value)
    except (TypeError, ValueError):
        return None

    return number if number == number else None
