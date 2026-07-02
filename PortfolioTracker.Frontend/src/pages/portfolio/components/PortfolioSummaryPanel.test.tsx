import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { PortfolioDashboardSummary } from "@/types/portfolio";
import { renderWithProviders } from "@/test/render";
import { PortfolioSummaryPanel } from "./PortfolioSummaryPanel";

const summary: PortfolioDashboardSummary = {
  cashBalance: 100,
  cashBalanceUpdatedAt: "2026-06-30T08:00:00Z",
  totalActivePositionCost: 20,
  totalMarketValue: 30,
  totalRealizedPnL: 5,
  totalUnrealizedPnL: 10,
  totalPnL: 15,
  totalPortfolioValue: 130,
};

describe("PortfolioSummaryPanel", () => {
  it("renders total portfolio value and cash balance", () => {
    renderWithProviders(
      <PortfolioSummaryPanel
        summary={summary}
        cashBalanceLoading={false}
        cashBalanceError={null}
        onCashBalanceSave={vi.fn()}
      />,
    );

    expect(screen.getByText("₺130,00")).toBeInTheDocument();
    expect(screen.getByText("₺100,00")).toBeInTheDocument();
  });

  it("opens cash balance modal and saves a new balance", async () => {
    const user = userEvent.setup();
    const onCashBalanceSave = vi.fn().mockResolvedValue(2500);

    renderWithProviders(
      <PortfolioSummaryPanel
        summary={summary}
        cashBalanceLoading={false}
        cashBalanceError={null}
        onCashBalanceSave={onCashBalanceSave}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Bakiyeyi düzenle" }));

    const input = await screen.findByLabelText(
      "Hisseye bağlı olmayan nakit bakiye",
    );
    await user.clear(input);
    await user.type(input, "2500");
    await user.click(screen.getByRole("button", { name: "Kaydet" }));

    await waitFor(() => expect(onCashBalanceSave).toHaveBeenCalledWith(2500));
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Bakiye" }),
      ).not.toBeInTheDocument(),
    );
  });
});
