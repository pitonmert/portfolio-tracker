using PortfolioTracker.API.Entities;
using PortfolioTracker.API.Models;

namespace PortfolioTracker.API.Features.Portfolio;

internal static class PortfolioCalculations
{
    private const decimal ClosedPositionTolerance = 0.0001m;

    public static bool IsClosedPosition(decimal netQuantity) =>
        Math.Abs(netQuantity) < ClosedPositionTolerance;

    public static PortfolioPosition CalculatePosition(IGrouping<string, Transaction> group)
    {
        var totalBuyAmount = 0m;
        var totalSellAmount = 0m;
        var runningQuantity = 0m;
        var runningCostBasis = 0m;
        var realizedPnL = 0m;

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
            Symbol = group.Key,
            NetQuantity = runningQuantity,
            AverageCost = IsClosedPosition(runningQuantity)
                ? 0m
                : runningCostBasis / runningQuantity,
            TotalInvested = totalBuyAmount - totalSellAmount,
            RealizedPnL = realizedPnL,
        };
    }
}
