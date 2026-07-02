import { describe, expect, it } from "vitest";

import {
  calculateTransactionTotal,
  getMarketPriceKey,
  isDecimalInput,
  normalizeDecimalInput,
  parseDecimalInput,
} from "./portfolioUiUtils";

describe("portfolioUiUtils", () => {
  it("normalizes and parses decimal input", () => {
    expect(normalizeDecimalInput(" 12,34 ")).toBe("12.34");
    expect(isDecimalInput("12,34")).toBe(true);
    expect(isDecimalInput("12.34")).toBe(true);
    expect(isDecimalInput("abc")).toBe(false);
    expect(parseDecimalInput("12,34")).toBe(12.34);
    expect(parseDecimalInput("abc")).toBe(0);
  });

  it("normalizes market price keys", () => {
    expect(getMarketPriceKey(" garan ")).toBe("GARAN");
  });

  it("calculates transaction total previews", () => {
    expect(calculateTransactionTotal(3, 12.5)).toBe(37.5);
  });
});
