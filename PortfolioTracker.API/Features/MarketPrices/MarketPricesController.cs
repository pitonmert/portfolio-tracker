using Microsoft.AspNetCore.Mvc;

namespace PortfolioTracker.API.Features.MarketPrices;

[ApiController]
[Route("api/market-prices")]
public class MarketPricesController(IMarketPriceService marketPriceService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<MarketPriceQuote>>> GetMany(
        [FromQuery] string? symbols,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(symbols))
            return Ok(Array.Empty<MarketPriceQuote>());

        var requestedSymbols = symbols.Split(
            ',',
            StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries
        );
        var quotes = await marketPriceService.GetQuotesAsync(requestedSymbols, cancellationToken);

        return Ok(quotes);
    }

    [HttpGet("{symbol}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<MarketPriceQuote>> GetOne(
        string symbol,
        CancellationToken cancellationToken
    )
    {
        var quote = await marketPriceService.GetQuoteAsync(symbol, cancellationToken);
        return Ok(quote);
    }

    [HttpPut("{symbol}/manual")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MarketPriceQuote>> SaveManualPrice(
        string symbol,
        ManualMarketPriceRequest request,
        CancellationToken cancellationToken
    )
    {
        if (request.CurrentPrice <= 0)
            return BadRequest("Güncel fiyat 0’dan büyük olmalı.");

        var quote = await marketPriceService.SaveManualPriceAsync(
            symbol,
            request.CurrentPrice,
            cancellationToken
        );
        return Ok(quote);
    }

    [HttpDelete("{symbol}/manual")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<MarketPriceQuote>> ClearManualPrice(
        string symbol,
        CancellationToken cancellationToken
    )
    {
        var quote = await marketPriceService.ClearManualPriceAsync(symbol, cancellationToken);
        return Ok(quote);
    }
}
