interface FormatDecimalInputOptions {
  maxFractionDigits?: number;
}

export function formatDecimalDraft(
  value: number,
  maxFractionDigits?: number,
): string {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}

export function formatDecimalInput(
  value: string,
  options: FormatDecimalInputOptions = {},
): string {
  const sanitized = value.replace(/[^\d,.]/g, "");
  if (!sanitized) return "";

  const hasComma = sanitized.includes(",");
  const hasDot = sanitized.includes(".");
  const groupedIntegerOnly = /^\d{1,3}(?:\.\d{3})+$/.test(sanitized);
  const decimalSeparatorIndex = hasComma
    ? sanitized.lastIndexOf(",")
    : hasDot && !groupedIntegerOnly
      ? sanitized.lastIndexOf(".")
      : -1;

  const hasDecimalSeparator = decimalSeparatorIndex >= 0;
  const integerPart = hasDecimalSeparator
    ? sanitized.slice(0, decimalSeparatorIndex)
    : sanitized;
  const decimalPart = hasDecimalSeparator
    ? sanitized.slice(decimalSeparatorIndex + 1)
    : "";
  const integerDigits =
    integerPart.replace(/\D/g, "").replace(/^0+(?=\d)/, "") || "0";
  const rawDecimalDigits = decimalPart.replace(/\D/g, "");
  const decimalDigits =
    options.maxFractionDigits === undefined
      ? rawDecimalDigits
      : rawDecimalDigits.slice(0, options.maxFractionDigits);
  const groupedInteger = integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return hasDecimalSeparator
    ? `${groupedInteger},${decimalDigits}`
    : groupedInteger;
}

export function parseFormattedDecimalInput(value: string): number {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}
