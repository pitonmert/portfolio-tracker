using Microsoft.EntityFrameworkCore;
using Npgsql;
using PortfolioTracker.API.Domain.Entities;
using PortfolioTracker.API.Features.Portfolio;
using PortfolioTracker.API.Infrastructure.Persistence;

namespace PortfolioTracker.API.Features.MarketPrices;

public class MarketPriceService(
    ApplicationDbContext context,
    IMarketPriceProvider provider,
    IMarketPriceRefreshQueue refreshQueue,
    IPortfolioPositionRecalculationQueue portfolioPositionQueue
) : IMarketPriceService
{
    public async Task<MarketPriceQuote> GetQuoteAsync(
        string symbol,
        CancellationToken cancellationToken
    )
    {
        var normalizedSymbol = MarketPriceSymbols.Normalize(symbol);
        if (string.IsNullOrWhiteSpace(normalizedSymbol))
            return MarketPriceQuote.Unavailable(normalizedSymbol);

        var asset = await ResolvePreferredAssetAsync(normalizedSymbol, cancellationToken);
        if (asset is null)
            return MarketPriceQuote.Unavailable(
                normalizedSymbol,
                isRefreshing: refreshQueue.IsQueuedOrProcessing(normalizedSymbol)
            );

        var price = await context
            .MarketPrices.AsNoTracking()
            .Include(price => price.Asset)
            .FirstOrDefaultAsync(price => price.AssetId == asset.Id, cancellationToken);

        var isRefreshing = refreshQueue.IsQueuedOrProcessing(asset.Symbol);

        return price is null
            ? MarketPriceQuote.Unavailable(asset.Symbol, isRefreshing: isRefreshing)
            : ToQuote(price, isRefreshing);
    }

    public async Task<IReadOnlyList<MarketPriceQuote>> GetQuotesAsync(
        IEnumerable<string> symbols,
        CancellationToken cancellationToken
    )
    {
        var normalizedSymbols = symbols
            .Select(MarketPriceSymbols.Normalize)
            .Where(symbol => !string.IsNullOrWhiteSpace(symbol))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (normalizedSymbols.Count == 0)
            return [];

        var assetsBySymbol = await ResolvePreferredAssetsAsync(
            normalizedSymbols,
            cancellationToken
        );
        var assetIds = assetsBySymbol.Values.Select(asset => asset.Id).ToList();
        var pricesByAssetId = await context
            .MarketPrices.AsNoTracking()
            .Include(price => price.Asset)
            .Where(price => assetIds.Contains(price.AssetId))
            .ToDictionaryAsync(price => price.AssetId, cancellationToken);

        return normalizedSymbols
            .Select(symbol =>
            {
                if (!assetsBySymbol.TryGetValue(symbol, out var asset))
                    return MarketPriceQuote.Unavailable(
                        symbol,
                        isRefreshing: refreshQueue.IsQueuedOrProcessing(symbol)
                    );

                return pricesByAssetId.TryGetValue(asset.Id, out var price)
                    ? ToQuote(price, refreshQueue.IsQueuedOrProcessing(asset.Symbol))
                    : MarketPriceQuote.Unavailable(
                        asset.Symbol,
                        isRefreshing: refreshQueue.IsQueuedOrProcessing(asset.Symbol)
                    );
            })
            .ToList();
    }

    public async Task<IReadOnlyDictionary<int, MarketPriceQuote>> GetQuotesByAssetIdsAsync(
        IEnumerable<int> assetIds,
        CancellationToken cancellationToken
    )
    {
        var distinctAssetIds = assetIds.Where(assetId => assetId > 0).Distinct().ToList();
        if (distinctAssetIds.Count == 0)
            return new Dictionary<int, MarketPriceQuote>();

        var assets = await context
            .Assets.AsNoTracking()
            .Where(asset => distinctAssetIds.Contains(asset.Id))
            .ToDictionaryAsync(asset => asset.Id, cancellationToken);
        var pricesByAssetId = await context
            .MarketPrices.AsNoTracking()
            .Include(price => price.Asset)
            .Where(price => distinctAssetIds.Contains(price.AssetId))
            .ToDictionaryAsync(price => price.AssetId, cancellationToken);

        return distinctAssetIds
            .Where(assets.ContainsKey)
            .ToDictionary(
                assetId => assetId,
                assetId =>
                {
                    var asset = assets[assetId];
                    return pricesByAssetId.TryGetValue(assetId, out var price)
                        ? ToQuote(price, refreshQueue.IsQueuedOrProcessing(asset.Symbol))
                        : MarketPriceQuote.Unavailable(
                            asset.Symbol,
                            isRefreshing: refreshQueue.IsQueuedOrProcessing(asset.Symbol)
                        );
                }
            );
    }

    public async Task<MarketPriceQuote> SaveManualPriceAsync(
        string symbol,
        decimal currentPrice,
        CancellationToken cancellationToken
    )
    {
        var normalizedSymbol = MarketPriceSymbols.Normalize(symbol);
        if (string.IsNullOrWhiteSpace(normalizedSymbol))
            throw new ArgumentException("Sembol boş olamaz.", nameof(symbol));

        if (currentPrice <= 0)
            throw new ArgumentOutOfRangeException(
                nameof(currentPrice),
                "Güncel fiyat 0’dan büyük olmalı."
            );

        var now = DateTime.UtcNow;
        var asset = await GetOrCreateCustomAssetAsync(normalizedSymbol, cancellationToken);
        var entity = await SaveMarketPriceAsync(
            asset,
            entity =>
            {
                entity.CurrentPrice = currentPrice;
                entity.DayHigh = null;
                entity.DayLow = null;
                entity.MarketCap = null;
                entity.FetchedAt = now;
                entity.IsAvailable = true;
                entity.IsManual = true;
                entity.ManualUpdatedAt = now;
                entity.Error = null;
                return true;
            },
            cancellationToken
        );

        await portfolioPositionQueue.EnqueueAssetAsync(entity.AssetId, cancellationToken);
        return ToQuote(entity);
    }

    public async Task<MarketPriceQuote> ClearManualPriceAsync(
        string symbol,
        CancellationToken cancellationToken
    )
    {
        var normalizedSymbol = MarketPriceSymbols.Normalize(symbol);
        if (string.IsNullOrWhiteSpace(normalizedSymbol))
            throw new ArgumentException("Sembol boş olamaz.", nameof(symbol));

        var asset = await GetOrCreateCustomAssetAsync(normalizedSymbol, cancellationToken);
        var entity = await SaveMarketPriceAsync(
            asset,
            entity =>
            {
                entity.CurrentPrice = null;
                entity.DayHigh = null;
                entity.DayLow = null;
                entity.MarketCap = null;
                entity.FetchedAt = null;
                entity.IsAvailable = false;
                entity.IsManual = false;
                entity.ManualUpdatedAt = null;
                entity.Error = "Fiyat alınamadı";
                return true;
            },
            cancellationToken
        );

        await portfolioPositionQueue.EnqueueAssetAsync(entity.AssetId, cancellationToken);
        await refreshQueue.EnqueueAsync(asset.Symbol, cancellationToken);

        return ToQuote(entity, isRefreshing: true);
    }

    public async Task RefreshActiveSymbolsAsync(CancellationToken cancellationToken)
    {
        var symbols = await GetActiveSymbolsAsync(cancellationToken);

        foreach (var symbol in symbols)
        {
            await RefreshSymbolAsync(symbol, cancellationToken);
        }
    }

    public async Task<MarketPriceQuote> RefreshSymbolAsync(
        string symbol,
        CancellationToken cancellationToken
    )
    {
        var normalizedSymbol = MarketPriceSymbols.Normalize(symbol);
        if (string.IsNullOrWhiteSpace(normalizedSymbol))
            return MarketPriceQuote.Unavailable(normalizedSymbol);

        var asset = await ResolvePreferredAssetAsync(normalizedSymbol, cancellationToken);
        if (asset is null)
            return MarketPriceQuote.Unavailable(normalizedSymbol);

        var existing = await context
            .MarketPrices.Include(price => price.Asset)
            .FirstOrDefaultAsync(price => price.AssetId == asset.Id, cancellationToken);

        // Manual overrides win until the user clears them.
        if (existing?.IsManual == true)
            return ToQuote(existing);

        var isOpen = await IsOpenPositionAsync(asset.Id, cancellationToken);
        if (!isOpen)
        {
            // Closed positions should not keep auto-refreshing provider prices.
            var closedEntity = await SaveMarketPriceAsync(
                asset,
                entity =>
                {
                    if (entity.IsManual)
                        return false;

                    entity.CurrentPrice = null;
                    entity.DayHigh = null;
                    entity.DayLow = null;
                    entity.MarketCap = null;
                    entity.FetchedAt = null;
                    entity.IsAvailable = false;
                    entity.IsManual = false;
                    entity.ManualUpdatedAt = null;
                    entity.Error = "Pozisyon kapalı";
                    return true;
                },
                cancellationToken
            );

            await portfolioPositionQueue.EnqueueAssetAsync(closedEntity.AssetId, cancellationToken);
            return ToQuote(closedEntity);
        }

        var providerQuote = await provider.GetQuoteAsync(asset.Symbol, cancellationToken);
        var refreshedEntity = await SaveMarketPriceAsync(
            asset,
            entity =>
            {
                if (entity.IsManual)
                    return false;

                if (!providerQuote.IsAvailable || providerQuote.CurrentPrice is null)
                {
                    entity.Error = providerQuote.Error ?? "Fiyat alınamadı";

                    if (entity.CurrentPrice is null || entity.CurrentPrice <= 0)
                    {
                        entity.CurrentPrice = null;
                        entity.DayHigh = null;
                        entity.DayLow = null;
                        entity.MarketCap = null;
                        entity.FetchedAt = null;
                        entity.IsAvailable = false;
                    }

                    return true;
                }

                entity.ProviderSymbol = asset.ProviderSymbol;
                entity.CurrentPrice = providerQuote.CurrentPrice;
                entity.DayHigh = providerQuote.DayHigh;
                entity.DayLow = providerQuote.DayLow;
                entity.MarketCap = providerQuote.MarketCap;
                entity.FetchedAt = providerQuote.FetchedAt ?? DateTime.UtcNow;
                entity.IsAvailable = true;
                entity.IsManual = false;
                entity.ManualUpdatedAt = null;
                entity.Error = null;
                return true;
            },
            cancellationToken
        );

        await portfolioPositionQueue.EnqueueAssetAsync(refreshedEntity.AssetId, cancellationToken);
        return ToQuote(refreshedEntity);
    }

    private async Task<MarketPrice> SaveMarketPriceAsync(
        Asset asset,
        Func<MarketPrice, bool> applyChanges,
        CancellationToken cancellationToken
    )
    {
        for (var attempt = 0; attempt < 2; attempt++)
        {
            MarketPrice? entity = null;
            if (asset.Id > 0)
            {
                entity = await context
                    .MarketPrices.Include(price => price.Asset)
                    .FirstOrDefaultAsync(price => price.AssetId == asset.Id, cancellationToken);
            }

            if (entity is null)
            {
                entity = new MarketPrice
                {
                    Asset = asset,
                    Symbol = asset.Symbol,
                    ProviderSymbol = asset.ProviderSymbol,
                };
                context.MarketPrices.Add(entity);
            }

            entity.Symbol = asset.Symbol;
            entity.ProviderSymbol = asset.ProviderSymbol;

            if (!applyChanges(entity))
                return entity;

            try
            {
                await context.SaveChangesAsync(cancellationToken);
                return entity;
            }
            catch (DbUpdateException ex) when (IsUniqueViolation(ex) && attempt == 0)
            {
                context.ChangeTracker.Clear();
                asset = await context.Assets.FirstAsync(
                    item => item.Id == asset.Id,
                    cancellationToken
                );
            }
        }

        throw new InvalidOperationException($"Market price for {asset.Symbol} could not be saved.");
    }

    private async Task<IReadOnlyList<string>> GetActiveSymbolsAsync(
        CancellationToken cancellationToken
    )
    {
        var symbols = await context
            .PortfolioPositions.AsNoTracking()
            .Where(position => !position.IsClosed)
            .Select(position => position.Symbol)
            .ToListAsync(cancellationToken);

        return symbols
            .Select(MarketPriceSymbols.Normalize)
            .Where(symbol => !string.IsNullOrWhiteSpace(symbol))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private async Task<bool> IsOpenPositionAsync(int assetId, CancellationToken cancellationToken)
    {
        var transactions = await context
            .Transactions.AsNoTracking()
            .Include(transaction => transaction.Asset)
            .Where(transaction => transaction.AssetId == assetId)
            .OrderBy(transaction => transaction.Date)
            .ThenBy(transaction => transaction.Id)
            .ToListAsync(cancellationToken);

        if (transactions.Count == 0)
            return false;

        var position = PortfolioCalculations.CalculatePosition(
            transactions.GroupBy(transaction => transaction.AssetId).Single()
        );

        return !PortfolioCalculations.IsClosedPosition(position.NetQuantity);
    }

    private async Task<Asset> GetOrCreateCustomAssetAsync(
        string normalizedSymbol,
        CancellationToken cancellationToken
    )
    {
        var asset = await ResolvePreferredAssetAsync(normalizedSymbol, cancellationToken);
        if (asset is not null)
            return asset;

        // Manual prices can introduce assets that are not present in the synced catalog.
        asset = new Asset
        {
            Symbol = normalizedSymbol,
            Name = normalizedSymbol,
            AssetType = "custom",
            Market = "MANUAL",
            Currency = "TRY",
            ProviderSymbol = normalizedSymbol,
            Source = "manual",
            IsCustom = true,
            IsActive = true,
            LastSyncedAt = DateTime.UtcNow,
        };

        context.Assets.Add(asset);
        return asset;
    }

    private async Task<Asset?> ResolvePreferredAssetAsync(
        string normalizedSymbol,
        CancellationToken cancellationToken
    )
    {
        var assets = await context
            .Assets.Where(asset => asset.Symbol == normalizedSymbol)
            .OrderByDescending(asset => asset.IsActive)
            .ThenBy(asset => asset.IsCustom)
            .ThenBy(asset => asset.Id)
            .ToListAsync(cancellationToken);

        return SelectPreferredAsset(normalizedSymbol, assets);
    }

    private async Task<Dictionary<string, Asset>> ResolvePreferredAssetsAsync(
        IReadOnlyList<string> normalizedSymbols,
        CancellationToken cancellationToken
    )
    {
        var symbolSet = normalizedSymbols.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var assets = await context
            .Assets.Where(asset => symbolSet.Contains(asset.Symbol))
            .OrderByDescending(asset => asset.IsActive)
            .ThenBy(asset => asset.IsCustom)
            .ThenBy(asset => asset.Id)
            .ToListAsync(cancellationToken);

        return normalizedSymbols
            .Select(symbol => new
            {
                Symbol = symbol,
                Asset = SelectPreferredAsset(
                    symbol,
                    assets
                        .Where(asset =>
                            string.Equals(asset.Symbol, symbol, StringComparison.OrdinalIgnoreCase)
                        )
                        .ToList()
                ),
            })
            .Where(item => item.Asset is not null)
            .ToDictionary(
                item => item.Symbol,
                item => item.Asset!,
                StringComparer.OrdinalIgnoreCase
            );
    }

    private static Asset? SelectPreferredAsset(string normalizedSymbol, IReadOnlyList<Asset> assets)
    {
        if (assets.Count == 0)
            return null;

        if (assets.Count == 1)
            return assets[0];

        // Symbol-only price endpoints keep a deterministic default for backward compatibility.
        var preferredAsset =
            normalizedSymbol.Length == 3
                ? assets.FirstOrDefault(asset => asset.AssetType == "fund")
                : assets.FirstOrDefault(asset => asset.AssetType == "stock");

        return preferredAsset ?? assets.FirstOrDefault(asset => asset.IsCustom) ?? assets[0];
    }

    private static MarketPriceQuote ToQuote(MarketPrice price, bool isRefreshing = false) =>
        MarketPriceQuoteFactory.ToQuote(price, isRefreshing);

    private static bool IsUniqueViolation(DbUpdateException exception) =>
        exception.InnerException is PostgresException postgresException
        && postgresException.SqlState == PostgresErrorCodes.UniqueViolation;
}
