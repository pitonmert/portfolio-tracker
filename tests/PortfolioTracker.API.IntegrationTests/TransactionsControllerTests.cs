using System.Net;
using System.Net.Http.Json;
using PortfolioTracker.API.Contracts;
using PortfolioTracker.API.Entities;

namespace PortfolioTracker.API.IntegrationTests;

public class TransactionsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    private static readonly System.Text.Json.JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() },
    };

    public TransactionsControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/transactions");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_WithTypeFilter_ReturnsOnlyMatchingType()
    {
        var prefix = $"TYPE{Guid.NewGuid():N}";
        await CreateTransactionAsync(symbol: $"{prefix}-BUY", type: TransactionType.Buy);
        await CreateTransactionAsync(symbol: $"{prefix}-SELL", type: TransactionType.Sell);

        var response = await _client.GetAsync($"/api/transactions?type=Sell&search={prefix}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var transactions = await response.Content.ReadFromJsonAsync<List<Transaction>>(
            _jsonOptions
        );
        Assert.NotNull(transactions);
        Assert.NotEmpty(transactions);
        Assert.All(transactions!, t => Assert.Equal(TransactionType.Sell, t.Type));
    }

    [Fact]
    public async Task GetAll_WithSearch_ReturnsSymbolAndNoteMatches()
    {
        var prefix = $"SEARCH{Guid.NewGuid():N}";
        await CreateTransactionAsync(symbol: $"{prefix}-ASSET", note: "asset match");
        await CreateTransactionAsync(symbol: "NOTE-MATCH", note: $"{prefix} note match");

        var response = await _client.GetAsync($"/api/transactions?search={prefix}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var transactions = await response.Content.ReadFromJsonAsync<List<Transaction>>(
            _jsonOptions
        );
        Assert.NotNull(transactions);
        Assert.Contains(
            transactions!,
            t => t.Symbol.Contains(prefix, StringComparison.OrdinalIgnoreCase)
        );
        Assert.Contains(
            transactions!,
            t => t.Note?.Contains(prefix, StringComparison.OrdinalIgnoreCase) == true
        );
        Assert.All(
            transactions!,
            t =>
                Assert.True(
                    t.Symbol.Contains(prefix, StringComparison.OrdinalIgnoreCase)
                        || (t.Note?.Contains(prefix, StringComparison.OrdinalIgnoreCase) == true)
                )
        );
    }

    [Fact]
    public async Task GetAll_WithSymbolFilter_TrimsAndIgnoresCase()
    {
        var symbol = $"SYMBOL{Guid.NewGuid():N}".ToUpperInvariant();
        await CreateTransactionAsync(symbol: symbol);
        await CreateTransactionAsync(symbol: $"{symbol}-OTHER");

        var query = Uri.EscapeDataString($" {symbol.ToLowerInvariant()} ");
        var response = await _client.GetAsync($"/api/transactions?symbol={query}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var transactions = await response.Content.ReadFromJsonAsync<List<Transaction>>(
            _jsonOptions
        );
        var transaction = Assert.Single(transactions!);
        Assert.Equal(symbol, transaction.Symbol);
    }

    [Fact]
    public async Task GetAll_ReturnsTransactionsByDateDescending()
    {
        var prefix = $"SORT{Guid.NewGuid():N}";
        await CreateTransactionAsync(
            symbol: $"{prefix}-OLD",
            transactionDate: DateTime.UtcNow.AddDays(-2)
        );
        await CreateTransactionAsync(symbol: $"{prefix}-NEW", transactionDate: DateTime.UtcNow);

        var response = await _client.GetAsync($"/api/transactions?search={prefix}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var transactions = await response.Content.ReadFromJsonAsync<List<Transaction>>(
            _jsonOptions
        );
        Assert.NotNull(transactions);
        Assert.True(transactions!.Count >= 2);
        var dates = transactions.Select(t => t.TransactionDate).ToList();
        Assert.Equal(dates.OrderByDescending(d => d), dates);
    }

    [Fact]
    public async Task Create_WithValidData_ReturnsCreated()
    {
        var dto = new CreateTransactionRequest(
            "GARAN",
            10m,
            100m,
            "Test işlem",
            TransactionType.Buy,
            null
        );

        var response = await _client.PostAsJsonAsync("/api/transactions", dto);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Create_WithNegativeQuantity_ReturnsBadRequest()
    {
        var dto = new CreateTransactionRequest("XAU", -1m, 100m, null, TransactionType.Buy, null);

        var response = await _client.PostAsJsonAsync("/api/transactions", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_WithNegativeUnitPrice_ReturnsBadRequest()
    {
        var dto = new CreateTransactionRequest("XAG", 5m, -50m, null, TransactionType.Buy, null);

        var response = await _client.PostAsJsonAsync("/api/transactions", dto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetById_WithExistingId_ReturnsTransaction()
    {
        var transaction = await CreateTransactionAsync();

        var response = await _client.GetAsync($"/api/transactions/{transaction!.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetById_WithNonExistingId_ReturnsNotFound()
    {
        var response = await _client.GetAsync("/api/transactions/99999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_WithValidData_ReturnsNoContent()
    {
        var transaction = await CreateTransactionAsync();
        var dto = new UpdateTransactionRequest(
            transaction!.Id,
            "ALTIN",
            2m,
            200m,
            "Güncellendi",
            TransactionType.Sell,
            null
        );

        var response = await _client.PutAsJsonAsync($"/api/transactions/{transaction.Id}", dto);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Delete_WithExistingId_ReturnsNoContent()
    {
        var transaction = await CreateTransactionAsync();

        var response = await _client.DeleteAsync($"/api/transactions/{transaction!.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Delete_WithNonExistingId_ReturnsNotFound()
    {
        var response = await _client.DeleteAsync("/api/transactions/99999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private async Task<Transaction?> CreateTransactionAsync(
        string symbol = "GUMUS",
        decimal quantity = 3m,
        decimal unitPrice = 150m,
        string? note = "Test",
        TransactionType type = TransactionType.Buy,
        DateTime? transactionDate = null
    )
    {
        var dto = new CreateTransactionRequest(
            symbol,
            quantity,
            unitPrice,
            note,
            type,
            transactionDate
        );
        var response = await _client.PostAsJsonAsync("/api/transactions", dto);
        return await response.Content.ReadFromJsonAsync<Transaction>(_jsonOptions);
    }
}
