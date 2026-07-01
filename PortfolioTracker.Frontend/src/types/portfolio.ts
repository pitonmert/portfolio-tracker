export interface PortfolioPosition {
  symbol: string;
  netQuantity: number;
  averageCost: number;
  totalInvested: number;
  realizedPnL: number;
}

export interface PortfolioCashBalance {
  cashBalance: number;
  updatedAt: string;
}
