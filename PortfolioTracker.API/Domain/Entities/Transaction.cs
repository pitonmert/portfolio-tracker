using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PortfolioTracker.API.Domain.Entities;

// Direction of a portfolio transaction.
public enum TransactionType
{
    // Increases the position quantity. Value=0
    Buy,

    // Decreases the position quantity. Value=1
    Sell,
}

// Stores a single buy or sell operation for an asset.
public class Transaction
{
    // Database identity value.
    public int Id { get; set; }

    // Related asset identity.
    public int AssetId { get; set; }

    public Asset Asset { get; set; } = null!;

    // Number of units bought or sold.
    public decimal Quantity { get; set; }

    // Unit price at the time of the transaction.
    public decimal UnitPrice { get; set; }

    // Gross transaction amount stored to avoid recalculation drift.
    public decimal TotalAmount { get; set; }

    // Optional user note.
    public string? Note { get; set; }

    // Buy or sell direction.
    public TransactionType Type { get; set; }

    // Persisted transaction timestamp column.
    [Column("TransactionDate")]
    [JsonIgnore]
    public DateTime Date { get; set; } = DateTime.UtcNow;

    // API-facing alias for Date.
    [NotMapped]
    public DateTime TransactionDate
    {
        get => Date;
        set => Date = value;
    }
}
