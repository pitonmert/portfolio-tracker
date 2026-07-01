import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { PortfolioPosition } from "@/types/portfolio";
import { useFilteredPositions } from "./useFilteredPositions";

const positions: PortfolioPosition[] = [
  {
    assetId: 1,
    symbol: "GARAN",
    market: "BIST",
    netQuantity: 10,
    averageCost: 5,
    totalInvested: 50,
    realizedPnL: 20,
    activePositionCost: 50,
    currentPrice: 8,
    marketValue: 80,
    unrealizedPnL: 30,
    totalPnL: 50,
    pnlPercent: 100,
    isClosed: false,
  },
  {
    assetId: 2,
    symbol: "AKBNK",
    market: "BIST",
    netQuantity: 0,
    averageCost: 8,
    totalInvested: 80,
    realizedPnL: -5,
    activePositionCost: 0,
    currentPrice: null,
    marketValue: 0,
    unrealizedPnL: 0,
    totalPnL: -5,
    pnlPercent: null,
    isClosed: true,
  },
  {
    assetId: 3,
    symbol: "EREGL",
    market: "BIST",
    netQuantity: 4,
    averageCost: 11,
    totalInvested: 44,
    realizedPnL: 10,
    activePositionCost: 44,
    currentPrice: 12,
    marketValue: 48,
    unrealizedPnL: 4,
    totalPnL: 14,
    pnlPercent: 31.818181818181817,
    isClosed: false,
  },
  {
    assetId: 4,
    symbol: "ASELS",
    market: "BIST",
    netQuantity: 2,
    averageCost: 20,
    totalInvested: 40,
    realizedPnL: 10,
    activePositionCost: 40,
    currentPrice: 25,
    marketValue: 50,
    unrealizedPnL: 10,
    totalPnL: 20,
    pnlPercent: 50,
    isClosed: false,
  },
];

function renderFiltered(
  filter: "all" | "open" | "closed",
  search = "",
  sort:
    | "symbol_asc"
    | "symbol_desc"
    | "invested_desc"
    | "invested_asc"
    | "pnl_desc"
    | "pnl_asc"
    | "quantity_desc"
    | "quantity_asc"
    | "open_first"
    | "closed_first" = "symbol_asc",
) {
  return renderHook(() => useFilteredPositions(positions, filter, search, sort))
    .result.current;
}

describe("useFilteredPositions", () => {
  it("filters open, closed, and all positions with searched counts", () => {
    expect(
      renderFiltered("open").filteredRows.map((row) => row.symbol),
    ).toEqual(["ASELS", "EREGL", "GARAN"]);
    expect(
      renderFiltered("closed").filteredRows.map((row) => row.symbol),
    ).toEqual(["AKBNK"]);

    const all = renderFiltered("all");
    expect(all.filteredRows.map((row) => row.symbol)).toEqual([
      "AKBNK",
      "ASELS",
      "EREGL",
      "GARAN",
    ]);
    expect(all.filterCounts).toEqual({ all: 4, open: 3, closed: 1 });
  });

  it("searches by symbol before calculating filter counts", () => {
    const result = renderFiltered("all", "gar");

    expect(result.filteredRows.map((row) => row.symbol)).toEqual(["GARAN"]);
    expect(result.filterCounts).toEqual({ all: 1, open: 1, closed: 0 });
    expect(result.count).toBe(1);
  });

  it("sorts by metric and uses symbol as a stable tie breaker", () => {
    const result = renderFiltered("open", "", "pnl_desc");

    expect(result.filteredRows.map((row) => row.symbol)).toEqual([
      "GARAN",
      "ASELS",
      "EREGL",
    ]);
  });
});
