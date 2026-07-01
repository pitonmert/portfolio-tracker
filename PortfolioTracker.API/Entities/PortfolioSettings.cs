namespace PortfolioTracker.API.Entities;

public class PortfolioSettings
{
    public int Id { get; set; }

    public decimal CashBalance { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
