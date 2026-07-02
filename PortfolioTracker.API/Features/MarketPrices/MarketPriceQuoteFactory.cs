using PortfolioTracker.API.Domain.Entities;

namespace PortfolioTracker.API.Features.MarketPrices;

internal static class MarketPriceQuoteFactory
{
    public static MarketPriceQuote ToQuote(MarketPrice price, bool isRefreshing = false)
    {
        var symbol = price.Asset?.Symbol ?? price.Symbol;
        var companyName = price.Asset?.Name;

        if (!price.IsAvailable || price.CurrentPrice is null || price.CurrentPrice <= 0)
            return new MarketPriceQuote
            {
                Symbol = symbol,
                CompanyName = companyName,
                IsAvailable = false,
                IsManual = price.IsManual,
                IsRefreshing = isRefreshing,
                ManualUpdatedAt = price.ManualUpdatedAt,
                Error = price.Error ?? "Price could not be fetched",
            };

        return new MarketPriceQuote
        {
            Symbol = symbol,
            CompanyName = companyName,
            CurrentPrice = price.CurrentPrice,
            DayHigh = price.DayHigh,
            DayLow = price.DayLow,
            MarketCap = price.MarketCap,
            FetchedAt = price.FetchedAt,
            DelayMinutes = CalculateDelayMinutes(price.FetchedAt),
            IsAvailable = true,
            IsManual = price.IsManual,
            IsRefreshing = isRefreshing,
            ManualUpdatedAt = price.ManualUpdatedAt,
            Error = price.Error,
        };
    }

    private static int? CalculateDelayMinutes(DateTime? fetchedAt) =>
        fetchedAt is null
            ? null
            : Math.Max(0, (int)Math.Floor((DateTime.UtcNow - fetchedAt.Value).TotalMinutes));
}
