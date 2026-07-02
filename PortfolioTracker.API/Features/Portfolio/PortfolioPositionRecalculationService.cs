using Microsoft.EntityFrameworkCore;
using PortfolioTracker.API.Domain.Entities;
using PortfolioTracker.API.Features.MarketPrices;
using PortfolioTracker.API.Infrastructure.Persistence;

namespace PortfolioTracker.API.Features.Portfolio;

public class PortfolioPositionRecalculationService(ApplicationDbContext context)
    : IPortfolioPositionRecalculationService
{
    public async Task RecalculateAssetAsync(int assetId, CancellationToken cancellationToken)
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

        if (transactions.Count == 0)
        {
            // A deleted last transaction removes the rebuildable read-model row.
            await context
                .PortfolioPositions.Where(position => position.AssetId == assetId)
                .ExecuteDeleteAsync(cancellationToken);
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

        var snapshot = CreateSnapshot(
            assetId,
            dashboardPosition,
            transactions.Max(transaction => transaction.Date),
            marketPrice?.ManualUpdatedAt ?? marketPrice?.FetchedAt,
            DateTime.UtcNow
        );

        await UpsertSnapshotAsync(snapshot, cancellationToken);
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

    private static PortfolioPositionSnapshot CreateSnapshot(
        int assetId,
        PortfolioDashboardPosition position,
        DateTime lastTransactionAt,
        DateTime? priceUpdatedAt,
        DateTime calculatedAt
    )
    {
        return new PortfolioPositionSnapshot
        {
            AssetId = assetId,
            Symbol = position.Symbol,
            Market = position.Market,
            NetQuantity = position.NetQuantity,
            AverageCost = position.AverageCost,
            TotalInvested = position.TotalInvested,
            RealizedPnL = position.RealizedPnL,
            ActivePositionCost = position.ActivePositionCost,
            CurrentPrice = position.CurrentPrice,
            MarketValue = position.MarketValue,
            UnrealizedPnL = position.UnrealizedPnL,
            TotalPnL = position.TotalPnL,
            PnLPercent = position.PnLPercent,
            IsClosed = position.IsClosed,
            LastTransactionAt = lastTransactionAt,
            PriceUpdatedAt = priceUpdatedAt,
            CalculatedAt = calculatedAt,
        };
    }

    private async Task UpsertSnapshotAsync(
        PortfolioPositionSnapshot snapshot,
        CancellationToken cancellationToken
    )
    {
        await context.Database.ExecuteSqlInterpolatedAsync(
            $"""
            INSERT INTO "PortfolioPositions" (
                "AssetId",
                "Symbol",
                "Market",
                "NetQuantity",
                "AverageCost",
                "TotalInvested",
                "RealizedPnL",
                "ActivePositionCost",
                "CurrentPrice",
                "MarketValue",
                "UnrealizedPnL",
                "TotalPnL",
                "PnLPercent",
                "IsClosed",
                "LastTransactionAt",
                "PriceUpdatedAt",
                "CalculatedAt"
            )
            VALUES (
                {snapshot.AssetId},
                {snapshot.Symbol},
                {snapshot.Market},
                {snapshot.NetQuantity},
                {snapshot.AverageCost},
                {snapshot.TotalInvested},
                {snapshot.RealizedPnL},
                {snapshot.ActivePositionCost},
                {snapshot.CurrentPrice},
                {snapshot.MarketValue},
                {snapshot.UnrealizedPnL},
                {snapshot.TotalPnL},
                {snapshot.PnLPercent},
                {snapshot.IsClosed},
                {snapshot.LastTransactionAt},
                {snapshot.PriceUpdatedAt},
                {snapshot.CalculatedAt}
            )
            ON CONFLICT ("AssetId") DO UPDATE SET
                "Symbol" = EXCLUDED."Symbol",
                "Market" = EXCLUDED."Market",
                "NetQuantity" = EXCLUDED."NetQuantity",
                "AverageCost" = EXCLUDED."AverageCost",
                "TotalInvested" = EXCLUDED."TotalInvested",
                "RealizedPnL" = EXCLUDED."RealizedPnL",
                "ActivePositionCost" = EXCLUDED."ActivePositionCost",
                "CurrentPrice" = EXCLUDED."CurrentPrice",
                "MarketValue" = EXCLUDED."MarketValue",
                "UnrealizedPnL" = EXCLUDED."UnrealizedPnL",
                "TotalPnL" = EXCLUDED."TotalPnL",
                "PnLPercent" = EXCLUDED."PnLPercent",
                "IsClosed" = EXCLUDED."IsClosed",
                "LastTransactionAt" = EXCLUDED."LastTransactionAt",
                "PriceUpdatedAt" = EXCLUDED."PriceUpdatedAt",
                "CalculatedAt" = EXCLUDED."CalculatedAt";
            """,
            cancellationToken
        );
    }
}
