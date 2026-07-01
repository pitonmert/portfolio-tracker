using System.ComponentModel.DataAnnotations;

namespace PortfolioTracker.API.Domain.Entities;

// Stores a rebuildable portfolio position read model for fast dashboard reads.
public class PortfolioPositionSnapshot
{
    // Related asset identity. This is also the primary key for the snapshot row.
    [Key]
    public int AssetId { get; set; }

    public Asset Asset { get; set; } = null!;

    // Asset symbol snapshot used by read endpoints.
    [MaxLength(120)]
    public string Symbol { get; set; } = string.Empty;

    // Asset market snapshot used by grouping/filtering clients.
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
