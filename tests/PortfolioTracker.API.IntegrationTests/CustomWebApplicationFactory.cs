using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using PortfolioTracker.API.Features.Assets;
using PortfolioTracker.API.Features.MarketPrices;
using PortfolioTracker.API.Infrastructure.Persistence;
using Testcontainers.PostgreSql;

namespace PortfolioTracker.API.IntegrationTests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _dbContainer = new PostgreSqlBuilder(
        "postgres:16-alpine"
    ).Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("Assets:StartupSync", "false");
        builder.UseSetting("PortfolioPositions:StartupSync", "false");

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(d =>
                d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>)
            );
            if (descriptor != null)
                services.Remove(descriptor);

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(_dbContainer.GetConnectionString())
            );

            services.RemoveAll<IMarketPriceProvider>();
            services.AddSingleton<IMarketPriceProvider, FakeMarketPriceProvider>();
            services.RemoveAll<IAssetCatalogProvider>();
            services.AddSingleton<IAssetCatalogProvider, FakeAssetCatalogProvider>();
        });
    }

    public async Task InitializeAsync()
    {
        await _dbContainer.StartAsync();

        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.MigrateAsync();
    }

    public new async Task DisposeAsync()
    {
        await _dbContainer.DisposeAsync();
    }

    private sealed class FakeMarketPriceProvider : IMarketPriceProvider
    {
        public Task<MarketPriceQuote> GetQuoteAsync(
            string symbol,
            CancellationToken cancellationToken
        )
        {
            var normalizedSymbol = MarketPriceSymbols.Normalize(symbol);

            if (normalizedSymbol.StartsWith("MISS", StringComparison.OrdinalIgnoreCase))
                return Task.FromResult(
                    MarketPriceQuote.Unavailable(normalizedSymbol, "Fake provider unavailable")
                );

            return Task.FromResult(
                new MarketPriceQuote
                {
                    Symbol = normalizedSymbol,
                    CompanyName = $"{normalizedSymbol} Test",
                    CurrentPrice = 123.45m,
                    FetchedAt = DateTime.UtcNow,
                    IsAvailable = true,
                    IsManual = false,
                }
            );
        }
    }

    private sealed class FakeAssetCatalogProvider : IAssetCatalogProvider
    {
        public Task<IReadOnlyList<AssetCatalogItem>> GetStockAssetsAsync(
            CancellationToken cancellationToken = default
        ) =>
            Task.FromResult<IReadOnlyList<AssetCatalogItem>>([
                new AssetCatalogItem(
                    "THYAO",
                    "Türk Hava Yolları",
                    "stock",
                    "BIST",
                    "TRY",
                    "THYAO",
                    "test",
                    null,
                    "screen_stocks"
                ),
            ]);

        public Task<IReadOnlyList<AssetCatalogItem>> GetFundAssetsAsync(
            string fundType,
            CancellationToken cancellationToken = default
        )
        {
            IReadOnlyList<AssetCatalogItem> result =
                fundType == "YAT"
                    ?
                    [
                        new AssetCatalogItem(
                            "KPA",
                            "Kuveyt Türk Portföy Katılım Hisse Senedi Fonu",
                            "fund",
                            "TEFAS",
                            "TRY",
                            "KPA",
                            "test",
                            "YAT",
                            "Hisse Senedi Şemsiye Fonu"
                        ),
                    ]
                    : [];

            return Task.FromResult(result);
        }
    }
}
