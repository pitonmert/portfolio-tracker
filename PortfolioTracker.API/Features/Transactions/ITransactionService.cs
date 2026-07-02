using PortfolioTracker.API.Features.Transactions;

namespace PortfolioTracker.API.Features.Transactions;

public interface ITransactionService
{
    Task<IEnumerable<TransactionResponse>> GetAllAsync(
        TransactionQuery query,
        CancellationToken cancellationToken = default
    );

    Task<TransactionResponse?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<TransactionResponse> CreateAsync(
        CreateTransactionRequest request,
        CancellationToken cancellationToken = default
    );

    Task<bool> UpdateAsync(
        int id,
        UpdateTransactionRequest request,
        CancellationToken cancellationToken = default
    );

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
