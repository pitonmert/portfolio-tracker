using System.Net;
using System.Net.Http.Json;
using PortfolioTracker.API.Contracts;
using PortfolioTracker.API.Entities;
using PortfolioTracker.API.Features.Portfolio;
using PortfolioTracker.API.Models;

namespace PortfolioTracker.API.IntegrationTests;

public class PortfolioControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    private static readonly System.Text.Json.JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() },
    };

    public PortfolioControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetPositions_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/portfolio/positions");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetPositions_AfterBuysAndSell_ReturnsCorrectNetQuantity()
    {
        var symbol = $"PORT{Guid.NewGuid():N}";
        await CreateTransactionAsync(symbol, 10m, 100m, TransactionType.Buy);
        await CreateTransactionAsync(symbol, 5m, 120m, TransactionType.Buy);
        await CreateTransactionAsync(symbol, 4m, 150m, TransactionType.Sell);

        var positions = await GetPositionsAsync();

        var position = Assert.Single(positions, p => p.Symbol == symbol);
        Assert.Equal(11m, position.NetQuantity);
    }

    [Fact]
    public async Task GetPositions_WithOnlySell_ReturnsZeroAverageCostAndSellAmountAsRealizedPnL()
    {
        var symbol = $"ONLYSELL{Guid.NewGuid():N}";
        await CreateTransactionAsync(symbol, 3m, 200m, TransactionType.Sell);

        var positions = await GetPositionsAsync();

        var position = Assert.Single(positions, p => p.Symbol == symbol);
        Assert.Equal(0m, position.AverageCost);
        Assert.Equal(600m, position.RealizedPnL);
    }

    [Fact]
    public async Task GetPositions_AfterClosedPositionAndNewBuy_ResetsAverageCost()
    {
        var symbol = $"RESET{Guid.NewGuid():N}";
        var startDate = new DateTime(2026, 5, 18, 9, 0, 0, DateTimeKind.Utc);

        await CreateTransactionAsync(symbol, 10m, 100m, TransactionType.Buy, startDate);
        await CreateTransactionAsync(
            symbol,
            10m,
            80m,
            TransactionType.Sell,
            startDate.AddMinutes(1)
        );
        await CreateTransactionAsync(
            symbol,
            5m,
            192m,
            TransactionType.Buy,
            startDate.AddMinutes(2)
        );

        var positions = await GetPositionsAsync();

        var position = Assert.Single(positions, p => p.Symbol == symbol);
        Assert.Equal(5m, position.NetQuantity);
        Assert.Equal(192m, position.AverageCost);
        Assert.Equal(-200m, position.RealizedPnL);
    }

    [Fact]
    public async Task UpdateCashBalance_PersistsValue()
    {
        var response = await _client.PutAsJsonAsync(
            "/api/portfolio/cash-balance",
            new UpdatePortfolioCashBalanceRequest(642.11m)
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<PortfolioCashBalanceResponse>(
            _jsonOptions
        );
        Assert.NotNull(updated);
        Assert.Equal(642.11m, updated!.CashBalance);

        var getResponse = await _client.GetAsync("/api/portfolio/cash-balance");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var current = await getResponse.Content.ReadFromJsonAsync<PortfolioCashBalanceResponse>(
            _jsonOptions
        );
        Assert.NotNull(current);
        Assert.Equal(642.11m, current!.CashBalance);
    }

    [Fact]
    public async Task UpdateCashBalance_WithNegativeValue_ReturnsBadRequest()
    {
        var response = await _client.PutAsJsonAsync(
            "/api/portfolio/cash-balance",
            new UpdatePortfolioCashBalanceRequest(-1m)
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private async Task<List<PortfolioPosition>> GetPositionsAsync()
    {
        var response = await _client.GetAsync("/api/portfolio/positions");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var positions = await response.Content.ReadFromJsonAsync<List<PortfolioPosition>>(
            _jsonOptions
        );
        Assert.NotNull(positions);
        return positions!;
    }

    private async Task CreateTransactionAsync(
        string symbol,
        decimal quantity,
        decimal unitPrice,
        TransactionType type,
        DateTime? transactionDate = null
    )
    {
        var request = new CreateTransactionRequest(
            symbol,
            quantity,
            unitPrice,
            null,
            type,
            transactionDate ?? DateTime.UtcNow
        );

        var response = await _client.PostAsJsonAsync("/api/transactions", request);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }
}

public class EmptyCustomWebApplicationFactory : CustomWebApplicationFactory { }

public class EmptyPortfolioControllerTests : IClassFixture<EmptyCustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    private static readonly System.Text.Json.JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() },
    };

    public EmptyPortfolioControllerTests(EmptyCustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetPositions_WithEmptyDatabase_ReturnsEmptyList()
    {
        var response = await _client.GetAsync("/api/portfolio/positions");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var positions = await response.Content.ReadFromJsonAsync<List<PortfolioPosition>>(
            _jsonOptions
        );
        Assert.NotNull(positions);
        Assert.Empty(positions!);
    }

    [Fact]
    public async Task GetCashBalance_WhenMissing_ReturnsZero()
    {
        var response = await _client.GetAsync("/api/portfolio/cash-balance");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var cashBalance = await response.Content.ReadFromJsonAsync<PortfolioCashBalanceResponse>(
            _jsonOptions
        );
        Assert.NotNull(cashBalance);
        Assert.Equal(0m, cashBalance!.CashBalance);
    }
}
