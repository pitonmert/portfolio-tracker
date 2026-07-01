using System.ComponentModel.DataAnnotations;

namespace PortfolioTracker.API.Entities;

public class MarketPrice
{
    [Key]
    [MaxLength(120)]
    public string Symbol { get; set; } = string.Empty;

    [MaxLength(140)]
    public string ProviderSymbol { get; set; } = string.Empty;

    [MaxLength(240)]
    public string? CompanyName { get; set; }

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
