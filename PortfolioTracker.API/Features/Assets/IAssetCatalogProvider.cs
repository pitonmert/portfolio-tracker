namespace PortfolioTracker.API.Features.Assets;

public interface IAssetCatalogProvider
{
    Task<IReadOnlyList<AssetCatalogItem>> GetStockAssetsAsync(
        CancellationToken cancellationToken = default
    );

    Task<IReadOnlyList<AssetCatalogItem>> GetFundAssetsAsync(
        string fundType,
        CancellationToken cancellationToken = default
    );
}
