using PortfolioTracker.API.Data;
using PortfolioTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace PortfolioTracker.API.Features.Portfolio;

public class PortfolioService(ApplicationDbContext context) : IPortfolioService
{
    public async Task<IEnumerable<PortfolioPosition>> GetPositionsAsync()
    {
        var transactions = await context
            .Transactions.AsNoTracking()
            .OrderBy(t => t.Symbol)
            .ThenBy(t => t.Date)
            .ThenBy(t => t.Id)
            .ToListAsync();

        return transactions
            .GroupBy(t => t.Symbol)
            .Select(PortfolioCalculations.CalculatePosition)
            .OrderBy(p => p.Symbol)
            .ToList();
    }
}
