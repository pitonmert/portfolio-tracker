using System.ComponentModel.DataAnnotations;
using PortfolioTracker.API.Entities;

namespace PortfolioTracker.API.Contracts;

/// <summary>
/// Query parameters accepted by the GET /transactions endpoint for filtering results.
/// </summary>
public record TransactionQuery(
    [EnumDataType(typeof(TransactionType))] TransactionType? Type,
    [MaxLength(120)] string? Search,
    [MaxLength(120)] string? Symbol
);
