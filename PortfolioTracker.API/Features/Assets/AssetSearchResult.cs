namespace PortfolioTracker.API.Features.Assets;

public sealed record AssetSearchResult(
    int? Id,
    string Symbol,
    string? Name,
    string AssetType,
    string Market,
    string Currency,
    string ProviderSymbol,
    string Source,
    string? FundType,
    string? RawType,
    bool IsCustom,
    bool IsOpenPosition,
    DateTime? LastUsedAt
);
