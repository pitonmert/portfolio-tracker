using System.Net.Http.Json;

namespace PortfolioTracker.API.Features.MarketPrices;

public class MarketDataServicePriceProvider(
    HttpClient httpClient,
    ILogger<MarketDataServicePriceProvider> logger
) : IMarketPriceProvider
{
    public async Task<MarketPriceQuote> GetQuoteAsync(
        string symbol,
        CancellationToken cancellationToken
    )
    {
        var normalizedSymbol = MarketPriceSymbols.Normalize(symbol);
        if (string.IsNullOrWhiteSpace(normalizedSymbol))
            return MarketPriceQuote.Unavailable(normalizedSymbol);

        try
        {
            var response = await httpClient.GetFromJsonAsync<MarketDataQuoteResponse>(
                $"quotes/{Uri.EscapeDataString(normalizedSymbol)}?assetType=auto",
                cancellationToken
            );

            if (response is null)
                return MarketPriceQuote.Unavailable(
                    normalizedSymbol,
                    "Fiyat sağlayıcı boş cevap döndü"
                );

            if (!response.IsAvailable || response.CurrentPrice is null || response.CurrentPrice <= 0)
                return MarketPriceQuote.Unavailable(
                    normalizedSymbol,
                    response.Error ?? "Fiyat alınamadı"
                );

            var responseSymbol = MarketPriceSymbols.Normalize(response.Symbol);

            return new MarketPriceQuote
            {
                Symbol = string.IsNullOrWhiteSpace(responseSymbol)
                    ? normalizedSymbol
                    : responseSymbol,
                CompanyName = response.Name,
                CurrentPrice = response.CurrentPrice,
                FetchedAt = response.FetchedAt ?? DateTime.UtcNow,
                DelayMinutes = 0,
                IsAvailable = true,
                IsManual = false,
                IsRefreshing = false,
                Error = null,
            };
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            logger.LogWarning(ex, "Market data service quote request failed for {Symbol}", normalizedSymbol);
            return MarketPriceQuote.Unavailable(
                normalizedSymbol,
                "Fiyat sağlayıcıya ulaşılamadı"
            );
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Market data service quote response could not be read for {Symbol}", normalizedSymbol);
            return MarketPriceQuote.Unavailable(
                normalizedSymbol,
                "Fiyat sağlayıcı cevabı okunamadı"
            );
        }
    }

    private sealed record MarketDataQuoteResponse
    {
        public string Symbol { get; init; } = string.Empty;

        public string? AssetType { get; init; }

        public string? Name { get; init; }

        public decimal? CurrentPrice { get; init; }

        public string? Currency { get; init; }

        public DateTime? FetchedAt { get; init; }

        public string? Source { get; init; }

        public bool IsAvailable { get; init; }

        public string? Error { get; init; }
    }
}
