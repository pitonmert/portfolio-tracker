using Microsoft.AspNetCore.Mvc;

namespace PortfolioTracker.API.Features.Transactions;

/// <summary>
/// Exposes CRUD endpoints for investment transactions under <c>/api/transactions</c>.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TransactionsController(ITransactionService transactionService) : ControllerBase
{
    /// <summary>Returns all transactions, optionally filtered by type or keyword search.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] TransactionQuery query)
    {
        var transactions = await transactionService.GetAllAsync(query);
        return Ok(transactions);
    }

    /// <summary>Returns a single transaction by its ID.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var transaction = await transactionService.GetByIdAsync(id);
        if (transaction is null)
            return NotFound();

        return Ok(transaction);
    }

    /// <summary>Creates a new transaction and returns the created resource.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(CreateTransactionRequest request)
    {
        TransactionResponse transaction;
        try
        {
            transaction = await transactionService.CreateAsync(request);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }

        return CreatedAtAction(nameof(GetById), new { id = transaction.Id }, transaction);
    }

    /// <summary>
    /// Fully replaces an existing transaction.
    /// The <c>id</c> in the route must match the <c>Id</c> field in the request body.
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, UpdateTransactionRequest request)
    {
        // Prevent silently updating a different record than the one referenced in the URL.
        if (id != request.Id)
            return BadRequest();

        bool updated;
        try
        {
            updated = await transactionService.UpdateAsync(id, request);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }

        if (!updated)
            return NotFound();

        return NoContent();
    }

    /// <summary>Deletes the transaction with the given ID.</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await transactionService.DeleteAsync(id);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
