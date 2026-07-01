using Microsoft.AspNetCore.Mvc;

namespace PortfolioTracker.API.Features.Transactions;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController(ITransactionService transactionService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] TransactionQuery query,
        CancellationToken cancellationToken
    )
    {
        var transactions = await transactionService.GetAllAsync(query, cancellationToken);
        return Ok(transactions);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var transaction = await transactionService.GetByIdAsync(id, cancellationToken);
        if (transaction is null)
            return NotFound();

        return Ok(transaction);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        CreateTransactionRequest request,
        CancellationToken cancellationToken
    )
    {
        TransactionResponse transaction;
        try
        {
            transaction = await transactionService.CreateAsync(request, cancellationToken);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }

        return CreatedAtAction(nameof(GetById), new { id = transaction.Id }, transaction);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        int id,
        UpdateTransactionRequest request,
        CancellationToken cancellationToken
    )
    {
        if (id != request.Id)
            return BadRequest();

        bool updated;
        try
        {
            updated = await transactionService.UpdateAsync(id, request, cancellationToken);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }

        if (!updated)
            return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await transactionService.DeleteAsync(id, cancellationToken);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
