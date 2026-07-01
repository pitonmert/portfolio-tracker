using Microsoft.Extensions.Options;

namespace PortfolioTracker.API.Features.MarketPrices;

public class MarketPriceRefreshWorker(
    IServiceScopeFactory scopeFactory,
    IOptions<MarketDataServiceOptions> options,
    ILogger<MarketPriceRefreshWorker> logger
) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await RefreshAsync(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(GetRefreshInterval(), stoppingToken);
                await RefreshAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }

    private async Task RefreshAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var marketPriceService =
                scope.ServiceProvider.GetRequiredService<IMarketPriceService>();
            await marketPriceService.RefreshActiveSymbolsAsync(cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Periodic market price refresh failed");
        }
    }

    private TimeSpan GetRefreshInterval() =>
        TimeSpan.FromMinutes(Math.Max(1, options.Value.RefreshIntervalMinutes));
}

