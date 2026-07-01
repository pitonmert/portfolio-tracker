using PortfolioTracker.API.Contracts;
using PortfolioTracker.API.Data;
using PortfolioTracker.API.Entities;
using PortfolioTracker.API.Features.MarketPrices;
using Microsoft.EntityFrameworkCore;

namespace PortfolioTracker.API.Features.Transactions;

/// <summary>
/// Handles persistence and business logic for investment transactions.
/// All write operations are immediately flushed via <see cref="DbContext.SaveChangesAsync()"/>.
/// </summary>
public class TransactionService(
    ApplicationDbContext context,
    IMarketPriceRefreshQueue marketPriceRefreshQueue
) : ITransactionService
{
    /// <inheritdoc/>
    public async Task<IEnumerable<Transaction>> GetAllAsync(TransactionQuery query)
    {
        var transactions = context.Transactions.AsNoTracking();
        transactions = ApplyFilters(transactions, query);
        return await transactions.OrderByDescending(t => t.Date).ToListAsync();
    }

    /// <inheritdoc/>
    public async Task<Transaction?> GetByIdAsync(int id) =>
        await context.Transactions.FindAsync(id);

    /// <inheritdoc/>
    public async Task<Transaction> CreateAsync(CreateTransactionRequest request)
    {
        var transaction = new Transaction
        {
            Symbol = request.Symbol.Trim(),
            Quantity = request.Quantity,
            UnitPrice = request.UnitPrice,
            TotalAmount = CalculateTotalAmount(request.Quantity, request.UnitPrice),
            Note = NormalizeNote(request.Note),
            Type = request.Type,
            Date = request.TransactionDate ?? DateTime.UtcNow,
        };

        await context.Transactions.AddAsync(transaction);
        await context.SaveChangesAsync();
        await marketPriceRefreshQueue.EnqueueAsync(transaction.Symbol);
        return transaction;
    }

    /// <inheritdoc/>
    public async Task<bool> UpdateAsync(int id, UpdateTransactionRequest request)
    {
        var transaction = await context.Transactions.FindAsync(id);
        if (transaction is null)
            return false;

        var oldSymbol = transaction.Symbol;
        transaction.Symbol = request.Symbol.Trim();
        transaction.Quantity = request.Quantity;
        transaction.UnitPrice = request.UnitPrice;
        transaction.TotalAmount = CalculateTotalAmount(request.Quantity, request.UnitPrice);
        transaction.Note = NormalizeNote(request.Note);
        transaction.Type = request.Type;
        transaction.Date = request.TransactionDate ?? transaction.Date;

        await context.SaveChangesAsync();
        await marketPriceRefreshQueue.EnqueueAsync(transaction.Symbol);

        if (!string.Equals(oldSymbol, transaction.Symbol, StringComparison.OrdinalIgnoreCase))
            await marketPriceRefreshQueue.EnqueueAsync(oldSymbol);

        return true;
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteAsync(int id)
    {
        var transaction = await context.Transactions.FindAsync(id);
        if (transaction is null)
            return false;

        var symbol = transaction.Symbol;
        context.Transactions.Remove(transaction);
        await context.SaveChangesAsync();
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
            transactions = transactions.Where(t => t.Symbol.ToUpper() == symbol);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{query.Search.Trim()}%";
            transactions = transactions.Where(t =>
                EF.Functions.ILike(t.Symbol, pattern)
                || (t.Note != null && EF.Functions.ILike(t.Note, pattern))
            );
        }

        return transactions;
    }

    private static string? NormalizeNote(string? note) =>
        string.IsNullOrWhiteSpace(note) ? null : note.Trim();

    private static decimal CalculateTotalAmount(decimal quantity, decimal unitPrice) =>
        quantity * unitPrice;
}
