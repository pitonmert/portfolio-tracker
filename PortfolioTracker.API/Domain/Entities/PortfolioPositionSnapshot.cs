using System.ComponentModel.DataAnnotations;

namespace PortfolioTracker.API.Domain.Entities;

// Rebuildable read model used by portfolio endpoints instead of recalculating every request.
public class PortfolioPositionSnapshot
{
    [Key]
    public int AssetId { get; set; }

    public Asset Asset { get; set; } = null!;

    [MaxLength(120)]
    public string Symbol { get; set; } = string.Empty;

    [MaxLength(40)]
    public string? Market { get; set; }

    public decimal NetQuantity { get; set; }

    public decimal AverageCost { get; set; }

    public decimal TotalInvested { get; set; }

    public decimal RealizedPnL { get; set; }

    public decimal ActivePositionCost { get; set; }

    public decimal? CurrentPrice { get; set; }

    public decimal MarketValue { get; set; }

    public decimal UnrealizedPnL { get; set; }

    public decimal TotalPnL { get; set; }

    public decimal? PnLPercent { get; set; }

    public bool IsClosed { get; set; }

    public DateTime LastTransactionAt { get; set; }

    public DateTime? PriceUpdatedAt { get; set; }

    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
}
