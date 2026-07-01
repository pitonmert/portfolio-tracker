using PortfolioTracker.API.Data;
using PortfolioTracker.API.Entities;
using PortfolioTracker.API.Features.Portfolio;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace PortfolioTracker.API.Features.MarketPrices;

public class MarketPriceService(
    ApplicationDbContext context,
    IMarketPriceProvider provider,
    IMarketPriceRefreshQueue refreshQueue
) : IMarketPriceService
{
    public async Task<MarketPriceQuote> GetQuoteAsync(
        string symbol,
        CancellationToken cancellationToken
    )
    {
        var normalizedSymbol = MarketPriceSymbols.Normalize(symbol);
        if (string.IsNullOrWhiteSpace(normalizedSymbol))
            return MarketPriceQuote.Unavailable(normalizedSymbol);

        var price = await context
            .MarketPrices.AsNoTracking()
            .FirstOrDefaultAsync(price => price.Symbol == normalizedSymbol, cancellationToken);

        var isRefreshing = refreshQueue.IsQueuedOrProcessing(normalizedSymbol);

        return price is null
            ? MarketPriceQuote.Unavailable(normalizedSymbol, isRefreshing: isRefreshing)
            : ToQuote(price, isRefreshing);
    }

    public async Task<IReadOnlyList<MarketPriceQuote>> GetQuotesAsync(
        IEnumerable<string> symbols,
        CancellationToken cancellationToken
    )
    {
        var normalizedSymbols = symbols
            .Select(MarketPriceSymbols.Normalize)
            .Where(symbol => !string.IsNullOrWhiteSpace(symbol))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (normalizedSymbols.Count == 0)
            return [];

        var prices = await context
            .MarketPrices.AsNoTracking()
            .Where(price => normalizedSymbols.Contains(price.Symbol))
            .ToDictionaryAsync(price => price.Symbol, cancellationToken);

        return normalizedSymbols
            .Select(symbol =>
                prices.TryGetValue(symbol, out var price)
                    ? ToQuote(price, refreshQueue.IsQueuedOrProcessing(symbol))
                    : MarketPriceQuote.Unavailable(
                        symbol,
                        isRefreshing: refreshQueue.IsQueuedOrProcessing(symbol)
                    )
            )
            .ToList();
    }

    public async Task<MarketPriceQuote> SaveManualPriceAsync(
        string symbol,
        decimal currentPrice,
        CancellationToken cancellationToken
    )
    {
        var normalizedSymbol = MarketPriceSymbols.Normalize(symbol);
        if (string.IsNullOrWhiteSpace(normalizedSymbol))
            throw new ArgumentException("Sembol boş olamaz.", nameof(symbol));

        if (currentPrice <= 0)
            throw new ArgumentOutOfRangeException(
                nameof(currentPrice),
                "Güncel fiyat 0’dan büyük olmalı."
            );

        var now = DateTime.UtcNow;
        var entity = await SaveMarketPriceAsync(
            normalizedSymbol,
            entity =>
            {
                entity.CompanyName = null;
                entity.CurrentPrice = currentPrice;
                entity.DayHigh = null;
                entity.DayLow = null;
                entity.MarketCap = null;
                entity.FetchedAt = now;
                entity.IsAvailable = true;
                entity.IsManual = true;
                entity.ManualUpdatedAt = now;
                entity.Error = null;
                return true;
            },
            cancellationToken
        );

        return ToQuote(entity);
    }

    public async Task<MarketPriceQuote> ClearManualPriceAsync(
        string symbol,
        CancellationToken cancellationToken
    )
    {
        var normalizedSymbol = MarketPriceSymbols.Normalize(symbol);
        if (string.IsNullOrWhiteSpace(normalizedSymbol))
            throw new ArgumentException("Sembol boş olamaz.", nameof(symbol));

        var entity = await SaveMarketPriceAsync(
            normalizedSymbol,
            entity =>
            {
                entity.CompanyName = null;
                entity.CurrentPrice = null;
                entity.DayHigh = null;
                entity.DayLow = null;
                entity.MarketCap = null;
                entity.FetchedAt = null;
                entity.IsAvailable = false;
                entity.IsManual = false;
                entity.ManualUpdatedAt = null;
                entity.Error = "Fiyat alınamadı";
                return true;
            },
            cancellationToken
        );

        await refreshQueue.EnqueueAsync(normalizedSymbol, cancellationToken);

        return ToQuote(entity, isRefreshing: true);
    }

    public async Task RefreshActiveSymbolsAsync(CancellationToken cancellationToken)
    {
        var symbols = await GetActiveSymbolsAsync(cancellationToken);

        foreach (var symbol in symbols)
        {
            await RefreshSymbolAsync(symbol, cancellationToken);
        }
    }

    public async Task<MarketPriceQuote> RefreshSymbolAsync(
        string symbol,
        CancellationToken cancellationToken
    )
    {
        var normalizedSymbol = MarketPriceSymbols.Normalize(symbol);
        if (string.IsNullOrWhiteSpace(normalizedSymbol))
            return MarketPriceQuote.Unavailable(normalizedSymbol);

        var existing = await context.MarketPrices.FindAsync([normalizedSymbol], cancellationToken);
        if (existing?.IsManual == true)
            return ToQuote(existing);

        var isOpen = await IsOpenPositionAsync(normalizedSymbol, cancellationToken);
        if (!isOpen)
        {
            var closedEntity = await SaveMarketPriceAsync(
                normalizedSymbol,
                entity =>
                {
                    if (entity.IsManual)
                        return false;

                    entity.CurrentPrice = null;
                    entity.DayHigh = null;
                    entity.DayLow = null;
                    entity.MarketCap = null;
                    entity.FetchedAt = null;
                    entity.IsAvailable = false;
                    entity.IsManual = false;
                    entity.ManualUpdatedAt = null;
                    entity.Error = "Pozisyon kapalı";
                    return true;
                },
                cancellationToken
            );

            return ToQuote(closedEntity);
        }

        var providerQuote = await provider.GetQuoteAsync(normalizedSymbol, cancellationToken);
        var refreshedEntity = await SaveMarketPriceAsync(
            normalizedSymbol,
            entity =>
            {
                if (entity.IsManual)
                    return false;

                if (!providerQuote.IsAvailable || providerQuote.CurrentPrice is null)
                {
                    entity.Error = providerQuote.Error ?? "Fiyat alınamadı";

                    if (entity.CurrentPrice is null || entity.CurrentPrice <= 0)
                    {
                        entity.CurrentPrice = null;
                        entity.DayHigh = null;
                        entity.DayLow = null;
                        entity.MarketCap = null;
                        entity.FetchedAt = null;
                        entity.IsAvailable = false;
                    }

                    return true;
                }

                entity.ProviderSymbol = providerQuote.Symbol;
                entity.CompanyName = providerQuote.CompanyName;
                entity.CurrentPrice = providerQuote.CurrentPrice;
                entity.DayHigh = providerQuote.DayHigh;
                entity.DayLow = providerQuote.DayLow;
                entity.MarketCap = providerQuote.MarketCap;
                entity.FetchedAt = providerQuote.FetchedAt ?? DateTime.UtcNow;
                entity.IsAvailable = true;
                entity.IsManual = false;
                entity.ManualUpdatedAt = null;
                entity.Error = null;
                return true;
            },
            cancellationToken
        );

        return ToQuote(refreshedEntity);
    }

    private async Task<MarketPrice> SaveMarketPriceAsync(
        string symbol,
        Func<MarketPrice, bool> applyChanges,
        CancellationToken cancellationToken
    )
    {
        var normalizedSymbol = MarketPriceSymbols.Normalize(symbol);

        for (var attempt = 0; attempt < 2; attempt++)
        {
            var entity = await context.MarketPrices.FindAsync(
                [normalizedSymbol],
                cancellationToken
            );
            if (entity is null)
            {
                entity = new MarketPrice { Symbol = normalizedSymbol };
                context.MarketPrices.Add(entity);
            }

            if (!applyChanges(entity))
                return entity;

            try
            {
                await context.SaveChangesAsync(cancellationToken);
                return entity;
            }
            catch (DbUpdateException ex) when (IsUniqueViolation(ex) && attempt == 0)
            {
                context.ChangeTracker.Clear();
            }
        }

        throw new InvalidOperationException(
            $"Market price for {normalizedSymbol} could not be saved."
        );
    }

    private async Task<IReadOnlyList<string>> GetActiveSymbolsAsync(
        CancellationToken cancellationToken
    )
    {
        var transactions = await context
            .Transactions.AsNoTracking()
            .OrderBy(transaction => transaction.Date)
            .ThenBy(transaction => transaction.Id)
            .ToListAsync(cancellationToken);

        return transactions
            .GroupBy(transaction => MarketPriceSymbols.Normalize(transaction.Symbol))
            .Select(PortfolioCalculations.CalculatePosition)
            .Where(position => !PortfolioCalculations.IsClosedPosition(position.NetQuantity))
            .Select(position => MarketPriceSymbols.Normalize(position.Symbol))
            .Where(symbol => !string.IsNullOrWhiteSpace(symbol))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private async Task<bool> IsOpenPositionAsync(
        string symbol,
        CancellationToken cancellationToken
    )
    {
        var normalizedSymbol = MarketPriceSymbols.Normalize(symbol);
        var transactions = await context
            .Transactions.AsNoTracking()
            .Where(transaction => transaction.Symbol.ToUpper() == normalizedSymbol)
            .OrderBy(transaction => transaction.Date)
            .ThenBy(transaction => transaction.Id)
            .ToListAsync(cancellationToken);

        if (transactions.Count == 0)
            return false;

        var position = PortfolioCalculations.CalculatePosition(
            transactions.GroupBy(transaction => MarketPriceSymbols.Normalize(transaction.Symbol)).Single()
        );

        return !PortfolioCalculations.IsClosedPosition(position.NetQuantity);
    }

    private static MarketPriceQuote ToQuote(MarketPrice price, bool isRefreshing = false)
    {
        if (!price.IsAvailable || price.CurrentPrice is null || price.CurrentPrice <= 0)
            return MarketPriceQuote.Unavailable(price.Symbol, price.Error, isRefreshing);

        return new MarketPriceQuote
        {
            Symbol = price.Symbol,
            CompanyName = price.CompanyName,
            CurrentPrice = price.CurrentPrice,
            DayHigh = price.DayHigh,
            DayLow = price.DayLow,
            MarketCap = price.MarketCap,
            FetchedAt = price.FetchedAt,
            DelayMinutes = CalculateDelayMinutes(price.FetchedAt),
            IsAvailable = true,
            IsManual = price.IsManual,
            IsRefreshing = isRefreshing,
            ManualUpdatedAt = price.ManualUpdatedAt,
            Error = price.Error,
        };
    }

    private static int? CalculateDelayMinutes(DateTime? fetchedAt) =>
        fetchedAt is null
            ? null
            : Math.Max(0, (int)Math.Floor((DateTime.UtcNow - fetchedAt.Value).TotalMinutes));

    private static bool IsUniqueViolation(DbUpdateException exception) =>
        exception.InnerException is PostgresException postgresException
        && postgresException.SqlState == PostgresErrorCodes.UniqueViolation;
}
