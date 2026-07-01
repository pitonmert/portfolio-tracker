namespace PortfolioTracker.API.Features.MarketPrices;

public interface IMarketPriceProvider
{
    Task<MarketPriceQuote> GetQuoteAsync(string symbol, CancellationToken cancellationToken);
}

