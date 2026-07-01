namespace PortfolioTracker.API.Features.MarketPrices;

public record MarketPriceQuote
{
    public string Symbol { get; init; } = string.Empty;

    public string? CompanyName { get; init; }

    public decimal? CurrentPrice { get; init; }

    public decimal? DayHigh { get; init; }

    public decimal? DayLow { get; init; }

    public decimal? MarketCap { get; init; }

    public DateTime? FetchedAt { get; init; }

    public int? DelayMinutes { get; init; }

    public bool IsAvailable { get; init; }

    public bool IsManual { get; init; }

    public bool IsRefreshing { get; init; }

    public DateTime? ManualUpdatedAt { get; init; }

    public string? Error { get; init; }

    public static MarketPriceQuote Unavailable(
        string symbol,
        string? error = null,
        bool isRefreshing = false
    )
    {
        var normalizedSymbol = MarketPriceSymbols.Normalize(symbol);

        return new MarketPriceQuote
        {
            Symbol = normalizedSymbol,
            IsAvailable = false,
            IsManual = false,
            IsRefreshing = isRefreshing,
            Error = error ?? "Fiyat alınamadı",
        };
    }
}
