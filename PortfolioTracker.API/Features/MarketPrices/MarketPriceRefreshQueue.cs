using System.Collections.Concurrent;
using System.Threading.Channels;

namespace PortfolioTracker.API.Features.MarketPrices;

public class MarketPriceRefreshQueue : IMarketPriceRefreshQueue
{
    private readonly Channel<string> _queue = Channel.CreateUnbounded<string>(
        new UnboundedChannelOptions { SingleReader = true, SingleWriter = false }
    );
    private readonly ConcurrentDictionary<string, byte> _pending = new(
        StringComparer.OrdinalIgnoreCase
    );
    private readonly ConcurrentDictionary<string, byte> _processing = new(
        StringComparer.OrdinalIgnoreCase
    );

    public async ValueTask EnqueueAsync(
        string symbol,
        CancellationToken cancellationToken = default
    )
    {
        var normalizedSymbol = MarketPriceSymbols.Normalize(symbol);
        if (string.IsNullOrWhiteSpace(normalizedSymbol))
            return;

        if (_pending.ContainsKey(normalizedSymbol) || _processing.ContainsKey(normalizedSymbol))
            return;

        if (!_pending.TryAdd(normalizedSymbol, 0))
            return;

        await _queue.Writer.WriteAsync(normalizedSymbol, cancellationToken);
    }

    public async ValueTask<string> DequeueAsync(CancellationToken cancellationToken)
    {
        var symbol = await _queue.Reader.ReadAsync(cancellationToken);
        _pending.TryRemove(symbol, out _);
        _processing.TryAdd(symbol, 0);
        return symbol;
    }

    public void Complete(string symbol)
    {
        var normalizedSymbol = MarketPriceSymbols.Normalize(symbol);
        if (string.IsNullOrWhiteSpace(normalizedSymbol))
            return;

        _processing.TryRemove(normalizedSymbol, out _);
    }

    public bool IsQueuedOrProcessing(string symbol)
    {
        var normalizedSymbol = MarketPriceSymbols.Normalize(symbol);
        if (string.IsNullOrWhiteSpace(normalizedSymbol))
            return false;

        return _pending.ContainsKey(normalizedSymbol)
            || _processing.ContainsKey(normalizedSymbol);
    }
}

