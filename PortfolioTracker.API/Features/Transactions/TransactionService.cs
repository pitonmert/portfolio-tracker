using Microsoft.EntityFrameworkCore;
using PortfolioTracker.API.Domain.Entities;
using PortfolioTracker.API.Features.MarketPrices;
using PortfolioTracker.API.Features.Portfolio;
using PortfolioTracker.API.Features.Transactions;
using PortfolioTracker.API.Infrastructure.Persistence;

namespace PortfolioTracker.API.Features.Transactions;

public class TransactionService(
    ApplicationDbContext context,
    IMarketPriceRefreshQueue marketPriceRefreshQueue,
    IPortfolioPositionRecalculationQueue portfolioPositionQueue
) : ITransactionService
{
    public async Task<IEnumerable<TransactionResponse>> GetAllAsync(
        TransactionQuery query,
        CancellationToken cancellationToken = default
    )
    {
        IQueryable<Transaction> transactions = context
            .Transactions.AsNoTracking()
            .Include(transaction => transaction.Asset);
        transactions = ApplyFilters(transactions, query);
        var rows = await transactions
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.Id)
            .ToListAsync(cancellationToken);

        return rows.Select(TransactionResponse.FromEntity).ToList();
    }

    public async Task<TransactionResponse?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var transaction = await context
            .Transactions.AsNoTracking()
            .Include(transaction => transaction.Asset)
            .FirstOrDefaultAsync(transaction => transaction.Id == id, cancellationToken);

        return transaction is null ? null : TransactionResponse.FromEntity(transaction);
    }

    public async Task<TransactionResponse> CreateAsync(
        CreateTransactionRequest request,
        CancellationToken cancellationToken = default
    )
    {
        var asset = await ResolveAssetAsync(request.AssetId, request.Symbol, cancellationToken);
        var transaction = new Transaction
        {
            Asset = asset,
            Quantity = request.Quantity,
            UnitPrice = request.UnitPrice,
            TotalAmount = PortfolioCalculations.CalculateTransactionTotal(
                request.Quantity,
                request.UnitPrice
            ),
            Note = NormalizeNote(request.Note),
            Type = request.Type,
            Date = request.TransactionDate ?? DateTime.UtcNow,
        };

        await context.Transactions.AddAsync(transaction, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        await portfolioPositionQueue.EnqueueAssetAsync(asset.Id, cancellationToken);
        await marketPriceRefreshQueue.EnqueueAsync(asset.Symbol, cancellationToken);
        return TransactionResponse.FromEntity(transaction);
    }

    public async Task<bool> UpdateAsync(
        int id,
        UpdateTransactionRequest request,
        CancellationToken cancellationToken = default
    )
    {
        var transaction = await context
            .Transactions.Include(transaction => transaction.Asset)
            .FirstOrDefaultAsync(transaction => transaction.Id == id, cancellationToken);
        if (transaction is null)
            return false;

        var oldAssetId = transaction.AssetId;
        var oldSymbol = transaction.Asset.Symbol;
        var asset = await ResolveAssetAsync(request.AssetId, request.Symbol, cancellationToken);
        transaction.Asset = asset;
        if (asset.Id > 0)
            transaction.AssetId = asset.Id;
        transaction.Quantity = request.Quantity;
        transaction.UnitPrice = request.UnitPrice;
        transaction.TotalAmount = PortfolioCalculations.CalculateTransactionTotal(
            request.Quantity,
            request.UnitPrice
        );
        transaction.Note = NormalizeNote(request.Note);
        transaction.Type = request.Type;
        transaction.Date = request.TransactionDate ?? transaction.Date;

        await context.SaveChangesAsync(cancellationToken);
        await portfolioPositionQueue.EnqueueAssetAsync(asset.Id, cancellationToken);

        if (oldAssetId != asset.Id)
            await portfolioPositionQueue.EnqueueAssetAsync(oldAssetId, cancellationToken);

        await marketPriceRefreshQueue.EnqueueAsync(asset.Symbol, cancellationToken);

        if (!string.Equals(oldSymbol, asset.Symbol, StringComparison.OrdinalIgnoreCase))
            await marketPriceRefreshQueue.EnqueueAsync(oldSymbol, cancellationToken);

        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var transaction = await context
            .Transactions.Include(transaction => transaction.Asset)
            .FirstOrDefaultAsync(transaction => transaction.Id == id, cancellationToken);
        if (transaction is null)
            return false;

        var assetId = transaction.AssetId;
        var symbol = transaction.Asset.Symbol;
        context.Transactions.Remove(transaction);
        await context.SaveChangesAsync(cancellationToken);
        await portfolioPositionQueue.EnqueueAssetAsync(assetId, cancellationToken);
        await marketPriceRefreshQueue.EnqueueAsync(symbol, cancellationToken);
        return true;
    }

    private static IQueryable<Transaction> ApplyFilters(
        IQueryable<Transaction> transactions,
        TransactionQuery query
    )
    {
        if (query.Type is not null)
            transactions = transactions.Where(t => t.Type == query.Type);

        if (!string.IsNullOrWhiteSpace(query.Symbol))
        {
            var symbol = query.Symbol.Trim().ToUpper();
            transactions = transactions.Where(t => t.Asset.Symbol.ToUpper() == symbol);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{query.Search.Trim()}%";
            transactions = transactions.Where(t =>
                EF.Functions.ILike(t.Asset.Symbol, pattern)
                || (t.Note != null && EF.Functions.ILike(t.Note, pattern))
            );
        }

        return transactions;
    }

    private async Task<Asset> ResolveAssetAsync(
        int? assetId,
        string? symbol,
        CancellationToken cancellationToken
    )
    {
        if (assetId is int id)
        {
            var asset = await context.Assets.FirstOrDefaultAsync(
                asset => asset.Id == id,
                cancellationToken
            );
            return asset ?? throw new ArgumentException("Selected asset was not found.");
        }

        // Symbol-only requests must fail when the catalog cannot identify one asset.
        var normalizedSymbol = NormalizeSymbol(symbol);
        var matches = await context
            .Assets.Where(asset => asset.Symbol == normalizedSymbol)
            .OrderByDescending(asset => asset.IsActive)
            .ThenBy(asset => asset.Id)
            .ToListAsync(cancellationToken);

        if (matches.Count == 1)
            return matches[0];

        if (matches.Count > 1)
            throw new ArgumentException(
                "This symbol matches more than one asset. Select an asset from the list."
            );

        // Unknown symbols remain usable by creating a manual asset.
        var customAsset = new Asset
        {
            Symbol = normalizedSymbol,
            Name = symbol!.Trim(),
            AssetType = "custom",
            Market = "MANUAL",
            Currency = "TRY",
            ProviderSymbol = normalizedSymbol,
            Source = "manual",
            IsCustom = true,
            IsActive = true,
            LastSyncedAt = DateTime.UtcNow,
        };

        context.Assets.Add(customAsset);
        return customAsset;
    }

    private static string NormalizeSymbol(string? symbol)
    {
        if (string.IsNullOrWhiteSpace(symbol))
            throw new ArgumentException("Symbol is required.");

        return symbol.Trim().ToUpperInvariant();
    }

    private static string? NormalizeNote(string? note) =>
        string.IsNullOrWhiteSpace(note) ? null : note.Trim();
}
