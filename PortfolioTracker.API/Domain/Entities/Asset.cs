using System.ComponentModel.DataAnnotations;

namespace PortfolioTracker.API.Domain.Entities;

public class Asset
{
    public int Id { get; set; }

    [MaxLength(120)]
    public string Symbol { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Name { get; set; }

    [MaxLength(20)]
    public string AssetType { get; set; } = string.Empty;

    [MaxLength(40)]
    public string Market { get; set; } = string.Empty;

    [MaxLength(10)]
    public string Currency { get; set; } = "TRY";

    [MaxLength(140)]
    public string ProviderSymbol { get; set; } = string.Empty;

    [MaxLength(80)]
    public string Source { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? FundType { get; set; }

    [MaxLength(160)]
    public string? RawType { get; set; }

    public bool IsCustom { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime LastSyncedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Transaction> Transactions { get; set; } = [];

    public MarketPrice? MarketPrice { get; set; }

    public PortfolioPositionSnapshot? PortfolioPosition { get; set; }
}
