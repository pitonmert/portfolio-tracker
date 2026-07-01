using PortfolioTracker.API.Models;

namespace PortfolioTracker.API.Features.Portfolio;

public interface IPortfolioService
{
    Task<IEnumerable<PortfolioPosition>> GetPositionsAsync();
}
