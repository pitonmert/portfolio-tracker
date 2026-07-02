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

export function calculateTransactionTotal(
  quantity: number,
  unitPrice: number,
): number {
  return quantity * unitPrice;
}
