using Microsoft.AspNetCore.Mvc;
using PortfolioTracker.API.Features.Portfolio;

namespace PortfolioTracker.API.Features.Portfolio;

[ApiController]
[Route("api/[controller]")]
public class PortfolioController(IPortfolioService portfolioService) : ControllerBase
{
    [HttpGet("positions")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PortfolioPosition>>> GetPositions(
        CancellationToken cancellationToken
    )
    {
        var positions = await portfolioService.GetPositionsAsync(cancellationToken);
        return Ok(positions);
    }

    [HttpGet("dashboard")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<PortfolioDashboardResponse>> GetDashboard(
        CancellationToken cancellationToken
    )
    {
        var dashboard = await portfolioService.GetDashboardAsync(cancellationToken);
        return Ok(dashboard);
    }

    [HttpGet("cash-balance")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<PortfolioCashBalanceResponse>> GetCashBalance(
        CancellationToken cancellationToken
    )
    {
        var cashBalance = await portfolioService.GetCashBalanceAsync(cancellationToken);
        return Ok(cashBalance);
    }

    [HttpPut("cash-balance")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PortfolioCashBalanceResponse>> UpdateCashBalance(
        UpdatePortfolioCashBalanceRequest request,
        CancellationToken cancellationToken
    )
    {
        if (request.CashBalance < 0)
            return BadRequest("Bakiye negatif olamaz.");

        var cashBalance = await portfolioService.UpdateCashBalanceAsync(
            request.CashBalance,
            cancellationToken
        );
        return Ok(cashBalance);
    }
}
