namespace PortfolioTracker.API.Features.Assets;

public sealed record AssetSyncResult(int Received, int Upserted, DateTime SyncedAt);
