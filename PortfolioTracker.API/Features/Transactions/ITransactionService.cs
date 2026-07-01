using PortfolioTracker.API.Features.Transactions;

namespace PortfolioTracker.API.Features.Transactions;

/// <summary>
/// Defines the CRUD operations available for investment transactions.
/// Abstracts over the concrete implementation to allow unit testing and future substitution.
/// </summary>
public interface ITransactionService
{
    /// <summary>Returns all transactions that match the given filter criteria, sorted by date descending.</summary>
    Task<IEnumerable<TransactionResponse>> GetAllAsync(TransactionQuery query);

    /// <summary>Returns the transaction with the specified <paramref name="id"/>, or <c>null</c> if not found.</summary>
    Task<TransactionResponse?> GetByIdAsync(int id);

    /// <summary>Creates a new transaction from the provided request and persists it to the database.</summary>
    Task<TransactionResponse> CreateAsync(CreateTransactionRequest request);

    /// <summary>
    /// Updates the transaction identified by <paramref name="id"/> with the values from <paramref name="request"/>.
    /// Returns <c>false</c> when the transaction does not exist.
    /// </summary>
    Task<bool> UpdateAsync(int id, UpdateTransactionRequest request);

    /// <summary>
    /// Deletes the transaction with the given <paramref name="id"/>.
    /// Returns <c>false</c> when the transaction does not exist.
    /// </summary>
    Task<bool> DeleteAsync(int id);
}
