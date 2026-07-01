using PortfolioTracker.API.Data;
using PortfolioTracker.API.Features.MarketPrices;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Testcontainers.PostgreSql;

namespace PortfolioTracker.API.IntegrationTests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _dbContainer = new PostgreSqlBuilder(
        "postgres:16-alpine"
    ).Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
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
}
