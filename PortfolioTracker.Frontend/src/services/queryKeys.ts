import type { TransactionQuery } from "@/types/transaction";

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function normalizeSymbols(symbols: string[]) {
  return symbols.map(normalizeSymbol).filter(Boolean).sort();
}

export const queryKeys = {
  portfolio: {
    all: ["portfolio"] as const,
    dashboard: () => [...queryKeys.portfolio.all, "dashboard"] as const,
    positions: () => [...queryKeys.portfolio.all, "positions"] as const,
    cashBalance: () => [...queryKeys.portfolio.all, "cashBalance"] as const,
  },
  marketPrices: {
    all: ["marketPrices"] as const,
    quotes: (symbols: string[]) =>
      [
        ...queryKeys.marketPrices.all,
        "quotes",
        normalizeSymbols(symbols),
      ] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    history: (params: TransactionQuery = {}) =>
      [
        ...queryKeys.transactions.all,
        "history",
        params.type ?? null,
        params.search?.trim() ?? "",
      ] as const,
    bySymbol: (symbol: string) =>
      [
        ...queryKeys.transactions.all,
        "bySymbol",
        normalizeSymbol(symbol),
      ] as const,
  },
  assets: {
    all: ["assets"] as const,
    search: (
      q: string,
      assetType: "auto" | "stock" | "fund" = "auto",
      limit = 8,
    ) =>
      [...queryKeys.assets.all, "search", q.trim(), assetType, limit] as const,
  },
};
