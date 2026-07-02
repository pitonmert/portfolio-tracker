using Microsoft.EntityFrameworkCore;
using PortfolioTracker.API.Domain.Entities;
using PortfolioTracker.API.Features.Portfolio;
using PortfolioTracker.API.Infrastructure.Persistence;

namespace PortfolioTracker.API.Features.Assets;

public class AssetSearchService(ApplicationDbContext context) : IAssetSearchService
{
    public async Task<IReadOnlyList<AssetSearchResult>> SearchAsync(
        string query,
        string assetType = "auto",
        int limit = 8,
        CancellationToken cancellationToken = default
    )
    {
        var normalizedQuery = AssetSymbols.Normalize(query);
        if (string.IsNullOrWhiteSpace(normalizedQuery))
            return [];

        var normalizedAssetType = AssetSymbols.NormalizeAssetType(assetType);
        var boundedLimit = Math.Clamp(limit, 1, 50);
        var pattern = $"%{normalizedQuery}%";

        var assetsQuery = context.Assets.AsNoTracking().Where(asset => asset.IsActive);
        if (normalizedAssetType is "stock" or "fund")
            assetsQuery = assetsQuery.Where(asset => asset.AssetType == normalizedAssetType);

        var assets = await assetsQuery
            .Where(asset =>
                EF.Functions.ILike(asset.Symbol, pattern)
                || (asset.Name != null && EF.Functions.ILike(asset.Name, pattern))
            )
            .ToListAsync(cancellationToken);

        var transactionSummaries = await GetTransactionSummariesAsync(cancellationToken);
        var openAssetIds = transactionSummaries
            .Where(summary => summary.IsOpen)
            .Select(summary => summary.AssetId)
            .ToHashSet();
        var openSymbols = transactionSummaries
            .Where(summary => summary.IsOpen)
            .Select(summary => summary.Symbol)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var lastUsedByAssetId = transactionSummaries.ToDictionary(
            summary => summary.AssetId,
            summary => summary.LastUsedAt,
            EqualityComparer<int>.Default
        );
        var lastUsedBySymbol = transactionSummaries
            .GroupBy(summary => summary.Symbol, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                group => group.Key,
                group => group.Max(summary => summary.LastUsedAt),
                StringComparer.OrdinalIgnoreCase
            );
        var recentRankByAssetId = transactionSummaries
            .OrderByDescending(summary => summary.LastUsedAt)
            .Select((summary, index) => new { summary.AssetId, Index = index })
            .ToDictionary(item => item.AssetId, item => item.Index);
        var recentRankBySymbol = transactionSummaries
            .OrderByDescending(summary => summary.LastUsedAt)
            .Select((summary, index) => new { summary.Symbol, Index = index })
            .GroupBy(item => item.Symbol, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                group => group.Key,
                group => group.Min(item => item.Index),
                StringComparer.OrdinalIgnoreCase
            );

        var results = assets
            .Select(asset =>
                ToSearchResult(
                    asset,
                    openAssetIds.Contains(asset.Id),
                    lastUsedByAssetId.TryGetValue(asset.Id, out var lastUsedAt) ? lastUsedAt : null
                )
            )
            .OrderBy(result => GetMatchRank(result, normalizedQuery))
            .ThenBy(result => result.IsOpenPosition ? 0 : 1)
            .ThenBy(result =>
                result.Id is int assetId && recentRankByAssetId.TryGetValue(assetId, out var rank)
                    ? rank
                : recentRankBySymbol.TryGetValue(result.Symbol, out var symbolRank) ? symbolRank
                : int.MaxValue
            )
            .ThenBy(result => result.Symbol, StringComparer.OrdinalIgnoreCase)
            .ThenBy(result => result.Name)
            .Take(boundedLimit)
            .ToList();

        if (results.Count == 0)
            results.Add(
                CreateCustomResult(
                    normalizedQuery,
                    openSymbols.Contains(normalizedQuery),
                    lastUsedBySymbol.TryGetValue(normalizedQuery, out var lastUsedAt)
                        ? lastUsedAt
                        : null
                )
            );

        return results;
    }

    private async Task<IReadOnlyList<PortfolioTransactionSummary>> GetTransactionSummariesAsync(
        CancellationToken cancellationToken
    )
    {
        var transactions = await context
            .Transactions.AsNoTracking()
            .Include(transaction => transaction.Asset)
            .Where(transaction => transaction.Asset.Symbol != "")
            .OrderBy(transaction => transaction.Date)
            .ThenBy(transaction => transaction.Id)
            .ToListAsync(cancellationToken);

        return transactions
            .GroupBy(transaction => transaction.AssetId)
            .Select(PortfolioCalculations.CalculateTransactionSummary)
            .ToList();
    }

    private static AssetSearchResult ToSearchResult(
        Asset asset,
        bool isOpenPosition,
        DateTime? lastUsedAt
    ) =>
        new(
            asset.Id,
            asset.Symbol,
            asset.Name,
            asset.AssetType,
            asset.Market,
            asset.Currency,
            asset.ProviderSymbol,
            asset.Source,
            asset.FundType,
            asset.RawType,
            asset.IsCustom,
            isOpenPosition,
            lastUsedAt
        );

    private static AssetSearchResult CreateCustomResult(
        string symbol,
        bool isOpenPosition,
        DateTime? lastUsedAt
    ) =>
        new(
            null,
            symbol,
            "Custom asset",
            "custom",
            "MANUAL",
            "TRY",
            symbol,
            "manual",
            null,
            null,
            true,
            isOpenPosition,
            lastUsedAt
        );

    private static int GetMatchRank(AssetSearchResult result, string query)
    {
        var symbol = result.Symbol.ToUpperInvariant();
        var name = result.Name?.ToUpperInvariant() ?? string.Empty;

        if (symbol == query)
            return 0;

        if (symbol.StartsWith(query, StringComparison.OrdinalIgnoreCase))
            return 1;

        if (name.StartsWith(query, StringComparison.OrdinalIgnoreCase))
            return 2;

        return 3;
    }
}
