using PortfolioTracker.API.Domain.Entities;
using PortfolioTracker.API.Features.MarketPrices;

namespace PortfolioTracker.API.Features.Portfolio;

internal static class PortfolioCalculations
{
    // Small fractional remnants should not keep a position open.
    private const decimal ClosedPositionTolerance = 0.0001m;

    public static bool IsClosedPosition(decimal netQuantity) =>
        Math.Abs(netQuantity) < ClosedPositionTolerance;

    public static decimal CalculateTransactionTotal(decimal quantity, decimal unitPrice) =>
        quantity * unitPrice;

    public static PortfolioPosition CalculatePosition(IGrouping<int, Transaction> group)
    {
        var asset = group.First().Asset;
        var totalBuyAmount = 0m;
        var totalSellAmount = 0m;
        var runningQuantity = 0m;
        var runningCostBasis = 0m;
        var realizedPnL = 0m;

        // WAC is recalculated from the remaining cost basis after each sell.
        foreach (var transaction in group)
        {
            var transactionAmount = transaction.TotalAmount;

            if (transaction.Type == TransactionType.Buy)
            {
                totalBuyAmount += transactionAmount;
                runningQuantity += transaction.Quantity;
                runningCostBasis += transactionAmount;
                continue;
            }

            totalSellAmount += transactionAmount;

            var runningAverageCost =
                Math.Abs(runningQuantity) < ClosedPositionTolerance
                    ? 0m
                    : runningCostBasis / runningQuantity;
            var realizedCost = transaction.Quantity * runningAverageCost;

            realizedPnL += transactionAmount - realizedCost;
            runningQuantity -= transaction.Quantity;
            runningCostBasis =
                Math.Abs(runningQuantity) < ClosedPositionTolerance
                    ? 0m
                    : Math.Max(0m, runningCostBasis - realizedCost);
        }

        return new PortfolioPosition
        {
            AssetId = group.Key,
            Symbol = asset.Symbol,
            Market = asset.Market,
            NetQuantity = runningQuantity,
            AverageCost = IsClosedPosition(runningQuantity)
                ? 0m
                : runningCostBasis / runningQuantity,
            TotalInvested = totalBuyAmount - totalSellAmount,
            RealizedPnL = realizedPnL,
        };
    }

    public static PortfolioTransactionSummary CalculateTransactionSummary(
        IGrouping<int, Transaction> group
    )
    {
        var position = CalculatePosition(group);
        return new PortfolioTransactionSummary(
            position.AssetId,
            position.Symbol,
            position.NetQuantity,
            group.Max(transaction => transaction.Date),
            !IsClosedPosition(position.NetQuantity)
        );
    }

    public static PortfolioDashboardPosition CalculateDashboardPosition(
        PortfolioPosition position,
        MarketPriceQuote? marketPrice
    )
    {
        var isClosed = IsClosedPosition(position.NetQuantity);
        decimal? currentPrice = null;

        // Missing or unavailable prices should not reuse stale market values.
        if (
            marketPrice?.IsAvailable == true
            && marketPrice.CurrentPrice is decimal price
            && price > 0m
        )
        {
            currentPrice = price;
        }

        if (isClosed)
        {
            return new PortfolioDashboardPosition
            {
                AssetId = position.AssetId,
                Symbol = position.Symbol,
                Market = position.Market,
                NetQuantity = position.NetQuantity,
                AverageCost = position.AverageCost,
                TotalInvested = position.TotalInvested,
                RealizedPnL = position.RealizedPnL,
                ActivePositionCost = 0m,
                CurrentPrice = currentPrice,
                MarketValue = 0m,
                UnrealizedPnL = 0m,
                TotalPnL = position.RealizedPnL,
                PnLPercent = null,
                IsClosed = true,
                MarketPrice = marketPrice,
            };
        }

        var activePositionCost = position.NetQuantity * position.AverageCost;
        var marketValue = currentPrice is null ? 0m : position.NetQuantity * currentPrice.Value;
        var unrealizedPnL = currentPrice is null ? 0m : marketValue - activePositionCost;
        var totalPnL = position.RealizedPnL + unrealizedPnL;

        return new PortfolioDashboardPosition
        {
            AssetId = position.AssetId,
            Symbol = position.Symbol,
            Market = position.Market,
            NetQuantity = position.NetQuantity,
            AverageCost = position.AverageCost,
            TotalInvested = position.TotalInvested,
            RealizedPnL = position.RealizedPnL,
            ActivePositionCost = activePositionCost,
            CurrentPrice = currentPrice,
            MarketValue = marketValue,
            UnrealizedPnL = unrealizedPnL,
            TotalPnL = totalPnL,
            PnLPercent = activePositionCost > 0m ? (totalPnL / activePositionCost) * 100m : null,
            IsClosed = false,
            MarketPrice = marketPrice,
        };
    }

    public static PortfolioDashboardSummary CalculateDashboardSummary(
        IReadOnlyList<PortfolioDashboardPosition> positions,
        decimal cashBalance,
        DateTime cashBalanceUpdatedAt
    )
    {
        var totalMarketValue = positions.Sum(position => position.MarketValue);

        return new PortfolioDashboardSummary
        {
            CashBalance = cashBalance,
            CashBalanceUpdatedAt = cashBalanceUpdatedAt,
            TotalActivePositionCost = positions.Sum(position => position.ActivePositionCost),
            TotalMarketValue = totalMarketValue,
            TotalRealizedPnL = positions.Sum(position => position.RealizedPnL),
            TotalUnrealizedPnL = positions.Sum(position => position.UnrealizedPnL),
            TotalPnL = positions.Sum(position => position.TotalPnL),
            TotalPortfolioValue = totalMarketValue + cashBalance,
        };
    }
}

internal sealed record PortfolioTransactionSummary(
    int AssetId,
    string Symbol,
    decimal NetQuantity,
    DateTime LastUsedAt,
    bool IsOpen
);
