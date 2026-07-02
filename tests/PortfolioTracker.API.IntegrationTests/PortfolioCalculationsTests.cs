using PortfolioTracker.API.Domain.Entities;
using PortfolioTracker.API.Features.MarketPrices;
using PortfolioTracker.API.Features.Portfolio;

namespace PortfolioTracker.API.IntegrationTests;

public class PortfolioCalculationsTests
{
    [Fact]
    public void CalculatePosition_WithPartialSell_UsesWeightedAverageCost()
    {
        var asset = CreateAsset();
        var transactions = new[]
        {
            CreateTransaction(asset, 1, TransactionType.Buy, 10m, 100m),
            CreateTransaction(asset, 2, TransactionType.Buy, 10m, 200m),
            CreateTransaction(asset, 3, TransactionType.Sell, 5m, 180m),
        };

        var position = PortfolioCalculations.CalculatePosition(GroupTransactions(transactions));

        Assert.Equal(15m, position.NetQuantity);
        Assert.Equal(150m, position.AverageCost);
        Assert.Equal(2100m, position.TotalInvested);
        Assert.Equal(150m, position.RealizedPnL);
    }

    [Fact]
    public void CalculatePosition_WhenQuantityIsWithinTolerance_TreatsPositionAsClosed()
    {
        var asset = CreateAsset();
        var transactions = new[]
        {
            CreateTransaction(asset, 1, TransactionType.Buy, 1m, 100m),
            CreateTransaction(asset, 2, TransactionType.Sell, 0.99995m, 100m),
        };

        var position = PortfolioCalculations.CalculatePosition(GroupTransactions(transactions));

        Assert.True(PortfolioCalculations.IsClosedPosition(position.NetQuantity));
        Assert.Equal(0m, position.AverageCost);
    }

    [Fact]
    public void CalculateDashboardPosition_WhenPriceIsMissing_FallsBackToZeroMarketMetrics()
    {
        var position = new PortfolioPosition
        {
            AssetId = 1,
            Symbol = "TEST",
            Market = "BIST",
            NetQuantity = 2m,
            AverageCost = 25m,
            TotalInvested = 50m,
            RealizedPnL = 0m,
        };
        var quote = MarketPriceQuote.Unavailable("TEST");

        var dashboardPosition = PortfolioCalculations.CalculateDashboardPosition(position, quote);

        Assert.False(dashboardPosition.IsClosed);
        Assert.Equal(50m, dashboardPosition.ActivePositionCost);
        Assert.Null(dashboardPosition.CurrentPrice);
        Assert.Equal(0m, dashboardPosition.MarketValue);
        Assert.Equal(0m, dashboardPosition.UnrealizedPnL);
        Assert.Equal(0m, dashboardPosition.TotalPnL);
        Assert.Equal(0m, dashboardPosition.PnLPercent);
    }

    [Fact]
    public void CalculateDashboardSummary_SumsPositionsAndCashBalance()
    {
        var updatedAt = new DateTime(2026, 7, 1, 12, 0, 0, DateTimeKind.Utc);
        var positions = new[]
        {
            new PortfolioDashboardPosition
            {
                ActivePositionCost = 100m,
                MarketValue = 150m,
                RealizedPnL = 10m,
                UnrealizedPnL = 50m,
                TotalPnL = 60m,
            },
            new PortfolioDashboardPosition
            {
                ActivePositionCost = 200m,
                MarketValue = 180m,
                RealizedPnL = -5m,
                UnrealizedPnL = -20m,
                TotalPnL = -25m,
            },
        };

        var summary = PortfolioCalculations.CalculateDashboardSummary(positions, 20m, updatedAt);

        Assert.Equal(20m, summary.CashBalance);
        Assert.Equal(updatedAt, summary.CashBalanceUpdatedAt);
        Assert.Equal(300m, summary.TotalActivePositionCost);
        Assert.Equal(330m, summary.TotalMarketValue);
        Assert.Equal(5m, summary.TotalRealizedPnL);
        Assert.Equal(30m, summary.TotalUnrealizedPnL);
        Assert.Equal(35m, summary.TotalPnL);
        Assert.Equal(350m, summary.TotalPortfolioValue);
    }

    private static Asset CreateAsset() =>
        new()
        {
            Id = 1,
            Symbol = "TEST",
            AssetType = "stock",
            Market = "BIST",
            Currency = "TRY",
            ProviderSymbol = "TEST",
            Source = "test",
        };

    private static Transaction CreateTransaction(
        Asset asset,
        int id,
        TransactionType type,
        decimal quantity,
        decimal unitPrice
    ) =>
        new()
        {
            Id = id,
            AssetId = asset.Id,
            Asset = asset,
            Type = type,
            Quantity = quantity,
            UnitPrice = unitPrice,
            TotalAmount = PortfolioCalculations.CalculateTransactionTotal(quantity, unitPrice),
            Date = new DateTime(2026, 7, 1, 9, 0, 0, DateTimeKind.Utc).AddMinutes(id),
        };

    private static IGrouping<int, Transaction> GroupTransactions(
        IEnumerable<Transaction> transactions
    ) =>
        transactions
            .OrderBy(transaction => transaction.Date)
            .ThenBy(transaction => transaction.Id)
            .GroupBy(transaction => transaction.AssetId)
            .Single();
}
