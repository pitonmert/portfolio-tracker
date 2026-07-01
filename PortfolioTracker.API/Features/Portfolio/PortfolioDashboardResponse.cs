using PortfolioTracker.API.Features.MarketPrices;

namespace PortfolioTracker.API.Features.Portfolio;

public record PortfolioDashboardResponse
{
    public IReadOnlyList<PortfolioDashboardPosition> Positions { get; init; } = [];

    public PortfolioDashboardSummary Summary { get; init; } = new();
}

public record PortfolioDashboardPosition
{
    public int AssetId { get; init; }

    public string Symbol { get; init; } = string.Empty;

    public string? Market { get; init; }

    public decimal NetQuantity { get; init; }

    public decimal AverageCost { get; init; }

    public decimal TotalInvested { get; init; }

    public decimal RealizedPnL { get; init; }

    public decimal ActivePositionCost { get; init; }

    public decimal? CurrentPrice { get; init; }

    public decimal MarketValue { get; init; }

    public decimal UnrealizedPnL { get; init; }

    public decimal TotalPnL { get; init; }

    public decimal? PnLPercent { get; init; }

    public bool IsClosed { get; init; }

    public MarketPriceQuote? MarketPrice { get; init; }
}

public record PortfolioDashboardSummary
{
    public decimal CashBalance { get; init; }

    public DateTime CashBalanceUpdatedAt { get; init; }

    public decimal TotalActivePositionCost { get; init; }

    public decimal TotalMarketValue { get; init; }

    public decimal TotalRealizedPnL { get; init; }

    public decimal TotalUnrealizedPnL { get; init; }

    public decimal TotalPnL { get; init; }

    public decimal TotalPortfolioValue { get; init; }
}
