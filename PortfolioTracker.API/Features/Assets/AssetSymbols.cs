namespace PortfolioTracker.API.Features.Assets;

public static class AssetSymbols
{
    public static string Normalize(string value) =>
        string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim().ToUpperInvariant();

    public static string NormalizeAssetType(string value) =>
        string.IsNullOrWhiteSpace(value) ? "auto" : value.Trim().ToLowerInvariant();
}
