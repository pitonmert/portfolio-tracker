using Microsoft.EntityFrameworkCore;
using Npgsql;
using PortfolioTracker.API.Domain.Entities;
using PortfolioTracker.API.Features.MarketPrices;
using PortfolioTracker.API.Infrastructure.Persistence;

namespace PortfolioTracker.API.Features.Portfolio;

public class PortfolioPositionRecalculationService(ApplicationDbContext context)
    : IPortfolioPositionRecalculationService
{
    public async Task RecalculateAssetAsync(int assetId, CancellationToken cancellationToken)
    {
        for (var attempt = 0; attempt < 2; attempt++)
        {
            try
            {
                await RecalculateAssetCoreAsync(assetId, cancellationToken);
                return;
            }
            catch (DbUpdateException ex) when (IsUniqueViolation(ex) && attempt == 0)
            {
                // A concurrent insert can win the race; reload state and apply the snapshot again.
                context.ChangeTracker.Clear();
            }
        }

        await RecalculateAssetCoreAsync(assetId, cancellationToken);
    }

    private async Task RecalculateAssetCoreAsync(int assetId, CancellationToken cancellationToken)
    {
        if (assetId <= 0)
            return;

        var transactions = await context
            .Transactions.AsNoTracking()
            .Include(transaction => transaction.Asset)
            .Where(transaction => transaction.AssetId == assetId)
            .OrderBy(transaction => transaction.Date)
            .ThenBy(transaction => transaction.Id)
            .ToListAsync(cancellationToken);

        var snapshot = await context.PortfolioPositions.FirstOrDefaultAsync(
            position => position.AssetId == assetId,
            cancellationToken
        );

        if (transactions.Count == 0)
        {
            // A deleted last transaction removes the rebuildable read-model row.
            if (snapshot is not null)
            {
                context.PortfolioPositions.Remove(snapshot);
                await context.SaveChangesAsync(cancellationToken);
            }

            return;
        }

        var position = PortfolioCalculations.CalculatePosition(
            transactions.GroupBy(transaction => transaction.AssetId).Single()
        );
        var marketPrice = await context
            .MarketPrices.AsNoTracking()
            .Include(price => price.Asset)
            .FirstOrDefaultAsync(price => price.AssetId == assetId, cancellationToken);
        var quote = marketPrice is null ? null : MarketPriceQuoteFactory.ToQuote(marketPrice);
        var dashboardPosition = PortfolioCalculations.CalculateDashboardPosition(position, quote);

        snapshot ??= new PortfolioPositionSnapshot { AssetId = assetId };
        ApplySnapshot(
            snapshot,
            dashboardPosition,
            transactions.Max(transaction => transaction.Date),
            marketPrice?.ManualUpdatedAt ?? marketPrice?.FetchedAt,
            DateTime.UtcNow
        );

        if (context.Entry(snapshot).State == EntityState.Detached)
            context.PortfolioPositions.Add(snapshot);

        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task RebuildAllAsync(CancellationToken cancellationToken)
    {
        var assetIds = await context
            .Transactions.AsNoTracking()
            .Select(transaction => transaction.AssetId)
            .Distinct()
            .OrderBy(assetId => assetId)
            .ToListAsync(cancellationToken);
        var assetIdSet = assetIds.ToHashSet();

        var staleSnapshots = await context
            .PortfolioPositions.Where(position => !assetIdSet.Contains(position.AssetId))
            .ToListAsync(cancellationToken);
        if (staleSnapshots.Count > 0)
        {
            // Rebuilds also clean rows left behind by direct database imports or manual edits.
            context.PortfolioPositions.RemoveRange(staleSnapshots);
            await context.SaveChangesAsync(cancellationToken);
        }

        foreach (var assetId in assetIds)
        {
            await RecalculateAssetAsync(assetId, cancellationToken);
        }
    }

    private static void ApplySnapshot(
        PortfolioPositionSnapshot snapshot,
        PortfolioDashboardPosition position,
        DateTime lastTransactionAt,
        DateTime? priceUpdatedAt,
        DateTime calculatedAt
    )
    {
        snapshot.Symbol = position.Symbol;
        snapshot.Market = position.Market;
        snapshot.NetQuantity = position.NetQuantity;
        snapshot.AverageCost = position.AverageCost;
        snapshot.TotalInvested = position.TotalInvested;
        snapshot.RealizedPnL = position.RealizedPnL;
        snapshot.ActivePositionCost = position.ActivePositionCost;
        snapshot.CurrentPrice = position.CurrentPrice;
        snapshot.MarketValue = position.MarketValue;
        snapshot.UnrealizedPnL = position.UnrealizedPnL;
        snapshot.TotalPnL = position.TotalPnL;
        snapshot.PnLPercent = position.PnLPercent;
        snapshot.IsClosed = position.IsClosed;
        snapshot.LastTransactionAt = lastTransactionAt;
        snapshot.PriceUpdatedAt = priceUpdatedAt;
        snapshot.CalculatedAt = calculatedAt;
    }

    private static bool IsUniqueViolation(DbUpdateException exception) =>
        exception.InnerException is PostgresException postgresException
        && postgresException.SqlState == PostgresErrorCodes.UniqueViolation;
}
