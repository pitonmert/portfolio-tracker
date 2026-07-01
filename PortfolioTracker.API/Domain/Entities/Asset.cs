using System.ComponentModel.DataAnnotations;

namespace PortfolioTracker.API.Domain.Entities;

// Tracks a searchable asset from the synchronized market/fund catalog.
public class Asset
{
    // Database identity value.
    public int Id { get; set; }

    // User-facing asset code, such as THYAO or KPA.
    [MaxLength(120)]
    public string Symbol { get; set; } = string.Empty;

    // Human-readable asset name from the provider.
    [MaxLength(300)]
    public string? Name { get; set; }

    // Asset category, such as stock or fund.
    [MaxLength(20)]
    public string AssetType { get; set; } = string.Empty;

    // Market source, such as BIST or TEFAS.
    [MaxLength(40)]
    public string Market { get; set; } = string.Empty;

    // Trading currency for display and calculations.
    [MaxLength(10)]
    public string Currency { get; set; } = "TRY";

    // Symbol format expected by the external data provider.
    [MaxLength(140)]
    public string ProviderSymbol { get; set; } = string.Empty;

    // Data provider name that produced this catalog row.
    [MaxLength(80)]
    public string Source { get; set; } = string.Empty;

    // TEFAS fund group, such as YAT or EMK.
    [MaxLength(20)]
    public string? FundType { get; set; }

    // Provider-specific category or raw type label.
    [MaxLength(160)]
    public string? RawType { get; set; }

    // Indicates whether this asset was created by the user rather than the synced catalog.
    public bool IsCustom { get; set; }

    // Indicates whether this asset should appear in searches.
    public bool IsActive { get; set; } = true;

    // Last time this catalog row was synchronized.
    public DateTime LastSyncedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Transaction> Transactions { get; set; } = [];

    public MarketPrice? MarketPrice { get; set; }

    public PortfolioPositionSnapshot? PortfolioPosition { get; set; }
}
