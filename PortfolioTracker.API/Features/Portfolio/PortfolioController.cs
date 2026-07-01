using PortfolioTracker.API.Data;
using PortfolioTracker.API.Entities;
using PortfolioTracker.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace PortfolioTracker.API.Features.Portfolio;

[ApiController]
[Route("api/[controller]")]
public class PortfolioController(IPortfolioService portfolioService, ApplicationDbContext context)
    : ControllerBase
{
    [HttpGet("positions")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PortfolioPosition>>> GetPositions()
    {
        var positions = await portfolioService.GetPositionsAsync();
        return Ok(positions);
    }

    [HttpGet("cash-balance")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<PortfolioCashBalanceResponse>> GetCashBalance()
    {
        var settings = await GetSettingsAsync();
        return Ok(ToCashBalanceResponse(settings));
    }

    [HttpPut("cash-balance")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PortfolioCashBalanceResponse>> UpdateCashBalance(
        UpdatePortfolioCashBalanceRequest request
    )
    {
        if (request.CashBalance < 0)
            return BadRequest("Bakiye negatif olamaz.");

        var settings = await GetSettingsAsync();
        settings.CashBalance = request.CashBalance;
        settings.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        return Ok(ToCashBalanceResponse(settings));
    }

    private async Task<PortfolioSettings> GetSettingsAsync()
    {
        var settings = await context
            .PortfolioSettings.OrderBy(settings => settings.Id)
            .FirstOrDefaultAsync();
        if (settings is not null)
            return settings;

        settings = new PortfolioSettings { CashBalance = 0m, UpdatedAt = DateTime.UtcNow };

        await context.PortfolioSettings.AddAsync(settings);
        await context.SaveChangesAsync();
        return settings;
    }

    private static PortfolioCashBalanceResponse ToCashBalanceResponse(PortfolioSettings settings) =>
        new(settings.CashBalance, settings.UpdatedAt);
}
