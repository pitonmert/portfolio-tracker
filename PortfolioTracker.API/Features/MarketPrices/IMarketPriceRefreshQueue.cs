namespace PortfolioTracker.API.Features.MarketPrices;

public interface IMarketPriceRefreshQueue
{
    ValueTask EnqueueAsync(string symbol, CancellationToken cancellationToken = default);

    ValueTask<string> DequeueAsync(CancellationToken cancellationToken);

    void Complete(string symbol);

    bool IsQueuedOrProcessing(string symbol);
}
