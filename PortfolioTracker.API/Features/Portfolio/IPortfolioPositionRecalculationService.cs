namespace PortfolioTracker.API.Features.Portfolio;

public interface IPortfolioPositionRecalculationService
{
    Task RecalculateAssetAsync(int assetId, CancellationToken cancellationToken);

    Task RebuildAllAsync(CancellationToken cancellationToken);
}
