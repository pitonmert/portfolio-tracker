using System.ComponentModel.DataAnnotations;
using PortfolioTracker.API.Entities;

namespace PortfolioTracker.API.Contracts;

/// <summary>
/// Payload for creating a new investment transaction.
/// </summary>
public record CreateTransactionRequest(
    [Required, MaxLength(120)] string Symbol,
    [Range(0.00000001, double.MaxValue)] decimal Quantity,
    [Range(0.00000001, double.MaxValue)] decimal UnitPrice,
    [MaxLength(500)] string? Note,
    [EnumDataType(typeof(TransactionType))] TransactionType Type,
    DateTime? TransactionDate
);
