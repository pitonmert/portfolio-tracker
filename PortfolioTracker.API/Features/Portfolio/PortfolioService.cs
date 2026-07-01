using Microsoft.EntityFrameworkCore;
using PortfolioTracker.API.Domain.Entities;
using PortfolioTracker.API.Features.MarketPrices;
using PortfolioTracker.API.Infrastructure.Persistence;

namespace PortfolioTracker.API.Features.Portfolio;

public class PortfolioService(ApplicationDbContext context, IMarketPriceService marketPriceService)
    : IPortfolioService
{
    public async Task<IReadOnlyList<PortfolioPosition>> GetPositionsAsync(
        CancellationToken cancellationToken = default
    )
    {
        var snapshots = await GetSnapshotsCoreAsync(cancellationToken);
        return snapshots.Select(ToPortfolioPosition).ToList();
    }

    public async Task<PortfolioDashboardResponse> GetDashboardAsync(
        CancellationToken cancellationToken = default
    )
    {
        var snapshots = await GetSnapshotsCoreAsync(cancellationToken);
        var quotesByAssetId = await marketPriceService.GetQuotesByAssetIdsAsync(
            snapshots.Where(s => !s.IsClosed).Select(snapshot => snapshot.AssetId),
            cancellationToken
        );

        var dashboardPositions = snapshots
            .Select(snapshot =>
            {
                quotesByAssetId.TryGetValue(snapshot.AssetId, out var quote);
                return ToDashboardPosition(snapshot, quote);
            })
            .ToList();

        var cashBalance = await GetCashBalanceAsync(cancellationToken);

        return new PortfolioDashboardResponse
        {
            Positions = dashboardPositions,
            Summary = PortfolioCalculations.CalculateDashboardSummary(
                dashboardPositions,
                cashBalance.CashBalance,
                cashBalance.UpdatedAt
            ),
        };
    }

    public async Task<PortfolioCashBalanceResponse> GetCashBalanceAsync(
        CancellationToken cancellationToken = default
    )
    {
        var settings = await GetSettingsAsync(cancellationToken);
        return ToCashBalanceResponse(settings);
    }

    public async Task<PortfolioCashBalanceResponse> UpdateCashBalanceAsync(
        decimal cashBalance,
        CancellationToken cancellationToken = default
    )
    {
        if (cashBalance < 0m)
            throw new ArgumentOutOfRangeException(nameof(cashBalance), "Bakiye negatif olamaz.");

        var settings = await GetSettingsAsync(cancellationToken);
        settings.CashBalance = cashBalance;
        settings.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        return ToCashBalanceResponse(settings);
    }

    private async Task<IReadOnlyList<PortfolioPositionSnapshot>> GetSnapshotsCoreAsync(
        CancellationToken cancellationToken
    ) =>
        await context
            .PortfolioPositions.AsNoTracking()
            .OrderBy(position => position.Symbol)
            .ThenBy(position => position.AssetId)
            .ToListAsync(cancellationToken);

    private async Task<PortfolioSettings> GetSettingsAsync(CancellationToken cancellationToken)
    {
        var settings = await context
            .PortfolioSettings.OrderBy(settings => settings.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (settings is not null)
            return settings;

        settings = new PortfolioSettings { CashBalance = 0m, UpdatedAt = DateTime.UtcNow };

        await context.PortfolioSettings.AddAsync(settings, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return settings;
    }

    private static PortfolioCashBalanceResponse ToCashBalanceResponse(PortfolioSettings settings) =>
        new(settings.CashBalance, settings.UpdatedAt);

    private static PortfolioPosition ToPortfolioPosition(PortfolioPositionSnapshot snapshot) =>
        new()
        {
            AssetId = snapshot.AssetId,
            Symbol = snapshot.Symbol,
            Market = snapshot.Market,
            NetQuantity = snapshot.NetQuantity,
            AverageCost = snapshot.AverageCost,
            TotalInvested = snapshot.TotalInvested,
            RealizedPnL = snapshot.RealizedPnL,
        };

    private static PortfolioDashboardPosition ToDashboardPosition(
        PortfolioPositionSnapshot snapshot,
        MarketPriceQuote? marketPrice
    ) =>
        new()
        {
            AssetId = snapshot.AssetId,
            Symbol = snapshot.Symbol,
            Market = snapshot.Market,
            NetQuantity = snapshot.NetQuantity,
            AverageCost = snapshot.AverageCost,
            TotalInvested = snapshot.TotalInvested,
            RealizedPnL = snapshot.RealizedPnL,
            ActivePositionCost = snapshot.ActivePositionCost,
            CurrentPrice = snapshot.CurrentPrice,
            MarketValue = snapshot.MarketValue,
            UnrealizedPnL = snapshot.UnrealizedPnL,
            TotalPnL = snapshot.TotalPnL,
            PnLPercent = snapshot.PnLPercent,
            IsClosed = snapshot.IsClosed,
            MarketPrice = marketPrice,
        };
}
