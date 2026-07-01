using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PortfolioTracker.API.Entities;

/// <summary>
/// Represents a single investment transaction (buy or sell) for a tracked asset.
/// </summary>
public class Transaction
{
    /// <summary>Auto-generated primary key.</summary>
    public int Id { get; set; }

    /// <summary>Ticker symbol or human-readable name of the asset (e.g. "AAPL", "Gold").</summary>
    public string Symbol { get; set; } = string.Empty;

    /// <summary>Number of units involved in the transaction.</summary>
    public decimal Quantity { get; set; }

    /// <summary>Price per single unit at the time of the transaction.</summary>
    public decimal UnitPrice { get; set; }

    /// <summary>
    /// Exact gross value of the transaction as reported by the broker.
    /// No longer computed at runtime to prevent rounding mismatch issues.
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>Optional free-text remark about this transaction.</summary>
    public string? Note { get; set; }

    /// <summary>Whether the transaction was a purchase or a sale.</summary>
    public TransactionType Type { get; set; }

    /// <summary>Timestamp of when the transaction occurred. Format from JSON is DD/MM/YY HH:mm:ss</summary>
    [Column("TransactionDate")]
    [JsonIgnore]
    public DateTime Date { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public DateTime TransactionDate
    {
        get => Date;
        set => Date = value;
    }
}
