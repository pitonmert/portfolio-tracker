using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using PortfolioTracker.API.Domain.Entities;
using PortfolioTracker.API.Features.Assets;
using PortfolioTracker.API.Features.Transactions;
using PortfolioTracker.API.Infrastructure.Persistence;

namespace PortfolioTracker.API.IntegrationTests;

public class AssetsControllerTests(CustomWebApplicationFactory factory)
    : IClassFixture<CustomWebApplicationFactory>
{
    [Fact]
    public async Task Sync_UpsertsCatalogAssets()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsync("/api/assets/sync", null);

        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<AssetSyncResult>();

        Assert.NotNull(result);
        Assert.Equal(2, result.Received);
        Assert.Equal(2, result.Upserted);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        Assert.Contains(db.Assets, asset => asset.Symbol == "THYAO" && asset.AssetType == "stock");
        Assert.Contains(db.Assets, asset => asset.Symbol == "KPA" && asset.AssetType == "fund");
    }

    [Fact]
    public async Task Sync_WhenRunTwice_DoesNotCreateDuplicates()
    {
        var client = factory.CreateClient();

        await client.PostAsync("/api/assets/sync", null);
        await client.PostAsync("/api/assets/sync", null);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        Assert.Single(
            db.Assets.Where(asset => asset.Symbol == "THYAO" && asset.AssetType == "stock")
        );
        Assert.Single(db.Assets.Where(asset => asset.Symbol == "KPA" && asset.AssetType == "fund"));
    }

    [Fact]
    public async Task Sync_DeactivatesMissingCatalogAssetsButKeepsCustomAssetsActive()
    {
        var client = factory.CreateClient();
        var staleSymbol = $"STALE{Guid.NewGuid():N}"[..12].ToUpperInvariant();
        var customSymbol = $"CUSTOM{Guid.NewGuid():N}"[..12].ToUpperInvariant();

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Assets.AddRange(
                new Asset
                {
                    Symbol = staleSymbol,
                    Name = "Stale Catalog Asset",
                    AssetType = "stock",
                    Market = "BIST",
                    Currency = "TRY",
                    ProviderSymbol = staleSymbol,
                    Source = "test",
                    IsCustom = false,
                    IsActive = true,
                    LastSyncedAt = DateTime.UtcNow.AddDays(-1),
                },
                new Asset
                {
                    Symbol = customSymbol,
                    Name = "Custom Asset",
                    AssetType = "custom",
                    Market = "MANUAL",
                    Currency = "TRY",
                    ProviderSymbol = customSymbol,
                    Source = "manual",
                    IsCustom = true,
                    IsActive = true,
                    LastSyncedAt = DateTime.UtcNow.AddDays(-1),
                }
            );
            await db.SaveChangesAsync();
        }

        var response = await client.PostAsync("/api/assets/sync", null);

        response.EnsureSuccessStatusCode();
        using var assertScope = factory.Services.CreateScope();
        var assertDb = assertScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var staleAsset = Assert.Single(assertDb.Assets, asset => asset.Symbol == staleSymbol);
        var customAsset = Assert.Single(assertDb.Assets, asset => asset.Symbol == customSymbol);
        Assert.False(staleAsset.IsActive);
        Assert.True(customAsset.IsActive);
    }

    [Fact]
    public async Task Search_WithStockQuery_ReturnsStockAsset()
    {
        var client = factory.CreateClient();
        await client.PostAsync("/api/assets/sync", null);

        var results = await client.GetFromJsonAsync<List<AssetSearchResult>>(
            "/api/assets/search?q=THY"
        );

        Assert.NotNull(results);
        var asset = Assert.Single(results, result => result.Symbol == "THYAO");
        Assert.Equal("stock", asset.AssetType);
        Assert.Equal("BIST", asset.Market);
        Assert.False(asset.IsCustom);
    }

    [Fact]
    public async Task Search_WithFundQuery_ReturnsFundAsset()
    {
        var client = factory.CreateClient();
        await client.PostAsync("/api/assets/sync", null);

        var results = await client.GetFromJsonAsync<List<AssetSearchResult>>(
            "/api/assets/search?q=KPA"
        );

        Assert.NotNull(results);
        var asset = Assert.Single(results, result => result.Symbol == "KPA");
        Assert.Equal("fund", asset.AssetType);
        Assert.Equal("TEFAS", asset.Market);
        Assert.Equal("YAT", asset.FundType);
    }

    [Fact]
    public async Task Search_WithUnknownQuery_ReturnsCustomFallback()
    {
        var client = factory.CreateClient();

        var results = await client.GetFromJsonAsync<List<AssetSearchResult>>(
            "/api/assets/search?q=GOLD"
        );

        Assert.NotNull(results);
        var asset = Assert.Single(results);
        Assert.Equal("GOLD", asset.Symbol);
        Assert.Equal("custom", asset.AssetType);
        Assert.True(asset.IsCustom);
    }

    [Fact]
    public async Task TransactionCreate_WithCustomSymbol_StillWorks()
    {
        var client = factory.CreateClient();
        var request = new CreateTransactionRequest(
            null,
            "GOLD",
            1,
            100,
            null,
            TransactionType.Buy,
            DateTime.UtcNow
        );

        var response = await client.PostAsJsonAsync("/api/transactions", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();

        Assert.Contains("\"symbol\":\"GOLD\"", body);
    }
}
