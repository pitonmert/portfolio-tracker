export function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("tr-TR");
}
