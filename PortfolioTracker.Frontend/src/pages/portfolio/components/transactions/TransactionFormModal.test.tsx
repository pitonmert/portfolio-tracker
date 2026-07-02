import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { assetService } from "@/services/assetService";
import { transactionService } from "@/services/transactionService";
import { renderWithProviders } from "@/test/render";
import type { Transaction } from "@/types/transaction";
import TransactionFormModal from "./TransactionFormModal";

vi.mock("@/services/assetService", () => ({
  assetService: {
    search: vi.fn(),
  },
}));

vi.mock("@/services/transactionService", () => ({
  transactionService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const createdTransaction: Transaction = {
  id: 1,
  assetId: 1,
  symbol: "GARAN",
  quantity: 1.5,
  unitPrice: 10.25,
  totalAmount: 15.375,
  note: null,
  type: "Buy",
  transactionDate: "2026-01-01T12:00:00.000Z",
};

describe("TransactionFormModal", () => {
  beforeEach(() => {
    vi.mocked(assetService.search).mockResolvedValue([]);
    vi.mocked(transactionService.create).mockResolvedValue(createdTransaction);
  });

  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <TransactionFormModal onSaved={vi.fn()} onClose={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: "Kaydet" }));

    expect(await screen.findByText("Varlık adı zorunlu.")).toBeInTheDocument();
    expect(screen.getByText("Adet zorunlu.")).toBeInTheDocument();
    expect(screen.getByText("Birim fiyat zorunlu.")).toBeInTheDocument();
    expect(transactionService.create).not.toHaveBeenCalled();
  });

  it("creates a transaction with valid form values", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    const onClose = vi.fn();

    renderWithProviders(
      <TransactionFormModal onSaved={onSaved} onClose={onClose} />,
    );

    await user.type(screen.getByLabelText("Varlık"), "GARAN");
    await user.type(screen.getByLabelText("Adet"), "1.5");
    await user.type(screen.getByLabelText("Birim fiyat"), "10,25");
    await user.click(screen.getByRole("button", { name: "Kaydet" }));

    await waitFor(() =>
      expect(transactionService.create).toHaveBeenCalledWith({
        assetId: null,
        symbol: "GARAN",
        quantity: 1.5,
        unitPrice: 10.25,
        note: null,
        type: "Buy",
        transactionDate: expect.any(String),
      }),
    );
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
