from app.models import AssetType, QuoteResponse
from app.providers.borsapy_provider import BorsapyProvider, normalize_symbol


class QuoteService:
    def __init__(self, provider: BorsapyProvider | None = None) -> None:
        self._provider = provider or BorsapyProvider()

    def get_quote(self, symbol: str, asset_type: AssetType = AssetType.AUTO) -> QuoteResponse:
        normalized_symbol = normalize_symbol(symbol)

        if not normalized_symbol:
            return QuoteResponse.unavailable("", asset_type, "Sembol boş olamaz")

        if asset_type == AssetType.STOCK:
            return self._provider.get_stock_quote(normalized_symbol)

        if asset_type == AssetType.FUND:
            return self._provider.get_fund_quote(normalized_symbol)

        if is_likely_fund_symbol(normalized_symbol):
            fund_quote = self._provider.get_fund_quote(normalized_symbol)
            if fund_quote.isAvailable:
                return fund_quote

            return QuoteResponse.unavailable(
                normalized_symbol,
                AssetType.AUTO,
                fund_quote.error or "Fiyat bulunamadı",
            )

        stock_quote = self._provider.get_stock_quote(normalized_symbol)
        if stock_quote.isAvailable:
            return stock_quote

        fund_quote = self._provider.get_fund_quote(normalized_symbol)
        if fund_quote.isAvailable:
            return fund_quote

        return QuoteResponse.unavailable(
            normalized_symbol,
            AssetType.AUTO,
            "Fiyat bulunamadı",
        )


def is_likely_fund_symbol(symbol: str) -> bool:
    return len(symbol) == 3 and symbol.isalpha()
