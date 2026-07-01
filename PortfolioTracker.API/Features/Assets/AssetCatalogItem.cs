namespace PortfolioTracker.API.Features.Assets;

public sealed record AssetCatalogItem(
    string Symbol,
    string? Name,
    string AssetType,
    string Market,
    string Currency,
    string ProviderSymbol,
    string Source,
    string? FundType,
    string? RawType
);
