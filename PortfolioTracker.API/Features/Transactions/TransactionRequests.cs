using System.ComponentModel.DataAnnotations;
using PortfolioTracker.API.Domain.Entities;

namespace PortfolioTracker.API.Features.Transactions;

public record CreateTransactionRequest(
    int? AssetId,
    [MaxLength(120)] string? Symbol,
    [Range(0.00000001, double.MaxValue)] decimal Quantity,
    [Range(0.00000001, double.MaxValue)] decimal UnitPrice,
    [MaxLength(500)] string? Note,
    [EnumDataType(typeof(TransactionType))] TransactionType Type,
    DateTime? TransactionDate
);

public record UpdateTransactionRequest(
    int Id,
    int? AssetId,
    [MaxLength(120)] string? Symbol,
    [Range(0.00000001, double.MaxValue)] decimal Quantity,
    [Range(0.00000001, double.MaxValue)] decimal UnitPrice,
    [MaxLength(500)] string? Note,
    [EnumDataType(typeof(TransactionType))] TransactionType Type,
    DateTime? TransactionDate
);

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
