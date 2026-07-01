export const CLOSED_QUANTITY_TOLERANCE = 0.0001;

export function isClosedPosition(netQuantity: number): boolean {
  return Math.abs(netQuantity) < CLOSED_QUANTITY_TOLERANCE;
}

export function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("tr-TR");
}
