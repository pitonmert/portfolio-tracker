import { api } from "@/api/httpClient";
import type { MarketPriceQuote } from "@/types/marketPrice";

function toQueryString(symbols: string[]) {
  const query = new URLSearchParams();
  const normalizedSymbols = symbols
    .map((symbol) => symbol.trim())
    .filter(Boolean);

  if (normalizedSymbols.length > 0) {
    query.set("symbols", normalizedSymbols.join(","));
  }

  const value = query.toString();
  return value ? `?${value}` : "";
}

export const marketPriceService = {
  getQuotes: (symbols: string[]) =>
    symbols.length === 0
      ? Promise.resolve([] as MarketPriceQuote[])
      : api.get<MarketPriceQuote[]>(
          `/api/market-prices${toQueryString(symbols)}`,
        ),
  saveManualPrice: (symbol: string, currentPrice: number) =>
    api.put<MarketPriceQuote>(
      `/api/market-prices/${encodeURIComponent(symbol)}/manual`,
      { currentPrice },
    ),
  clearManualPrice: (symbol: string) =>
    api.delete<MarketPriceQuote>(
      `/api/market-prices/${encodeURIComponent(symbol)}/manual`,
    ),
};
