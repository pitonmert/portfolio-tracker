using System.Text.Json.Serialization;
using PortfolioTracker.API.Data;
using PortfolioTracker.API.Features.MarketPrices;
using PortfolioTracker.API.Features.Portfolio;
using PortfolioTracker.API.Features.Transactions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

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
        var options = serviceProvider.GetRequiredService<IOptions<MarketDataServiceOptions>>()
            .Value;
        client.BaseAddress = new Uri(options.BaseUrl.TrimEnd('/') + "/");
        client.Timeout = TimeSpan.FromSeconds(Math.Max(1, options.RequestTimeoutSeconds));
    }
);
builder.Services.AddSingleton<IMarketPriceRefreshQueue, MarketPriceRefreshQueue>();

// Register service via interface so dependents are decoupled from the implementation.
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IPortfolioService, PortfolioService>();
builder.Services.AddScoped<IMarketPriceService, MarketPriceService>();
builder.Services.AddHostedService<MarketPriceRefreshWorker>();
builder.Services.AddHostedService<QueuedMarketPriceRefreshWorker>();

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

// Convenience redirect so navigating to the root opens Swagger UI.
app.MapGet("/", () => Results.Redirect("/swagger/index.html"));

app.Run();
