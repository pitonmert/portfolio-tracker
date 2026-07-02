using System.ComponentModel.DataAnnotations;

namespace PortfolioTracker.API.Domain.Entities;

public class MarketPrice
{
    [Key]
    public int AssetId { get; set; }

    public Asset Asset { get; set; } = null!;

    [MaxLength(120)]
    public string Symbol { get; set; } = string.Empty;

    [MaxLength(140)]
    public string ProviderSymbol { get; set; } = string.Empty;

    public decimal? CurrentPrice { get; set; }

    public decimal? DayHigh { get; set; }

    public decimal? DayLow { get; set; }

    public decimal? MarketCap { get; set; }

    public DateTime? FetchedAt { get; set; }

    public bool IsAvailable { get; set; }

    public bool IsManual { get; set; }

    public DateTime? ManualUpdatedAt { get; set; }

    [MaxLength(500)]
    public string? Error { get; set; }
}
