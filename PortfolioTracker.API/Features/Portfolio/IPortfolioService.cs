using PortfolioTracker.API.Features.Portfolio;

namespace PortfolioTracker.API.Features.Portfolio;

public interface IPortfolioService
{
    Task<IReadOnlyList<PortfolioPosition>> GetPositionsAsync(
        CancellationToken cancellationToken = default
    );

    Task<PortfolioDashboardResponse> GetDashboardAsync(
        CancellationToken cancellationToken = default
    );

    Task<PortfolioCashBalanceResponse> GetCashBalanceAsync(
        CancellationToken cancellationToken = default
    );

    Task<PortfolioCashBalanceResponse> UpdateCashBalanceAsync(
        decimal cashBalance,
        CancellationToken cancellationToken = default
    );
}
