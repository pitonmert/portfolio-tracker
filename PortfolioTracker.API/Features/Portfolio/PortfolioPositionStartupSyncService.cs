using Microsoft.EntityFrameworkCore;
using PortfolioTracker.API.Infrastructure.Persistence;

namespace PortfolioTracker.API.Features.Portfolio;

public class PortfolioPositionStartupSyncService(
    IServiceProvider serviceProvider,
    IConfiguration configuration,
    ILogger<PortfolioPositionStartupSyncService> logger
) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!configuration.GetValue("PortfolioPositions:StartupSync", true))
            return;

        try
        {
            await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);

            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var queue =
                scope.ServiceProvider.GetRequiredService<IPortfolioPositionRecalculationQueue>();

            var assetIdsWithTransactions = await context
                .Transactions.AsNoTracking()
                .Select(transaction => transaction.AssetId)
                .Distinct()
                .ToListAsync(stoppingToken);
            var snapshotAssetIds = await context
                .PortfolioPositions.AsNoTracking()
                .Select(position => position.AssetId)
                .ToListAsync(stoppingToken);
            var missingAssetIds = assetIdsWithTransactions
                .Except(snapshotAssetIds)
                .OrderBy(assetId => assetId)
                .ToList();

            // Startup sync is idempotent and only fills missing snapshots.
            foreach (var assetId in missingAssetIds)
            {
                await queue.EnqueueAssetAsync(assetId, stoppingToken);
            }

            logger.LogInformation(
                "Portfolio position startup sync queued {Count} missing snapshots",
                missingAssetIds.Count
            );
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Portfolio position startup sync failed");
        }
    }
}
