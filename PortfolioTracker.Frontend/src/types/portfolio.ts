import type { MarketPriceQuote } from "./marketPrice";

export interface PortfolioPositionBase {
  assetId: number;
  symbol: string;
  market?: string | null;
  netQuantity: number;
  averageCost: number;
  totalInvested: number;
  realizedPnL: number;
}

export interface PortfolioPosition extends PortfolioPositionBase {
  activePositionCost: number;
  currentPrice?: number | null;
  marketValue: number;
  unrealizedPnL: number;
  totalPnL: number;
  pnlPercent?: number | null;
  isClosed: boolean;
  marketPrice?: MarketPriceQuote | null;
}

export interface PortfolioCashBalance {
  cashBalance: number;
  updatedAt: string;
}

export interface PortfolioDashboardSummary {
  cashBalance: number;
  cashBalanceUpdatedAt: string;
  totalActivePositionCost: number;
  totalMarketValue: number;
  totalRealizedPnL: number;
  totalUnrealizedPnL: number;
  totalPnL: number;
  totalPortfolioValue: number;
}

export interface PortfolioDashboard {
  positions: PortfolioPosition[];
  summary: PortfolioDashboardSummary;
}
