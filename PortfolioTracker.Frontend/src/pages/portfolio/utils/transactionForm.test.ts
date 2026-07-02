import { describe, expect, it } from "vitest";

import {
  getFieldErrors,
  transactionFormResolver,
  type TransactionFormState,
} from "./transactionForm";

const validState: TransactionFormState = {
  type: "Buy",
  assetId: null,
  symbol: "GARAN",
  quantity: "1,5",
  unitPrice: "10,25",
  note: "",
  date: "2026-01-01T12:00:00",
};

describe("transactionForm", () => {
  it("accepts valid decimal inputs with comma separators", () => {
    expect(getFieldErrors(validState)).toEqual({});
  });

  it("returns required field errors for an empty form", () => {
    expect(
      getFieldErrors({
        ...validState,
        symbol: "",
        quantity: "",
        unitPrice: "",
        date: "",
      }),
    ).toEqual({
      symbol: "Varlık adı zorunlu.",
      quantity: "Adet zorunlu.",
      unitPrice: "Birim fiyat zorunlu.",
      date: "Tarih ve saat zorunlu.",
    });
  });

  it("rejects invalid numbers, non-positive values, and invalid dates", () => {
    expect(
      getFieldErrors({
        ...validState,
        quantity: "abc",
        unitPrice: "0",
        date: "not-a-date",
      }),
    ).toEqual({
      quantity: "Adet sayı olmalı.",
      unitPrice: "Birim fiyat 0’dan büyük olmalı.",
      date: "Geçerli tarih gir.",
    });
  });

  it("returns resolver values for valid state", async () => {
    await expect(
      transactionFormResolver(validState, {}, {} as never),
    ).resolves.toEqual({
      values: validState,
      errors: {},
    });
  });
});
