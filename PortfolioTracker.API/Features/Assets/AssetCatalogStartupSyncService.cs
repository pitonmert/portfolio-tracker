namespace PortfolioTracker.API.Features.Assets;

public class AssetCatalogStartupSyncService(
    IServiceProvider serviceProvider,
    IConfiguration configuration,
    ILogger<AssetCatalogStartupSyncService> logger
) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!configuration.GetValue("Assets:StartupSync", true))
            return;

        try
        {
            await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);

            using var scope = serviceProvider.CreateScope();
            var syncService = scope.ServiceProvider.GetRequiredService<IAssetSyncService>();
            var result = await syncService.SyncAsync(stoppingToken);

            logger.LogInformation(
                "Asset catalog startup sync completed. Received: {Received}, Upserted: {Upserted}",
                result.Received,
                result.Upserted
            );
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Asset catalog startup sync failed");
        }
    }
}
