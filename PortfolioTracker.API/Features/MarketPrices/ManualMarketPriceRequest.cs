using System.ComponentModel.DataAnnotations;

namespace PortfolioTracker.API.Features.MarketPrices;

public record ManualMarketPriceRequest([Range(0.00000001, double.MaxValue)] decimal CurrentPrice);
