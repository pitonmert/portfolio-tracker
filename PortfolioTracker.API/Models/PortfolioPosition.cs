namespace PortfolioTracker.API.Models;

public record PortfolioPosition
{
    public string Symbol { get; init; } = string.Empty;

    public decimal NetQuantity { get; init; }

    public decimal AverageCost { get; init; }

    public decimal TotalInvested { get; init; }

    public decimal RealizedPnL { get; init; }
}
