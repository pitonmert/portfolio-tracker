using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PortfolioTracker.API.Features.Assets;
using PortfolioTracker.API.Features.MarketPrices;
using PortfolioTracker.API.Features.Portfolio;
using PortfolioTracker.API.Features.Transactions;
using PortfolioTracker.API.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Avoid infinite loops when serializing circular object graphs.
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        // Serialize enums as strings (e.g. "Buy" / "Sell") for a more readable API surface.
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' is missing or empty."
            ),
        npgsqlOptions => npgsqlOptions.EnableRetryOnFailure()
    )
);

builder.Services.Configure<MarketDataServiceOptions>(
    builder.Configuration.GetSection("MarketData")
);
builder.Services.AddHttpClient<IMarketPriceProvider, MarketDataServicePriceProvider>(
    (serviceProvider, client) =>
    {
        var options = serviceProvider
            .GetRequiredService<IOptions<MarketDataServiceOptions>>()
            .Value;
        client.BaseAddress = new Uri(options.BaseUrl.TrimEnd('/') + "/");
        client.Timeout = TimeSpan.FromSeconds(Math.Max(1, options.RequestTimeoutSeconds));
    }
);
builder.Services.AddHttpClient<IAssetCatalogProvider, MarketDataServiceAssetCatalogProvider>(
    (serviceProvider, client) =>
    {
        var options = serviceProvider
            .GetRequiredService<IOptions<MarketDataServiceOptions>>()
            .Value;
        client.BaseAddress = new Uri(options.BaseUrl.TrimEnd('/') + "/");
        client.Timeout = TimeSpan.FromSeconds(Math.Max(1, options.RequestTimeoutSeconds));
    }
);
builder.Services.AddSingleton<IMarketPriceRefreshQueue, MarketPriceRefreshQueue>();
builder.Services.AddSingleton<
    IPortfolioPositionRecalculationQueue,
    PortfolioPositionRecalculationQueue
>();

// Register service via interface so dependents are decoupled from the implementation.
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IPortfolioService, PortfolioService>();
builder.Services.AddScoped<
    IPortfolioPositionRecalculationService,
    PortfolioPositionRecalculationService
>();
builder.Services.AddScoped<IMarketPriceService, MarketPriceService>();
builder.Services.AddScoped<IAssetSyncService, AssetSyncService>();
builder.Services.AddScoped<IAssetSearchService, AssetSearchService>();
builder.Services.AddHostedService<AssetCatalogStartupSyncService>();
builder.Services.AddHostedService<PortfolioPositionStartupSyncService>();
builder.Services.AddHostedService<MarketPriceRefreshWorker>();
builder.Services.AddHostedService<QueuedMarketPriceRefreshWorker>();
builder.Services.AddHostedService<PortfolioPositionRecalculationWorker>();

var app = builder.Build();

if (app.Configuration.GetValue("Database:AutoMigrate", false))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
}

if (app.Configuration.GetValue("Https:Redirect", true))
{
    app.UseHttpsRedirection();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

// Convenience redirect so navigating to the root opens Swagger UI.
app.MapGet("/", () => Results.Redirect("/swagger/index.html"));

app.Run();
