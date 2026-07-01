using Microsoft.EntityFrameworkCore;
using PortfolioTracker.API.Domain.Entities;
using PortfolioTracker.API.Features.MarketPrices;
using PortfolioTracker.API.Features.Portfolio;
using PortfolioTracker.API.Features.Transactions;
using PortfolioTracker.API.Infrastructure.Persistence;

namespace PortfolioTracker.API.Features.Transactions;

/// <summary>
/// Handles persistence and business logic for investment transactions.
/// All write operations are immediately flushed via <see cref="DbContext.SaveChangesAsync()"/>.
/// </summary>
public class TransactionService(
    ApplicationDbContext context,
    IMarketPriceRefreshQueue marketPriceRefreshQueue,
    IPortfolioPositionRecalculationQueue portfolioPositionQueue
) : ITransactionService
{
    /// <inheritdoc/>
    public async Task<IEnumerable<TransactionResponse>> GetAllAsync(TransactionQuery query)
    {
        IQueryable<Transaction> transactions = context
            .Transactions.AsNoTracking()
            .Include(transaction => transaction.Asset);
        transactions = ApplyFilters(transactions, query);
        var rows = await transactions
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.Id)
            .ToListAsync();

        return rows.Select(TransactionResponse.FromEntity).ToList();
    }

    /// <inheritdoc/>
    public async Task<TransactionResponse?> GetByIdAsync(int id)
    {
        var transaction = await context
            .Transactions.AsNoTracking()
            .Include(transaction => transaction.Asset)
            .FirstOrDefaultAsync(transaction => transaction.Id == id);

        return transaction is null ? null : TransactionResponse.FromEntity(transaction);
    }

    /// <inheritdoc/>
    public async Task<TransactionResponse> CreateAsync(CreateTransactionRequest request)
    {
        var asset = await ResolveAssetAsync(request.AssetId, request.Symbol);
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

        await context.Transactions.AddAsync(transaction);
        await context.SaveChangesAsync();
        await portfolioPositionQueue.EnqueueAssetAsync(asset.Id);
        await marketPriceRefreshQueue.EnqueueAsync(asset.Symbol);
        return TransactionResponse.FromEntity(transaction);
    }

    /// <inheritdoc/>
    public async Task<bool> UpdateAsync(int id, UpdateTransactionRequest request)
    {
        var transaction = await context
            .Transactions.Include(transaction => transaction.Asset)
            .FirstOrDefaultAsync(transaction => transaction.Id == id);
        if (transaction is null)
            return false;

        var oldAssetId = transaction.AssetId;
        var oldSymbol = transaction.Asset.Symbol;
        var asset = await ResolveAssetAsync(request.AssetId, request.Symbol);
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

        await context.SaveChangesAsync();
        await portfolioPositionQueue.EnqueueAssetAsync(asset.Id);

        if (oldAssetId != asset.Id)
            await portfolioPositionQueue.EnqueueAssetAsync(oldAssetId);

        await marketPriceRefreshQueue.EnqueueAsync(asset.Symbol);

        if (!string.Equals(oldSymbol, asset.Symbol, StringComparison.OrdinalIgnoreCase))
            await marketPriceRefreshQueue.EnqueueAsync(oldSymbol);

        return true;
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteAsync(int id)
    {
        var transaction = await context
            .Transactions.Include(transaction => transaction.Asset)
            .FirstOrDefaultAsync(transaction => transaction.Id == id);
        if (transaction is null)
            return false;

        var assetId = transaction.AssetId;
        var symbol = transaction.Asset.Symbol;
        context.Transactions.Remove(transaction);
        await context.SaveChangesAsync();
        await portfolioPositionQueue.EnqueueAssetAsync(assetId);
        await marketPriceRefreshQueue.EnqueueAsync(symbol);
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

    private async Task<Asset> ResolveAssetAsync(int? assetId, string symbol)
    {
        if (assetId is int id)
        {
            var asset = await context.Assets.FirstOrDefaultAsync(asset => asset.Id == id);
            return asset ?? throw new ArgumentException("Seçilen varlık bulunamadı.");
        }

        var normalizedSymbol = NormalizeSymbol(symbol);
        var matches = await context
            .Assets.Where(asset => asset.Symbol == normalizedSymbol)
            .OrderByDescending(asset => asset.IsActive)
            .ThenBy(asset => asset.Id)
            .ToListAsync();

        if (matches.Count == 1)
            return matches[0];

        if (matches.Count > 1)
            throw new ArgumentException(
                "Bu sembol birden fazla varlıkla eşleşiyor. Listeden seçim yap."
            );

        var customAsset = new Asset
        {
            Symbol = normalizedSymbol,
            Name = symbol.Trim(),
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

    private static string NormalizeSymbol(string symbol)
    {
        var normalizedSymbol = symbol.Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(normalizedSymbol))
            throw new ArgumentException("Sembol boş olamaz.");

        return normalizedSymbol;
    }

    private static string? NormalizeNote(string? note) =>
        string.IsNullOrWhiteSpace(note) ? null : note.Trim();
}
