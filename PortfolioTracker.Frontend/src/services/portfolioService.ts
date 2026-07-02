import { api } from "@/api/httpClient";
import type {
  PortfolioCashBalance,
  PortfolioDashboard,
  PortfolioPositionBase,
} from "@/types/portfolio";

export const portfolioService = {
  getDashboard: () => api.get<PortfolioDashboard>("/api/portfolio/dashboard"),
  getPositions: () =>
    api.get<PortfolioPositionBase[]>("/api/portfolio/positions"),
  getCashBalance: () =>
    api.get<PortfolioCashBalance>("/api/portfolio/cash-balance"),
  updateCashBalance: (cashBalance: number) =>
    api.put<PortfolioCashBalance>("/api/portfolio/cash-balance", {
      cashBalance,
    }),
};
