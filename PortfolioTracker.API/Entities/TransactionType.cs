namespace PortfolioTracker.API.Entities;

/// <summary>
/// Represents the direction of an investment transaction.
/// </summary>
public enum TransactionType
{
    /// <summary>Acquiring an asset (increases position).</summary>
    Buy,

    /// <summary>Disposing of an asset (reduces position).</summary>
    Sell,
}
