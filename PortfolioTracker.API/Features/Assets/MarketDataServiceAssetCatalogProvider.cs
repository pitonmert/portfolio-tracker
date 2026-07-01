using System.Net.Http.Json;

namespace PortfolioTracker.API.Features.Assets;

public class MarketDataServiceAssetCatalogProvider(
    HttpClient httpClient,
    ILogger<MarketDataServiceAssetCatalogProvider> logger
) : IAssetCatalogProvider
{
    public async Task<IReadOnlyList<AssetCatalogItem>> GetStockAssetsAsync(
        CancellationToken cancellationToken = default
    ) => await GetAssetsAsync("assets/stocks", cancellationToken);

    public async Task<IReadOnlyList<AssetCatalogItem>> GetFundAssetsAsync(
        string fundType,
        CancellationToken cancellationToken = default
    )
    {
        var normalizedFundType = AssetSymbols.Normalize(fundType);
        if (normalizedFundType is not ("YAT" or "EMK"))
            return [];

        return await GetAssetsAsync(
            $"assets/funds?fundType={Uri.EscapeDataString(normalizedFundType)}",
            cancellationToken
        );
    }

    private async Task<IReadOnlyList<AssetCatalogItem>> GetAssetsAsync(
        string path,
        CancellationToken cancellationToken
    )
    {
        try
        {
            return await httpClient.GetFromJsonAsync<List<AssetCatalogItem>>(
                    path,
                    cancellationToken
                ) ?? [];
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            logger.LogWarning(ex, "Market data service asset catalog request failed");
            return [];
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Market data service asset catalog response could not be read");
            return [];
        }
    }
}
