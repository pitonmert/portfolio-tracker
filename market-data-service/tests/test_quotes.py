from app.models import AssetType, QuoteResponse
from app.providers.borsapy_provider import to_number
from app.services.quote_service import QuoteService


class FakeProvider:
    def __init__(self, stock_quote=None, fund_quote=None):
        self.stock_quote = stock_quote
        self.fund_quote = fund_quote
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
