namespace PortfolioTracker.API.Features.MarketPrices;

public class MarketDataServiceOptions
{
    public string BaseUrl { get; set; } = "http://market-data-service:8000";

    public int RequestTimeoutSeconds { get; set; } = 10;

    public int RefreshIntervalMinutes { get; set; } = 10;
}

