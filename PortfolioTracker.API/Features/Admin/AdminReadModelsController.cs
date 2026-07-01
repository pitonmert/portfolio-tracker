using Microsoft.AspNetCore.Mvc;
using PortfolioTracker.API.Features.Portfolio;

namespace PortfolioTracker.API.Features.Admin;

[ApiController]
[Route("api/admin/read-models/portfolio-positions")]
public class AdminReadModelsController(
    IConfiguration configuration,
    IPortfolioPositionRecalculationQueue portfolioPositionQueue
) : ControllerBase
{
    private const string AdminTokenHeader = "X-Admin-Token";

    [HttpPost("rebuild")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RebuildPortfolioPositions(
        CancellationToken cancellationToken
    )
    {
        var configuredToken = configuration["Admin:ReadModelRebuildToken"];
        if (string.IsNullOrWhiteSpace(configuredToken))
            return NotFound();

        if (
            !Request.Headers.TryGetValue(AdminTokenHeader, out var providedToken)
            || providedToken.Count != 1
            || !string.Equals(providedToken[0], configuredToken, StringComparison.Ordinal)
        )
        {
            return Unauthorized();
        }

        await portfolioPositionQueue.EnqueueRebuildAllAsync(cancellationToken);
        return Accepted(new { status = "queued" });
    }
}
