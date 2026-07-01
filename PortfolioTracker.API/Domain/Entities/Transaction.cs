using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PortfolioTracker.API.Domain.Entities;

public enum TransactionType
{
    Buy,

    Sell,
}

public class Transaction
{
    public int Id { get; set; }

    public int AssetId { get; set; }

    public Asset Asset { get; set; } = null!;

    public decimal Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal TotalAmount { get; set; }

    public string? Note { get; set; }

    public TransactionType Type { get; set; }

    [Column("TransactionDate")]
    [JsonIgnore]
    public DateTime Date { get; set; } = DateTime.UtcNow;

    // Keeps the API contract readable while the database column remains TransactionDate.
    [NotMapped]
    public DateTime TransactionDate
    {
        get => Date;
        set => Date = value;
    }
}
