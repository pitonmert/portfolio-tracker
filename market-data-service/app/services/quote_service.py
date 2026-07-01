from app.models import AssetCatalogItem, AssetType, QuoteResponse
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

    def get_stock_assets(self) -> list[AssetCatalogItem]:
        return self._provider.get_stock_assets()

    def get_fund_assets(self, fund_type: str) -> list[AssetCatalogItem]:
        normalized_fund_type = normalize_symbol(fund_type)
        if normalized_fund_type not in {"YAT", "EMK"}:
            return []

        return self._provider.get_fund_assets(normalized_fund_type)

    def search_assets(
        self,
        query: str,
        asset_type: AssetType = AssetType.AUTO,
        limit: int = 20,
    ) -> list[AssetCatalogItem]:
        normalized_query = normalize_symbol(query)
        if not normalized_query:
            return []

        assets = self._get_assets_for_search(asset_type)
        matches = [
            asset
            for asset in dedupe_assets(assets)
            if asset_matches(asset, normalized_query)
        ]

        matches.sort(key=lambda asset: asset_sort_key(asset, normalized_query))
        return matches[: max(1, limit)]

    def _get_assets_for_search(self, asset_type: AssetType) -> list[AssetCatalogItem]:
        if asset_type == AssetType.STOCK:
            return self.get_stock_assets()

        if asset_type == AssetType.FUND:
            return self.get_fund_assets("YAT") + self.get_fund_assets("EMK")

        return (
            self.get_stock_assets()
            + self.get_fund_assets("YAT")
            + self.get_fund_assets("EMK")
        )


def is_likely_fund_symbol(symbol: str) -> bool:
    return len(symbol) == 3 and symbol.isalpha()


def dedupe_assets(assets: list[AssetCatalogItem]) -> list[AssetCatalogItem]:
    deduped: dict[tuple[str, AssetType, str], AssetCatalogItem] = {}
    for asset in assets:
        key = (asset.symbol, asset.assetType, asset.market)
        deduped.setdefault(key, asset)

    return list(deduped.values())


def asset_matches(asset: AssetCatalogItem, query: str) -> bool:
    normalized_name = (asset.name or "").upper()
    return query in asset.symbol.upper() or query in normalized_name


def asset_sort_key(asset: AssetCatalogItem, query: str) -> tuple[int, str, str]:
    symbol = asset.symbol.upper()
    name = (asset.name or "").upper()

    if symbol == query:
        rank = 0
    elif symbol.startswith(query):
        rank = 1
    elif name.startswith(query):
        rank = 2
    elif query in symbol:
        rank = 3
    else:
        rank = 4

    return rank, symbol, name
