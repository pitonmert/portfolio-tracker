using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using PortfolioTracker.API.Domain.Entities;
using PortfolioTracker.API.Features.MarketPrices;
using PortfolioTracker.API.Features.Transactions;
using PortfolioTracker.API.Infrastructure.Persistence;

namespace PortfolioTracker.API.IntegrationTests;

public class MarketPricesControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    private static readonly System.Text.Json.JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() },
    };

    public MarketPricesControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetMany_WithoutSymbols_ReturnsEmptyList()
    {
        var response = await _client.GetAsync("/api/market-prices");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var quotes = await response.Content.ReadFromJsonAsync<List<MarketPriceQuote>>(_jsonOptions);
        Assert.NotNull(quotes);
        Assert.Empty(quotes!);
    }

    [Fact]
    public async Task GetOne_WithoutKnownPrice_ReturnsUnavailable()
    {
        var symbol = $"UNK{Guid.NewGuid():N}";

        var response = await _client.GetAsync($"/api/market-prices/{symbol}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var quote = await response.Content.ReadFromJsonAsync<MarketPriceQuote>(_jsonOptions);
        Assert.NotNull(quote);
        Assert.Equal(symbol.ToUpperInvariant(), quote!.Symbol);
        Assert.False(quote.IsAvailable);
        Assert.False(quote.IsManual);
        Assert.False(quote.IsRefreshing);
        Assert.Null(quote.CurrentPrice);
    }

    [Fact]
    public async Task SaveManualPrice_WritesManualPriceToDatabase()
    {
        var symbol = $"MAN{Guid.NewGuid():N}";
        var transaction = await CreateTransactionAsync(symbol);

        var response = await _client.PutAsJsonAsync(
            $"/api/market-prices/{symbol}/manual",
            new ManualMarketPriceRequest(321.98m)
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var savedQuote = await response.Content.ReadFromJsonAsync<MarketPriceQuote>(_jsonOptions);
        Assert.NotNull(savedQuote);
        Assert.True(savedQuote!.IsAvailable);
        Assert.True(savedQuote.IsManual);
        Assert.False(savedQuote.IsRefreshing);
        Assert.Equal(321.98m, savedQuote.CurrentPrice);
        Assert.NotNull(savedQuote.ManualUpdatedAt);

        var quote = await GetQuoteAsync(symbol);
        Assert.True(quote.IsAvailable);
        Assert.True(quote.IsManual);
        Assert.Equal(321.98m, quote.CurrentPrice);

        var snapshot = await WaitForSnapshotAsync(
            transaction.AssetId,
            snapshot => snapshot.CurrentPrice == 321.98m
        );
        Assert.Equal(321.98m, snapshot.MarketValue);
        Assert.Equal(221.98m, snapshot.UnrealizedPnL);
    }

    [Fact]
    public async Task SaveManualPrice_UsesCatalogNameWhenAvailable()
    {
        var symbol = $"CAT{Guid.NewGuid():N}".ToUpperInvariant();
        var catalogName = $"{symbol} Catalog Name";
        await CreateTransactionAsync(symbol);
        await CreateAssetAsync(symbol, catalogName);

        var response = await _client.PutAsJsonAsync(
            $"/api/market-prices/{symbol}/manual",
            new ManualMarketPriceRequest(111.22m)
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var quote = await response.Content.ReadFromJsonAsync<MarketPriceQuote>(_jsonOptions);
        Assert.NotNull(quote);
        Assert.Equal(catalogName, quote!.CompanyName);
    }

    [Fact]
    public async Task ClearManualPrice_KeepsCatalogNameWhenAvailable()
    {
        var symbol = $"CCL{Guid.NewGuid():N}".ToUpperInvariant();
        var catalogName = $"{symbol} Catalog Name";
        await CreateTransactionAsync(symbol);
        await CreateAssetAsync(symbol, catalogName);
        await _client.PutAsJsonAsync(
            $"/api/market-prices/{symbol}/manual",
            new ManualMarketPriceRequest(222.33m)
        );

        var response = await _client.DeleteAsync($"/api/market-prices/{symbol}/manual");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var quote = await response.Content.ReadFromJsonAsync<MarketPriceQuote>(_jsonOptions);
        Assert.NotNull(quote);
        Assert.Equal(catalogName, quote!.CompanyName);
        Assert.False(quote.IsAvailable);
    }

    [Fact]
    public async Task SaveManualPrice_WithInvalidPrice_ReturnsBadRequest()
    {
        var symbol = $"BAD{Guid.NewGuid():N}";

        var response = await _client.PutAsJsonAsync(
            $"/api/market-prices/{symbol}/manual",
            new ManualMarketPriceRequest(0m)
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ClearManualPrice_QueuesAutomaticRefresh()
    {
        var symbol = $"CLR{Guid.NewGuid():N}";
        await CreateTransactionAsync(symbol);

        await _client.PutAsJsonAsync(
            $"/api/market-prices/{symbol}/manual",
            new ManualMarketPriceRequest(777.77m)
        );

        var response = await _client.DeleteAsync($"/api/market-prices/{symbol}/manual");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var quote = await response.Content.ReadFromJsonAsync<MarketPriceQuote>(_jsonOptions);
        Assert.NotNull(quote);
        Assert.False(quote!.IsAvailable);
        Assert.False(quote.IsManual);
        Assert.True(quote.IsRefreshing);
        Assert.Null(quote.CurrentPrice);
        Assert.Null(quote.ManualUpdatedAt);

        var refreshedQuote = await WaitForQuoteAsync(
            symbol,
            quote => quote.IsAvailable && !quote.IsManual
        );
        Assert.Equal(123.45m, refreshedQuote.CurrentPrice);
    }

    [Fact]
    public async Task SaveManualPrice_IsNotOverwrittenByAutomaticRefresh()
    {
        var symbol = $"LOCK{Guid.NewGuid():N}";
        await CreateTransactionAsync(symbol);

        await _client.PutAsJsonAsync(
            $"/api/market-prices/{symbol}/manual",
            new ManualMarketPriceRequest(999.99m)
        );

        await using var scope = _factory.Services.CreateAsyncScope();
        var marketPriceService = scope.ServiceProvider.GetRequiredService<IMarketPriceService>();
        await marketPriceService.RefreshSymbolAsync(symbol, CancellationToken.None);

        var quote = await GetQuoteAsync(symbol);
        Assert.True(quote.IsAvailable);
        Assert.True(quote.IsManual);
        Assert.Equal(999.99m, quote.CurrentPrice);
    }

    [Fact]
    public async Task CreateTransaction_QueuesAutomaticPriceRefresh()
    {
        var symbol = $"CRT{Guid.NewGuid():N}";

        var transaction = await CreateTransactionAsync(symbol);

        var quote = await WaitForQuoteAsync(symbol, quote => quote.IsAvailable);
        Assert.False(quote.IsManual);
        Assert.Equal(123.45m, quote.CurrentPrice);

        var snapshot = await WaitForSnapshotAsync(
            transaction.AssetId,
            snapshot => snapshot.CurrentPrice == 123.45m
        );
        Assert.Equal(123.45m, snapshot.MarketValue);
    }

    [Fact]
    public async Task UpdateTransaction_QueuesOldAndNewSymbols()
    {
        var oldSymbol = $"OLD{Guid.NewGuid():N}";
        var newSymbol = $"NEW{Guid.NewGuid():N}";
        var transaction = await CreateTransactionAsync(oldSymbol);
        await WaitForQuoteAsync(oldSymbol, quote => quote.IsAvailable);

        var update = new UpdateTransactionRequest(
            transaction.Id,
            null,
            newSymbol,
            1m,
            100m,
            null,
            TransactionType.Buy,
            DateTime.UtcNow
        );
        var updateResponse = await _client.PutAsJsonAsync(
            $"/api/transactions/{transaction.Id}",
            update
        );
        Assert.Equal(HttpStatusCode.NoContent, updateResponse.StatusCode);

        var newQuote = await WaitForQuoteAsync(newSymbol, quote => quote.IsAvailable);
        Assert.False(newQuote.IsManual);
        Assert.Equal(123.45m, newQuote.CurrentPrice);

        var oldQuote = await WaitForQuoteAsync(oldSymbol, quote => !quote.IsAvailable);
        Assert.False(oldQuote.IsManual);
        Assert.Null(oldQuote.CurrentPrice);
    }

    [Fact]
    public async Task DeleteTransaction_QueuesClosedSymbolRefresh()
    {
        var symbol = $"DEL{Guid.NewGuid():N}";
        var transaction = await CreateTransactionAsync(symbol);
        await WaitForQuoteAsync(symbol, quote => quote.IsAvailable);

        var deleteResponse = await _client.DeleteAsync($"/api/transactions/{transaction.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var quote = await WaitForQuoteAsync(symbol, quote => !quote.IsAvailable);
        Assert.False(quote.IsManual);
        Assert.Null(quote.CurrentPrice);
    }

    private async Task<TransactionResponse> CreateTransactionAsync(string symbol)
    {
        var request = new CreateTransactionRequest(
            null,
            symbol,
            1m,
            100m,
            null,
            TransactionType.Buy,
            DateTime.UtcNow
        );

        var response = await _client.PostAsJsonAsync("/api/transactions", request);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var transaction = await response.Content.ReadFromJsonAsync<TransactionResponse>(
            _jsonOptions
        );
        Assert.NotNull(transaction);
        return transaction!;
    }

    private async Task CreateAssetAsync(string symbol, string name)
    {
        await using var scope = _factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Assets.Add(
            new Asset
            {
                Symbol = symbol,
                Name = name,
                AssetType = "stock",
                Market = "BIST",
                Currency = "TRY",
                ProviderSymbol = symbol,
                Source = "test",
                IsActive = true,
                LastSyncedAt = DateTime.UtcNow,
            }
        );
        await db.SaveChangesAsync();
    }

    private async Task<MarketPriceQuote> GetQuoteAsync(string symbol)
    {
        var response = await _client.GetAsync($"/api/market-prices/{symbol}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var quote = await response.Content.ReadFromJsonAsync<MarketPriceQuote>(_jsonOptions);
        Assert.NotNull(quote);
        return quote!;
    }

    private async Task<MarketPriceQuote> WaitForQuoteAsync(
        string symbol,
        Func<MarketPriceQuote, bool> predicate
    )
    {
        var deadline = DateTime.UtcNow.AddSeconds(5);

        while (DateTime.UtcNow < deadline)
        {
            var quote = await GetQuoteAsync(symbol);
            if (predicate(quote))
                return quote;

            await Task.Delay(100);
        }

        throw new TimeoutException($"Timed out waiting for market price quote: {symbol}");
    }

    private async Task<PortfolioPositionSnapshot> WaitForSnapshotAsync(
        int assetId,
        Func<PortfolioPositionSnapshot, bool> predicate
    )
    {
        var deadline = DateTime.UtcNow.AddSeconds(5);

        while (DateTime.UtcNow < deadline)
        {
            await using var scope = _factory.Services.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var snapshot = await db.PortfolioPositions.FindAsync(assetId);
            if (snapshot is not null && predicate(snapshot))
                return snapshot;

            await Task.Delay(100);
        }

        throw new TimeoutException($"Timed out waiting for portfolio snapshot: {assetId}");
    }
}
