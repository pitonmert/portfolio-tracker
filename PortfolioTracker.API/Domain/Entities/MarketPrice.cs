using System.ComponentModel.DataAnnotations;

namespace PortfolioTracker.API.Domain.Entities;

// Stores the latest known price for an asset.
public class MarketPrice
{
    // Asset identity used as the primary key for the one-to-one price row.
    [Key]
    public int AssetId { get; set; }

    public Asset Asset { get; set; } = null!;

    // Asset symbol snapshot used by symbol-based endpoints and logs.
    [MaxLength(120)]
    public string Symbol { get; set; } = string.Empty;

    // Symbol format used by the price provider.
    [MaxLength(140)]
    public string ProviderSymbol { get; set; } = string.Empty;

    // Latest available unit price.
    public decimal? CurrentPrice { get; set; }

    // Highest price reported for the current day, if available.
    public decimal? DayHigh { get; set; }

    // Lowest price reported for the current day, if available.
    public decimal? DayLow { get; set; }

    // Reported market capitalization, if available.
    public decimal? MarketCap { get; set; }

    // Time when the automatic or manual price was recorded.
    public DateTime? FetchedAt { get; set; }

    // Indicates whether CurrentPrice can be used.
    public bool IsAvailable { get; set; }

    // Indicates whether the user entered the price manually.
    public bool IsManual { get; set; }

    // Time when the manual price was last changed.
    public DateTime? ManualUpdatedAt { get; set; }

    // Last provider or validation error for this symbol.
    [MaxLength(500)]
    public string? Error { get; set; }
}
