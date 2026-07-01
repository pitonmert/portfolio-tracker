import { api } from "../api/httpClient";
import type {
  PortfolioCashBalance,
  PortfolioPosition,
} from "../types/portfolio";

export const portfolioService = {
  getPositions: () => api.get<PortfolioPosition[]>("/api/portfolio/positions"),
  getCashBalance: () =>
    api.get<PortfolioCashBalance>("/api/portfolio/cash-balance"),
  updateCashBalance: (cashBalance: number) =>
    api.put<PortfolioCashBalance>("/api/portfolio/cash-balance", {
      cashBalance,
    }),
};
