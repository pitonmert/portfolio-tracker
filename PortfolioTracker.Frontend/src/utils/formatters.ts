import type { TransactionType } from "@/types/transaction";

export function formatTL(amount: number, type?: TransactionType): string {
  const abs = Math.abs(amount).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign =
    type === "Sell" ? "+" : type === "Buy" ? "−" : amount >= 0 ? "+" : "−";
  return `${sign}₺${abs}`;
}

export function formatCurrency(amount: number): string {
  return `₺${Math.abs(amount).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("tr-TR", {
    maximumFractionDigits: 8,
  });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function getPnlClassHeader(value: number): string {
  if (value > 0) return "text-xs font-medium text-[var(--income)]";
  if (value < 0) return "text-xs font-medium text-[var(--expense)]";
  return "text-xs font-medium text-[var(--ink-3)]";
}

export function getPnlClassCard(value: number): string {
  if (value > 0) return "text-sm font-medium text-[var(--income)]";
  if (value < 0) return "text-sm font-medium text-[var(--expense)]";
  return "text-sm font-medium text-[var(--ink-3)]";
}
