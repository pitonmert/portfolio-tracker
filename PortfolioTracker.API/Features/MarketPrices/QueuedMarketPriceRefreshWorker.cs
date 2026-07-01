namespace PortfolioTracker.API.Features.MarketPrices;

public class QueuedMarketPriceRefreshWorker(
    IMarketPriceRefreshQueue queue,
    IServiceScopeFactory scopeFactory,
    ILogger<QueuedMarketPriceRefreshWorker> logger
) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            string? symbol = null;

            try
            {
                symbol = await queue.DequeueAsync(stoppingToken);

                using var scope = scopeFactory.CreateScope();
                var marketPriceService =
                    scope.ServiceProvider.GetRequiredService<IMarketPriceService>();
                await marketPriceService.RefreshSymbolAsync(symbol, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Queued market price refresh failed for {Symbol}", symbol);
            }
            finally
            {
                if (!string.IsNullOrWhiteSpace(symbol))
                    queue.Complete(symbol);
            }
        }
    }
}
