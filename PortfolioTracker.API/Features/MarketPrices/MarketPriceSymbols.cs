namespace PortfolioTracker.API.Features.MarketPrices;

public static class MarketPriceSymbols
{
    public static string Normalize(string symbol) =>
        string.IsNullOrWhiteSpace(symbol) ? string.Empty : symbol.Trim().ToUpperInvariant();
}
