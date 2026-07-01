namespace PortfolioTracker.API.Features.Portfolio;

public record PortfolioPosition
{
    public int AssetId { get; init; }

    public string Symbol { get; init; } = string.Empty;

    public string? Market { get; init; }

    public decimal NetQuantity { get; init; }

    public decimal AverageCost { get; init; }

    public decimal TotalInvested { get; init; }

    public decimal RealizedPnL { get; init; }
}
