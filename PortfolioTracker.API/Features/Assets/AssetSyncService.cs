using Microsoft.EntityFrameworkCore;
using PortfolioTracker.API.Domain.Entities;
using PortfolioTracker.API.Infrastructure.Persistence;

namespace PortfolioTracker.API.Features.Assets;

public class AssetSyncService(ApplicationDbContext context, IAssetCatalogProvider catalogProvider)
    : IAssetSyncService
{
    public async Task<AssetSyncResult> SyncAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var catalogItems = await LoadCatalogItemsAsync(cancellationToken);
        var normalizedItems = catalogItems
            .Select(NormalizeCatalogItem)
            .Where(item => !string.IsNullOrWhiteSpace(item.Symbol))
            .DistinctBy(item => (item.Symbol, item.AssetType, item.Market))
            .ToList();
        var syncedKeys = normalizedItems
            .Select(item => (item.Symbol, item.AssetType, item.Market))
            .ToHashSet();

        var existingAssets = await context.Assets.ToListAsync(cancellationToken);
        var existingByKey = existingAssets.ToDictionary(asset =>
            (asset.Symbol, asset.AssetType, asset.Market)
        );

        var upserted = 0;
        foreach (var item in normalizedItems)
        {
            var key = (item.Symbol, item.AssetType, item.Market);
            if (!existingByKey.TryGetValue(key, out var asset))
            {
                asset = new Asset
                {
                    Symbol = item.Symbol,
                    AssetType = item.AssetType,
                    Market = item.Market,
                };
                context.Assets.Add(asset);
                existingByKey[key] = asset;
            }

            asset.Name = item.Name;
            asset.Currency = item.Currency;
            asset.ProviderSymbol = item.ProviderSymbol;
            asset.Source = item.Source;
            asset.FundType = item.FundType;
            asset.RawType = item.RawType;
            asset.IsCustom = false;
            asset.IsActive = true;
            asset.LastSyncedAt = now;
            upserted++;
        }

        foreach (var asset in existingAssets.Where(asset => !asset.IsCustom && asset.IsActive))
        {
            var key = (asset.Symbol, asset.AssetType, asset.Market);
            if (!syncedKeys.Contains(key))
            {
                asset.IsActive = false;
                asset.LastSyncedAt = now;
            }
        }

        await context.SaveChangesAsync(cancellationToken);
        return new AssetSyncResult(normalizedItems.Count, upserted, now);
    }

    private async Task<IReadOnlyList<AssetCatalogItem>> LoadCatalogItemsAsync(
        CancellationToken cancellationToken
    )
    {
        var stocks = await catalogProvider.GetStockAssetsAsync(cancellationToken);
        var yatFunds = await catalogProvider.GetFundAssetsAsync("YAT", cancellationToken);
        var emkFunds = await catalogProvider.GetFundAssetsAsync("EMK", cancellationToken);

        return stocks.Concat(yatFunds).Concat(emkFunds).ToList();
    }

    private static AssetCatalogItem NormalizeCatalogItem(AssetCatalogItem item)
    {
        var symbol = AssetSymbols.Normalize(item.Symbol);
        var assetType = AssetSymbols.NormalizeAssetType(item.AssetType);
        var market = AssetSymbols.Normalize(item.Market);
        var providerSymbol = AssetSymbols.Normalize(
            string.IsNullOrWhiteSpace(item.ProviderSymbol) ? symbol : item.ProviderSymbol
        );
        var currency = AssetSymbols.Normalize(
            string.IsNullOrWhiteSpace(item.Currency) ? "TRY" : item.Currency
        );
        var source = string.IsNullOrWhiteSpace(item.Source) ? "borsapy" : item.Source.Trim();
        var fundType = string.IsNullOrWhiteSpace(item.FundType)
            ? null
            : AssetSymbols.Normalize(item.FundType);

        return item with
        {
            Symbol = symbol,
            AssetType = assetType,
            Market = market,
            ProviderSymbol = providerSymbol,
            Currency = currency,
            Source = source,
            FundType = fundType,
            Name = string.IsNullOrWhiteSpace(item.Name) ? null : item.Name.Trim(),
            RawType = string.IsNullOrWhiteSpace(item.RawType) ? null : item.RawType.Trim(),
        };
    }
}
