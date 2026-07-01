import type { PortfolioPosition } from "../../../types/portfolio";
import type { MarketPriceQuote } from "../../../types/marketPrice";
import { isClosedPosition } from "./helpers";

export type MarketPriceMap = Record<string, MarketPriceQuote | undefined>;

export function normalizeDecimalInput(value: string): string {
  return value.trim().replace(",", ".");
}

export function isDecimalInput(value: string): boolean {
  return /^\d+(?:[.,]\d+)?$/.test(value.trim());
}

export function parseDecimalInput(value: string): number {
  const parsed = Number(normalizeDecimalInput(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getMarketPriceKey(symbol: string): string {
  return symbol.trim().toUpperCase();
}

export function getMarketPriceValue(
  quote: MarketPriceQuote | null | undefined,
): number | null {
  if (
    !quote?.isAvailable ||
    quote.currentPrice === null ||
    quote.currentPrice === undefined
  ) {
    return null;
  }

  return quote.currentPrice;
}

export function calculateTransactionTotal(
  quantity: number,
  unitPrice: number,
): number {
  return quantity * unitPrice;
}

export function getActivePositionCost(position: PortfolioPosition): number {
  if (isClosedPosition(position.netQuantity)) {
    return 0;
  }

  return position.netQuantity * position.averageCost;
}

export function getProjectedSaleAmount(
  position: PortfolioPosition,
  currentPrice: number | null,
): number {
  if (currentPrice === null || isClosedPosition(position.netQuantity)) {
    return 0;
  }

  return position.netQuantity * currentPrice;
}

export function getUnrealizedPnL(
  position: PortfolioPosition,
  currentPrice: number | null,
): number {
  if (currentPrice === null || isClosedPosition(position.netQuantity)) {
    return 0;
  }

  return (
    getProjectedSaleAmount(position, currentPrice) -
    getActivePositionCost(position)
  );
}

export function getTotalPnL(
  position: PortfolioPosition,
  currentPrice: number | null,
): number {
  if (currentPrice === null || isClosedPosition(position.netQuantity)) {
    return position.realizedPnL;
  }

  return position.realizedPnL + getUnrealizedPnL(position, currentPrice);
}

export function getCurrentMarketValue(
  position: PortfolioPosition,
  currentPrice: number | null,
): number {
  return getProjectedSaleAmount(position, currentPrice);
}

export function getPortfolioSummary(
  positions: PortfolioPosition[] | null | undefined,
  marketPrices: MarketPriceMap,
) {
  const rows = positions ?? [];
  let totalActivePositionCost = 0;
  let totalMarketValue = 0;
  let totalRealizedPnL = 0;
  let totalUnrealizedPnL = 0;
  let totalPnL = 0;

  for (const position of rows) {
    const currentPrice = getMarketPriceValue(
      marketPrices[getMarketPriceKey(position.symbol)],
    );

    totalActivePositionCost += getActivePositionCost(position);
    totalRealizedPnL += position.realizedPnL;
    totalMarketValue += getCurrentMarketValue(position, currentPrice);
    totalUnrealizedPnL += getUnrealizedPnL(position, currentPrice);
    totalPnL += getTotalPnL(position, currentPrice);
  }

  return {
    totalActivePositionCost,
    totalMarketValue,
    totalRealizedPnL,
    totalUnrealizedPnL,
    totalPnL,
  };
}
