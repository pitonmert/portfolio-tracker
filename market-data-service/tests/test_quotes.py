from app.models import AssetCatalogItem, AssetType, QuoteResponse
from app.providers.borsapy_provider import to_number
from app.services.quote_service import QuoteService


class FakeProvider:
    def __init__(
        self,
        stock_quote=None,
        fund_quote=None,
        stock_assets=None,
        yat_fund_assets=None,
        emk_fund_assets=None,
    ):
        self.stock_quote = stock_quote
        self.fund_quote = fund_quote
        self.stock_assets = stock_assets or []
        self.yat_fund_assets = yat_fund_assets or []
        self.emk_fund_assets = emk_fund_assets or []
        self.stock_calls = 0
        self.fund_calls = 0

    def get_stock_quote(self, symbol):
        self.stock_calls += 1
        return self.stock_quote or QuoteResponse.unavailable(
            symbol,
            AssetType.STOCK,
            "stock unavailable",
        )

    def get_fund_quote(self, symbol):
        self.fund_calls += 1
        return self.fund_quote or QuoteResponse.unavailable(
            symbol,
            AssetType.FUND,
            "fund unavailable",
        )

    def get_stock_assets(self):
        return self.stock_assets

    def get_fund_assets(self, fund_type):
        return self.emk_fund_assets if fund_type == "EMK" else self.yat_fund_assets


def test_auto_returns_stock_when_available():
    quote = QuoteResponse(
        symbol="THYAO",
        assetType=AssetType.STOCK,
        currentPrice=100.25,
        isAvailable=True,
    )

    service = QuoteService(FakeProvider(stock_quote=quote))

    result = service.get_quote("thyao")

    assert result.isAvailable is True
    assert result.assetType == AssetType.STOCK
    assert result.currentPrice == 100.25


def test_auto_falls_back_to_fund():
    quote = QuoteResponse(
        symbol="AAK",
        assetType=AssetType.FUND,
        currentPrice=1.2345,
        isAvailable=True,
    )

    service = QuoteService(FakeProvider(fund_quote=quote))

    result = service.get_quote("aak")

    assert result.isAvailable is True
    assert result.assetType == AssetType.FUND
    assert result.currentPrice == 1.2345


def test_auto_tries_fund_first_for_three_letter_symbols():
    quote = QuoteResponse(
        symbol="KPC",
        assetType=AssetType.FUND,
        currentPrice=20.803006,
        isAvailable=True,
    )
    provider = FakeProvider(fund_quote=quote)
    service = QuoteService(provider)

    result = service.get_quote("kpc")

    assert result.isAvailable is True
    assert result.assetType == AssetType.FUND
    assert result.currentPrice == 20.803006
    assert provider.fund_calls == 1
    assert provider.stock_calls == 0


def test_auto_returns_unavailable_when_all_providers_fail():
    service = QuoteService(FakeProvider())

    result = service.get_quote("missing")

    assert result.symbol == "MISSING"
    assert result.assetType == AssetType.AUTO
    assert result.isAvailable is False
    assert result.currentPrice is None


def test_to_number_handles_dot_and_turkish_decimal_formats():
    assert to_number("20.83928") == 20.83928
    assert to_number("20,83928") == 20.83928
    assert to_number("1.234,56") == 1234.56


def test_search_assets_returns_symbol_prefix_matches_first():
    stock = AssetCatalogItem(
        symbol="THYAO",
        name="Türk Hava Yolları",
        assetType=AssetType.STOCK,
        market="BIST",
        providerSymbol="THYAO",
    )
    fund = AssetCatalogItem(
        symbol="KPA",
        name="Kuveyt Türk Portföy Katılım Hisse Senedi Fonu",
        assetType=AssetType.FUND,
        market="TEFAS",
        providerSymbol="KPA",
        fundType="YAT",
    )
    service = QuoteService(FakeProvider(stock_assets=[stock], yat_fund_assets=[fund]))

    stock_results = service.search_assets("thy")
    fund_results = service.search_assets("katılım", AssetType.FUND)

    assert [asset.symbol for asset in stock_results] == ["THYAO"]
    assert [asset.symbol for asset in fund_results] == ["KPA"]


def test_get_fund_assets_rejects_unknown_fund_type():
    service = QuoteService(FakeProvider())

    assert service.get_fund_assets("INVALID") == []
