namespace PortfolioTracker.API.Features.Portfolio;

public interface IPortfolioPositionRecalculationQueue
{
    ValueTask EnqueueAssetAsync(int assetId, CancellationToken cancellationToken = default);

    ValueTask EnqueueRebuildAllAsync(CancellationToken cancellationToken = default);

    ValueTask<PortfolioPositionRecalculationRequest> DequeueAsync(
        CancellationToken cancellationToken
    );

    ValueTask CompleteAsync(
        PortfolioPositionRecalculationRequest request,
        CancellationToken cancellationToken = default
    );
}

public enum PortfolioPositionRecalculationRequestKind
{
    Asset,
    RebuildAll,
}

public readonly record struct PortfolioPositionRecalculationRequest(
    PortfolioPositionRecalculationRequestKind Kind,
    int? AssetId
)
{
    public static PortfolioPositionRecalculationRequest ForAsset(int assetId) =>
        new(PortfolioPositionRecalculationRequestKind.Asset, assetId);

    public static PortfolioPositionRecalculationRequest RebuildAll() =>
        new(PortfolioPositionRecalculationRequestKind.RebuildAll, null);
}
