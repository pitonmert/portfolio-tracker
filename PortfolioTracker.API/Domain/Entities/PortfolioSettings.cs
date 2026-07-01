namespace PortfolioTracker.API.Domain.Entities;

// Stores global portfolio-level user settings.
public class PortfolioSettings
{
    // Database identity value.
    public int Id { get; set; }

    // Cash amount not tied to an open asset position.
    public decimal CashBalance { get; set; }

    // Last time these settings were changed.
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
