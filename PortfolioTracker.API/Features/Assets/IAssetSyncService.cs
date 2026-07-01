namespace PortfolioTracker.API.Features.Assets;

public interface IAssetSyncService
{
    Task<AssetSyncResult> SyncAsync(CancellationToken cancellationToken = default);
}
