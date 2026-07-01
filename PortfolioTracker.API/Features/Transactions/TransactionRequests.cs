using System.ComponentModel.DataAnnotations;
using PortfolioTracker.API.Domain.Entities;

namespace PortfolioTracker.API.Features.Transactions;

/// <summary>
/// Payload for creating a new investment transaction.
/// </summary>
public record CreateTransactionRequest(
    int? AssetId,
    [Required, MaxLength(120)] string Symbol,
    [Range(0.00000001, double.MaxValue)] decimal Quantity,
    [Range(0.00000001, double.MaxValue)] decimal UnitPrice,
    [MaxLength(500)] string? Note,
    [EnumDataType(typeof(TransactionType))] TransactionType Type,
    DateTime? TransactionDate
);

/// <summary>
/// Payload for updating an existing investment transaction.
/// The <see cref="Id"/> must match the route parameter to prevent accidental overwrites.
/// </summary>
public record UpdateTransactionRequest(
    int Id,
    int? AssetId,
    [Required, MaxLength(120)] string Symbol,
    [Range(0.00000001, double.MaxValue)] decimal Quantity,
    [Range(0.00000001, double.MaxValue)] decimal UnitPrice,
    [MaxLength(500)] string? Note,
    [EnumDataType(typeof(TransactionType))] TransactionType Type,
    DateTime? TransactionDate
);

/// <summary>
/// Query parameters accepted by the GET /transactions endpoint for filtering results.
/// </summary>
public record TransactionQuery(
    [EnumDataType(typeof(TransactionType))] TransactionType? Type,
    [MaxLength(120)] string? Search,
    [MaxLength(120)] string? Symbol
);

public record TransactionResponse(
    int Id,
    int AssetId,
    string Symbol,
    decimal Quantity,
    decimal UnitPrice,
    decimal TotalAmount,
    string? Note,
    TransactionType Type,
    DateTime TransactionDate
)
{
    public static TransactionResponse FromEntity(Transaction transaction) =>
        new(
            transaction.Id,
            transaction.AssetId,
            transaction.Asset.Symbol,
            transaction.Quantity,
            transaction.UnitPrice,
            transaction.TotalAmount,
            transaction.Note,
            transaction.Type,
            transaction.Date
        );
}
