using System.ComponentModel.DataAnnotations;
using PortfolioTracker.API.Entities;

namespace PortfolioTracker.API.Contracts;

/// <summary>
/// Payload for updating an existing investment transaction.
/// The <see cref="Id"/> must match the route parameter to prevent accidental overwrites.
/// </summary>
public record UpdateTransactionRequest(
    int Id,
    [Required, MaxLength(120)] string Symbol,
    [Range(0.00000001, double.MaxValue)] decimal Quantity,
    [Range(0.00000001, double.MaxValue)] decimal UnitPrice,
    [MaxLength(500)] string? Note,
    [EnumDataType(typeof(TransactionType))] TransactionType Type,
    DateTime? TransactionDate
);
