using System.Collections.Concurrent;
using System.Threading.Channels;

namespace PortfolioTracker.API.Features.Portfolio;

// Serializes portfolio read-model updates and drops duplicate asset work while it is pending.
public class PortfolioPositionRecalculationQueue : IPortfolioPositionRecalculationQueue
{
    private readonly Channel<PortfolioPositionRecalculationRequest> _queue =
        Channel.CreateUnbounded<PortfolioPositionRecalculationRequest>(
            new UnboundedChannelOptions { SingleReader = true, SingleWriter = false }
        );
    private readonly ConcurrentDictionary<int, byte> _pendingAssets = [];
    private readonly ConcurrentDictionary<int, byte> _processingAssets = [];
    private readonly ConcurrentDictionary<int, byte> _dirtyProcessingAssets = [];
    private int _rebuildPending;

    public async ValueTask EnqueueAssetAsync(
        int assetId,
        CancellationToken cancellationToken = default
    )
    {
        if (assetId <= 0)
            return;

        if (_pendingAssets.ContainsKey(assetId))
            return;

        if (_processingAssets.ContainsKey(assetId))
        {
            // The current run will finish first, then the dirty asset is queued once more.
            _dirtyProcessingAssets.TryAdd(assetId, 0);
            return;
        }

        if (!_pendingAssets.TryAdd(assetId, 0))
            return;

        await _queue.Writer.WriteAsync(
            PortfolioPositionRecalculationRequest.ForAsset(assetId),
            cancellationToken
        );
    }

    public async ValueTask EnqueueRebuildAllAsync(CancellationToken cancellationToken = default)
    {
        if (Interlocked.Exchange(ref _rebuildPending, 1) == 1)
            return;

        await _queue.Writer.WriteAsync(
            PortfolioPositionRecalculationRequest.RebuildAll(),
            cancellationToken
        );
    }

    public async ValueTask<PortfolioPositionRecalculationRequest> DequeueAsync(
        CancellationToken cancellationToken
    )
    {
        var request = await _queue.Reader.ReadAsync(cancellationToken);

        if (
            request.Kind == PortfolioPositionRecalculationRequestKind.Asset
            && request.AssetId is int assetId
        )
        {
            _pendingAssets.TryRemove(assetId, out _);
            _processingAssets.TryAdd(assetId, 0);
        }
        else
        {
            Interlocked.Exchange(ref _rebuildPending, 0);
        }

        return request;
    }

    public async ValueTask CompleteAsync(
        PortfolioPositionRecalculationRequest request,
        CancellationToken cancellationToken = default
    )
    {
        if (
            request.Kind != PortfolioPositionRecalculationRequestKind.Asset
            || request.AssetId is not int assetId
        )
        {
            return;
        }

        _processingAssets.TryRemove(assetId, out _);

        if (_dirtyProcessingAssets.TryRemove(assetId, out _))
            await EnqueueAssetAsync(assetId, cancellationToken);
    }
}
