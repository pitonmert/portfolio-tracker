namespace PortfolioTracker.API.Features.Assets;

public interface IAssetSearchService
{
    Task<IReadOnlyList<AssetSearchResult>> SearchAsync(
        string query,
        string assetType = "auto",
        int limit = 8,
        CancellationToken cancellationToken = default
    );
}
