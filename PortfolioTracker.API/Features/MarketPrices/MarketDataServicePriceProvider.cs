using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using PortfolioTracker.API.Features.Assets;
using PortfolioTracker.API.Infrastructure.Persistence;

namespace PortfolioTracker.API.Features.MarketPrices;

public class MarketDataServicePriceProvider(
    HttpClient httpClient,
    ApplicationDbContext context,
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
            var assetMetadata = await ResolveAssetMetadataAsync(
                normalizedSymbol,
                cancellationToken
            );
            var response = await httpClient.GetFromJsonAsync<MarketDataQuoteResponse>(
                $"quotes/{Uri.EscapeDataString(assetMetadata.ProviderSymbol)}?assetType={assetMetadata.AssetType}",
                cancellationToken
            );

            if (response is null)
                return MarketPriceQuote.Unavailable(
                    normalizedSymbol,
                    "Fiyat sağlayıcı boş cevap döndü"
                );

            if (
                !response.IsAvailable
                || response.CurrentPrice is null
                || response.CurrentPrice <= 0
            )
                return MarketPriceQuote.Unavailable(
                    normalizedSymbol,
                    response.Error ?? "Fiyat alınamadı"
                );

            return new MarketPriceQuote
            {
                Symbol = normalizedSymbol,
                CompanyName = string.IsNullOrWhiteSpace(response.Name)
                    ? assetMetadata.Name
                    : response.Name,
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
            logger.LogWarning(
                ex,
                "Market data service quote request failed for {Symbol}",
                normalizedSymbol
            );
            return MarketPriceQuote.Unavailable(normalizedSymbol, "Fiyat sağlayıcıya ulaşılamadı");
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "Market data service quote response could not be read for {Symbol}",
                normalizedSymbol
            );
            return MarketPriceQuote.Unavailable(
                normalizedSymbol,
                "Fiyat sağlayıcı cevabı okunamadı"
            );
        }
    }

    private async Task<AssetMetadata> ResolveAssetMetadataAsync(
        string normalizedSymbol,
        CancellationToken cancellationToken
    )
    {
        var assets = await context
            .Assets.AsNoTracking()
            .Where(asset => asset.IsActive && asset.Symbol == normalizedSymbol)
            .Select(asset => new
            {
                asset.AssetType,
                asset.Market,
                asset.Name,
                asset.ProviderSymbol,
            })
            .ToListAsync(cancellationToken);

        if (assets.Count == 0)
            return new AssetMetadata("auto", normalizedSymbol, null);

        if (assets.Count == 1)
            return new AssetMetadata(assets[0].AssetType, assets[0].ProviderSymbol, assets[0].Name);

        var preferredAssetType =
            normalizedSymbol.Length == 3
                ? assets.FirstOrDefault(asset => asset.AssetType == "fund")?.AssetType
                : assets.FirstOrDefault(asset => asset.AssetType == "stock")?.AssetType;
        var selectedAsset =
            assets.FirstOrDefault(asset => asset.AssetType == preferredAssetType) ?? assets[0];

        return new AssetMetadata(
            selectedAsset.AssetType,
            selectedAsset.ProviderSymbol,
            selectedAsset.Name
        );
    }

    private sealed record AssetMetadata(string AssetType, string ProviderSymbol, string? Name);

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
