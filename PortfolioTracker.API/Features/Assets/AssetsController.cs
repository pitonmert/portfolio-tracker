using Microsoft.AspNetCore.Mvc;

namespace PortfolioTracker.API.Features.Assets;

[ApiController]
[Route("api/assets")]
public class AssetsController(
    IAssetSearchService assetSearchService,
    IAssetSyncService assetSyncService
) : ControllerBase
{
    [HttpGet("search")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AssetSearchResult>>> Search(
        [FromQuery] string q = "",
        [FromQuery] string assetType = "auto",
        [FromQuery] int limit = 8,
        CancellationToken cancellationToken = default
    )
    {
        var results = await assetSearchService.SearchAsync(q, assetType, limit, cancellationToken);
        return Ok(results);
    }

    [HttpPost("sync")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<AssetSyncResult>> Sync(
        CancellationToken cancellationToken = default
    )
    {
        var result = await assetSyncService.SyncAsync(cancellationToken);
        return Ok(result);
    }
}
