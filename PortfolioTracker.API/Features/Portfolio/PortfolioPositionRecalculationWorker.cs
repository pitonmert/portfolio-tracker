namespace PortfolioTracker.API.Features.Portfolio;

// Runs recalculation jobs outside the write request that triggered them.
public class PortfolioPositionRecalculationWorker(
    IPortfolioPositionRecalculationQueue queue,
    IServiceScopeFactory scopeFactory,
    ILogger<PortfolioPositionRecalculationWorker> logger
) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var request = default(PortfolioPositionRecalculationRequest);

            try
            {
                request = await queue.DequeueAsync(stoppingToken);

                using var scope = scopeFactory.CreateScope();
                var recalculationService =
                    scope.ServiceProvider.GetRequiredService<IPortfolioPositionRecalculationService>();

                if (request.Kind == PortfolioPositionRecalculationRequestKind.RebuildAll)
                {
                    await recalculationService.RebuildAllAsync(stoppingToken);
                }
                else if (request.AssetId is int assetId)
                {
                    await recalculationService.RecalculateAssetAsync(assetId, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogWarning(
                    ex,
                    "Portfolio position recalculation failed for request {Request}",
                    request
                );
            }
            finally
            {
                await queue.CompleteAsync(request, CancellationToken.None);
            }
        }
    }
}
