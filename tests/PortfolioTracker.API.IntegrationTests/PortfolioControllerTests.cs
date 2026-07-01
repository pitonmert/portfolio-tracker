using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using PortfolioTracker.API.Domain.Entities;
using PortfolioTracker.API.Features.MarketPrices;
using PortfolioTracker.API.Features.Portfolio;
using PortfolioTracker.API.Features.Transactions;
using PortfolioTracker.API.Infrastructure.Persistence;

namespace PortfolioTracker.API.IntegrationTests;

public class PortfolioControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    private static readonly System.Text.Json.JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() },
    };

    public PortfolioControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
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
        var symbol = $"PORT{Guid.NewGuid():N}".ToUpperInvariant();
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
        var symbol = $"ONLYSELL{Guid.NewGuid():N}".ToUpperInvariant();
        await CreateTransactionAsync(symbol, 3m, 200m, TransactionType.Sell);

        var positions = await GetPositionsAsync();

        var position = Assert.Single(positions, p => p.Symbol == symbol);
        Assert.Equal(0m, position.AverageCost);
        Assert.Equal(600m, position.RealizedPnL);
    }

    [Fact]
    public async Task GetPositions_AfterClosedPositionAndNewBuy_ResetsAverageCost()
    {
        var symbol = $"RESET{Guid.NewGuid():N}".ToUpperInvariant();
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
    public async Task GetPositions_WithCatalogAsset_ReturnsMarket()
    {
        var symbol = $"MK{Guid.NewGuid():N}"[..12].ToUpperInvariant();
        await CreateAssetAsync(symbol, "BIST");
        await CreateTransactionAsync(symbol, 2m, 100m, TransactionType.Buy);

        var positions = await GetPositionsAsync();

        var position = Assert.Single(positions, p => p.Symbol == symbol);
        Assert.Equal("BIST", position.Market);
    }

    [Fact]
    public async Task GetDashboard_WithManualPrice_ReturnsCalculatedPositionMetrics()
    {
        var symbol = $"DASH{Guid.NewGuid():N}"[..12].ToUpperInvariant();
        await CreateTransactionAsync(symbol, 10m, 5m, TransactionType.Buy);
        await SaveManualPriceAsync(symbol, 8m);

        var dashboard = await GetDashboardAsync();

        var position = Assert.Single(dashboard.Positions, p => p.Symbol == symbol);
        Assert.False(position.IsClosed);
        Assert.Equal(50m, position.ActivePositionCost);
        Assert.Equal(8m, position.CurrentPrice);
        Assert.Equal(80m, position.MarketValue);
        Assert.Equal(30m, position.UnrealizedPnL);
        Assert.Equal(30m, position.TotalPnL);
        Assert.Equal(60m, position.PnLPercent);
        Assert.NotNull(position.MarketPrice);
        Assert.True(position.MarketPrice!.IsManual);
    }

    [Fact]
    public async Task GetDashboard_WithDuplicateSymbols_UsesAssetIdForMarketPrice()
    {
        var symbol = $"DUP{Guid.NewGuid():N}"[..12].ToUpperInvariant();
        var stockAssetId = await CreateAssetAsync(symbol, "BIST");
        var fundAssetId = await CreateAssetAsync(symbol, "TEFAS");
        var date = new DateTime(2026, 6, 30, 12, 0, 0, DateTimeKind.Utc);

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Transactions.AddRange(
                new Transaction
                {
                    AssetId = stockAssetId,
                    Quantity = 1m,
                    UnitPrice = 10m,
                    TotalAmount = 10m,
                    Type = TransactionType.Buy,
                    Date = date,
                },
                new Transaction
                {
                    AssetId = fundAssetId,
                    Quantity = 1m,
                    UnitPrice = 10m,
                    TotalAmount = 10m,
                    Type = TransactionType.Buy,
                    Date = date.AddMinutes(1),
                }
            );
            db.MarketPrices.AddRange(
                new MarketPrice
                {
                    AssetId = stockAssetId,
                    Symbol = symbol,
                    ProviderSymbol = symbol,
                    CurrentPrice = 20m,
                    FetchedAt = date,
                    IsAvailable = true,
                },
                new MarketPrice
                {
                    AssetId = fundAssetId,
                    Symbol = symbol,
                    ProviderSymbol = symbol,
                    CurrentPrice = 30m,
                    FetchedAt = date,
                    IsAvailable = true,
                }
            );
            await db.SaveChangesAsync();
        }

        await RebuildPortfolioPositionsAsync();

        var dashboard = await GetDashboardAsync();

        Assert.Equal(2, dashboard.Positions.Count(position => position.Symbol == symbol));
        var stockPosition = Assert.Single(
            dashboard.Positions,
            position => position.AssetId == stockAssetId
        );
        var fundPosition = Assert.Single(
            dashboard.Positions,
            position => position.AssetId == fundAssetId
        );
        Assert.Equal(20m, stockPosition.CurrentPrice);
        Assert.Equal(30m, fundPosition.CurrentPrice);
    }

    [Fact]
    public async Task GetDashboard_WithClosedPosition_UsesRealizedPnLOnly()
    {
        var symbol = $"CLOSED{Guid.NewGuid():N}"[..12].ToUpperInvariant();
        var startDate = new DateTime(2026, 6, 30, 9, 0, 0, DateTimeKind.Utc);

        await CreateTransactionAsync(symbol, 10m, 100m, TransactionType.Buy, startDate);
        await CreateTransactionAsync(
            symbol,
            10m,
            80m,
            TransactionType.Sell,
            startDate.AddMinutes(1)
        );

        var dashboard = await GetDashboardAsync();

        var position = Assert.Single(dashboard.Positions, p => p.Symbol == symbol);
        Assert.True(position.IsClosed);
        Assert.Equal(0m, position.ActivePositionCost);
        Assert.Equal(0m, position.MarketValue);
        Assert.Equal(0m, position.UnrealizedPnL);
        Assert.Equal(-200m, position.RealizedPnL);
        Assert.Equal(-200m, position.TotalPnL);
        Assert.Null(position.PnLPercent);
    }

    [Fact]
    public async Task GetDashboard_WhenPriceIsMissing_FallsBackSafely()
    {
        var symbol = $"MISS{Guid.NewGuid():N}"[..12].ToUpperInvariant();
        await CreateTransactionAsync(symbol, 2m, 25m, TransactionType.Buy);

        var dashboard = await GetDashboardAsync();

        var position = Assert.Single(dashboard.Positions, p => p.Symbol == symbol);
        Assert.False(position.IsClosed);
        Assert.Equal(50m, position.ActivePositionCost);
        Assert.Null(position.CurrentPrice);
        Assert.Equal(0m, position.MarketValue);
        Assert.Equal(0m, position.UnrealizedPnL);
        Assert.Equal(0m, position.TotalPnL);
        Assert.Equal(0m, position.PnLPercent);
        Assert.NotNull(position.MarketPrice);
        Assert.False(position.MarketPrice!.IsAvailable);
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

    [Fact]
    public async Task RebuildPortfolioPositions_WhenAdminTokenIsMissing_ReturnsNotFound()
    {
        var response = await _client.PostAsync(
            "/api/admin/read-models/portfolio-positions/rebuild",
            null
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task RebuildPortfolioPositions_WithInvalidAdminToken_ReturnsUnauthorized()
    {
        var client = _factory
            .WithWebHostBuilder(builder =>
                builder.UseSetting("Admin:ReadModelRebuildToken", "secret-token")
            )
            .CreateClient();
        var request = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/admin/read-models/portfolio-positions/rebuild"
        );
        request.Headers.Add("X-Admin-Token", "wrong-token");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RebuildPortfolioPositions_WithValidAdminToken_ReturnsAccepted()
    {
        var client = _factory
            .WithWebHostBuilder(builder =>
                builder.UseSetting("Admin:ReadModelRebuildToken", "secret-token")
            )
            .CreateClient();
        var request = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/admin/read-models/portfolio-positions/rebuild"
        );
        request.Headers.Add("X-Admin-Token", "secret-token");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
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

    private async Task<PortfolioDashboardResponse> GetDashboardAsync()
    {
        var response = await _client.GetAsync("/api/portfolio/dashboard");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var dashboard = await response.Content.ReadFromJsonAsync<PortfolioDashboardResponse>(
            _jsonOptions
        );
        Assert.NotNull(dashboard);
        return dashboard!;
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
            null,
            symbol,
            quantity,
            unitPrice,
            null,
            type,
            transactionDate ?? DateTime.UtcNow
        );

        var response = await _client.PostAsJsonAsync("/api/transactions", request);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var transaction = await response.Content.ReadFromJsonAsync<TransactionResponse>(
            _jsonOptions
        );
        Assert.NotNull(transaction);
        await RecalculatePortfolioPositionAsync(transaction!.AssetId);
    }

    private async Task<int> CreateAssetAsync(string symbol, string market)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var asset = new Asset
        {
            Symbol = symbol,
            Name = $"{symbol} Test Asset",
            AssetType = market == "TEFAS" ? "fund" : "stock",
            Market = market,
            Currency = "TRY",
            ProviderSymbol = symbol,
            Source = "test",
            IsActive = true,
            LastSyncedAt = DateTime.UtcNow,
        };
        db.Assets.Add(asset);

        await db.SaveChangesAsync();
        return asset.Id;
    }

    private async Task SaveManualPriceAsync(string symbol, decimal currentPrice)
    {
        var response = await _client.PutAsJsonAsync(
            $"/api/market-prices/{symbol}/manual",
            new ManualMarketPriceRequest(currentPrice)
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await RebuildPortfolioPositionsAsync();
    }

    private async Task RecalculatePortfolioPositionAsync(int assetId)
    {
        using var scope = _factory.Services.CreateScope();
        var recalculationService =
            scope.ServiceProvider.GetRequiredService<IPortfolioPositionRecalculationService>();
        await recalculationService.RecalculateAssetAsync(assetId, CancellationToken.None);
    }

    private async Task RebuildPortfolioPositionsAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var recalculationService =
            scope.ServiceProvider.GetRequiredService<IPortfolioPositionRecalculationService>();
        await recalculationService.RebuildAllAsync(CancellationToken.None);
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
    public async Task GetDashboard_WithEmptyDatabase_ReturnsEmptyDashboard()
    {
        var response = await _client.GetAsync("/api/portfolio/dashboard");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dashboard = await response.Content.ReadFromJsonAsync<PortfolioDashboardResponse>(
            _jsonOptions
        );
        Assert.NotNull(dashboard);
        Assert.Empty(dashboard!.Positions);
        Assert.Equal(0m, dashboard.Summary.CashBalance);
        Assert.Equal(0m, dashboard.Summary.TotalPortfolioValue);
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

public class CashDashboardCustomWebApplicationFactory : CustomWebApplicationFactory { }

public class CashDashboardPortfolioControllerTests
    : IClassFixture<CashDashboardCustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    private static readonly System.Text.Json.JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() },
    };

    public CashDashboardPortfolioControllerTests(CashDashboardCustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetDashboard_IncludesCashBalanceInSummary()
    {
        var updateResponse = await _client.PutAsJsonAsync(
            "/api/portfolio/cash-balance",
            new UpdatePortfolioCashBalanceRequest(250m)
        );
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var response = await _client.GetAsync("/api/portfolio/dashboard");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dashboard = await response.Content.ReadFromJsonAsync<PortfolioDashboardResponse>(
            _jsonOptions
        );
        Assert.NotNull(dashboard);
        Assert.Empty(dashboard!.Positions);
        Assert.Equal(250m, dashboard.Summary.CashBalance);
        Assert.Equal(250m, dashboard.Summary.TotalPortfolioValue);
    }
}
