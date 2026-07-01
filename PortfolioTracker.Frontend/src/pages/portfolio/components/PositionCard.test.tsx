import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { marketPriceService } from "@/services/marketPriceService";
import type { MarketPriceQuote } from "@/types/marketPrice";
import type { PortfolioPosition } from "@/types/portfolio";
import { renderWithProviders } from "@/test/render";
import { PositionCard } from "./PositionCard";

vi.mock("@/services/marketPriceService", () => ({
  marketPriceService: {
    saveManualPrice: vi.fn(),
    clearManualPrice: vi.fn(),
  },
}));

const position: PortfolioPosition = {
  assetId: 1,
  symbol: "GARAN",
  market: "BIST",
  netQuantity: 3,
  averageCost: 10,
  totalInvested: 30,
  realizedPnL: 0,
  activePositionCost: 30,
  currentPrice: null,
  marketValue: 0,
  unrealizedPnL: 0,
  totalPnL: 0,
  pnlPercent: null,
  isClosed: false,
  marketPrice: null,
};

const manualQuote: MarketPriceQuote = {
  symbol: "GARAN",
  currentPrice: 12.34,
  isAvailable: true,
  isManual: true,
  isRefreshing: false,
};

const positionWithManualPrice: PortfolioPosition = {
  ...position,
  currentPrice: 12.34,
  marketValue: 37.02,
  unrealizedPnL: 7.02,
  totalPnL: 7.02,
  pnlPercent: 23.4,
  marketPrice: manualQuote,
};

describe("PositionCard manual price", () => {
  beforeEach(() => {
    vi.mocked(marketPriceService.saveManualPrice).mockResolvedValue(
      manualQuote,
    );
    vi.mocked(marketPriceService.clearManualPrice).mockResolvedValue(
      manualQuote,
    );
  });

  it("shows missing price action and saves a manual price", async () => {
    const user = userEvent.setup();
    const onMarketPriceChanged = vi.fn();

    renderWithProviders(
      <PositionCard
        position={position}
        marketPricesLoading={false}
        displayMetric="unrealizedPnL"
        onMarketPriceChanged={onMarketPriceChanged}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Fiyat Gir" }));
    await user.type(
      await screen.findByLabelText("GARAN sembol fiyatı"),
      "1234",
    );
    await user.click(screen.getByRole("button", { name: "Kaydet" }));

    await waitFor(() =>
      expect(marketPriceService.saveManualPrice).toHaveBeenCalledWith(
        "GARAN",
        1234,
      ),
    );
    expect(onMarketPriceChanged).toHaveBeenCalledTimes(1);
  });

  it("clears an existing manual price", async () => {
    const user = userEvent.setup();
    const onMarketPriceChanged = vi.fn();

    renderWithProviders(
      <PositionCard
        position={positionWithManualPrice}
        marketPricesLoading={false}
        displayMetric="unrealizedPnL"
        onMarketPriceChanged={onMarketPriceChanged}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Fiyatı düzenle" }));
    await user.click(await screen.findByRole("button", { name: "Sil" }));

    await waitFor(() =>
      expect(marketPriceService.clearManualPrice).toHaveBeenCalledWith("GARAN"),
    );
    expect(onMarketPriceChanged).toHaveBeenCalledTimes(1);
  });
});
