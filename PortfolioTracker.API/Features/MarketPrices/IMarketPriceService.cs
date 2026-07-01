namespace PortfolioTracker.API.Features.MarketPrices;

public interface IMarketPriceService
{
    Task<IReadOnlyList<MarketPriceQuote>> GetQuotesAsync(
        IEnumerable<string> symbols,
        CancellationToken cancellationToken
    );

    Task<MarketPriceQuote> GetQuoteAsync(string symbol, CancellationToken cancellationToken);

    Task<MarketPriceQuote> SaveManualPriceAsync(
        string symbol,
        decimal currentPrice,
        CancellationToken cancellationToken
    );

    Task<MarketPriceQuote> ClearManualPriceAsync(
        string symbol,
        CancellationToken cancellationToken
    );

    Task RefreshActiveSymbolsAsync(CancellationToken cancellationToken);

    Task<MarketPriceQuote> RefreshSymbolAsync(string symbol, CancellationToken cancellationToken);
}
