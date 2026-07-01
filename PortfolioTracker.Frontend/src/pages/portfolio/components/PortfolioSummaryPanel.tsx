import { useMemo, useState, type KeyboardEvent } from "react";

import { ModalShell } from "../../../components/ui/ModalShell";
import { PencilIcon, XIcon } from "../../../components/ui/icons";
import { useToast } from "../../../context/ToastContext";
import type { PortfolioPosition } from "../../../types/portfolio";
import { formatCurrency } from "../../../utils/formatters";
import {
  getPortfolioSummary,
  type MarketPriceMap,
} from "../utils/portfolioCalculations";

interface PortfolioSummaryPanelProps {
  positions: PortfolioPosition[] | null | undefined;
  marketPrices: MarketPriceMap;
  cashBalance: number;
  cashBalanceLoading: boolean;
  cashBalanceError: string | null;
  onCashBalanceSave: (cashBalance: number) => Promise<number>;
}

const styles = {
  container:
    "w-full shrink-0 flex justify-center px-5 pt-5 max-[760px]:px-4 max-[760px]:pt-4 max-[420px]:px-3 max-[420px]:pt-3",
  card: "flex w-full max-w-[640px] min-w-0 overflow-x-auto overscroll-none text-left select-none",
  grid: "grid w-full min-w-0 grid-cols-2 gap-2.5",
  metric:
    "flex h-16 min-w-0 flex-col items-start gap-1 rounded-lg border border-[color:var(--line-soft)] bg-[var(--bg)] px-3 py-2 shadow-sm",
  metricHeader: "flex w-full items-center justify-between gap-3",
  pnlBadge: "shrink-0 whitespace-nowrap text-[10px] font-medium",
  pnlBadgeValue: "inline-flex items-center gap-0.5",
  cashMetric:
    "flex h-16 min-w-0 flex-col items-start gap-1 rounded-lg border border-[color:var(--line-soft)] bg-[var(--bg)] px-3 py-2 text-left shadow-sm",
  label:
    "shrink-0 text-[11px] font-medium uppercase tracking-wider text-[var(--ink-3)]",
  value:
    "min-w-0 max-w-full truncate whitespace-nowrap text-right font-mono text-[14px] font-semibold tabular-nums text-[var(--ink)]",
  valueWithIcon:
    "ml-auto flex h-6 min-w-0 max-w-full items-center justify-end gap-1 whitespace-nowrap text-right font-mono text-[14px] font-semibold tabular-nums text-[var(--ink)]",
  cashEditValue:
    "flex h-6 w-full min-w-0 items-center justify-end gap-1.5 whitespace-nowrap text-right font-mono text-[14px] font-semibold tabular-nums text-[var(--ink)]",
  cashEditButton:
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--ink-3)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 sm:h-6 sm:w-6 select-none",
  cashValue: "min-w-0 truncate text-right",
  cashValueError: "text-[var(--expense)]",
  modalBackdrop:
    "fixed inset-x-0 top-0 bottom-auto z-[150] flex h-[100dvh] touch-none items-start justify-center overflow-hidden bg-[var(--backdrop)] p-4 backdrop-blur sm:items-center max-[420px]:p-3",
  modal:
    "w-full max-w-sm touch-auto overflow-hidden rounded-2xl border border-[color:var(--line-soft)] bg-[var(--page-bg)] p-5 text-[var(--ink)] shadow-xl",
  modalHeader: "flex items-center justify-between gap-4",
  modalTitle:
    "min-w-0 truncate font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--ink)]",
  modalCloseButton:
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-2)] text-[var(--ink-2)] transition-colors hover:bg-[var(--line)] hover:text-[var(--ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] select-none",
  modalBody: "mt-4 flex flex-col gap-2 text-left",
  modalLabel:
    "mb-1.5 block text-left text-[10px] font-medium uppercase tracking-wide text-[var(--ink-3)]",
  modalInputFrame:
    "flex items-center rounded-xl border border-[color:var(--line)] bg-[var(--bg)] px-3 py-2 focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[var(--focus-ring)]",
  modalInput:
    "min-w-0 flex-1 border-0 bg-transparent p-0 text-left font-mono text-lg font-medium tabular-nums text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)]",
  modalMessage: "min-h-4 text-left text-[11px] font-medium text-[var(--ink-3)]",
  modalError: "min-h-4 text-left text-[11px] font-medium text-[var(--expense)]",
  modalActions: "mt-4 flex items-center justify-end gap-2",
  modalCancelButton:
    "inline-flex h-10 items-center justify-center rounded-lg border border-[color:var(--line)] bg-[var(--bg)] px-4 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 select-none",
  modalSaveButton:
    "inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 select-none",
  pnlPositive: "text-[var(--income)]",
  pnlNegative: "text-[var(--expense)]",
  pnlNeutral: "text-[var(--ink-2)]",
};

function getPnlClass(value: number): string {
  if (value > 0) return styles.pnlPositive;
  if (value < 0) return styles.pnlNegative;
  return styles.pnlNeutral;
}

function formatSignedCurrency(value: number): string {
  return formatCurrency(Math.abs(value));
}

function formatCashBalanceDraft(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCashBalanceInput(value: string): string {
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
  const decimalDigits = decimalPart.replace(/\D/g, "").slice(0, 2);
  const groupedInteger = integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return hasDecimalSeparator
    ? `${groupedInteger},${decimalDigits}`
    : groupedInteger;
}

function parseCashBalanceDraft(value: string): number {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function PortfolioSummaryPanel({
  positions,
  marketPrices,
  cashBalance,
  cashBalanceLoading,
  cashBalanceError,
  onCashBalanceSave,
}: PortfolioSummaryPanelProps) {
  const { showToast } = useToast();
  const [isCashBalanceModalOpen, setIsCashBalanceModalOpen] = useState(false);
  const [cashBalanceDraft, setCashBalanceDraft] = useState(() =>
    formatCashBalanceDraft(cashBalance),
  );
  const [isCashBalanceDirty, setIsCashBalanceDirty] = useState(false);
  const [isSavingCashBalance, setIsSavingCashBalance] = useState(false);
  const [cashBalanceSaveError, setCashBalanceSaveError] = useState<
    string | null
  >(null);
  const summary = useMemo(
    () => getPortfolioSummary(positions, marketPrices),
    [marketPrices, positions],
  );
  const totalPortfolioValue = summary.totalMarketValue + cashBalance;
  const cashBalanceUnavailable = cashBalanceError !== null;

  const handleCashBalanceChange = (value: string) => {
    setCashBalanceDraft(formatCashBalanceInput(value));
    setIsCashBalanceDirty(true);
    setCashBalanceSaveError(null);
  };

  const openCashBalanceModal = () => {
    if (cashBalanceLoading || isSavingCashBalance || cashBalanceUnavailable) {
      return;
    }

    setCashBalanceDraft(formatCashBalanceDraft(cashBalance));
    setIsCashBalanceDirty(false);
    setCashBalanceSaveError(null);
    setIsCashBalanceModalOpen(true);
  };

  const closeCashBalanceModal = () => {
    if (isSavingCashBalance) return;

    setCashBalanceDraft(formatCashBalanceDraft(cashBalance));
    setIsCashBalanceDirty(false);
    setCashBalanceSaveError(null);
    setIsCashBalanceModalOpen(false);
  };

  const saveCashBalance = async () => {
    if (cashBalanceLoading || isSavingCashBalance || cashBalanceUnavailable) {
      return;
    }

    const nextCashBalance = parseCashBalanceDraft(cashBalanceDraft);
    if (!isCashBalanceDirty && nextCashBalance === cashBalance) {
      setCashBalanceDraft(formatCashBalanceDraft(cashBalance));
      setIsCashBalanceModalOpen(false);
      return;
    }

    setCashBalanceSaveError(null);
    setIsSavingCashBalance(true);
    try {
      const savedCashBalance = await onCashBalanceSave(nextCashBalance);
      setCashBalanceDraft(formatCashBalanceDraft(savedCashBalance));
      setIsCashBalanceDirty(false);
      setIsCashBalanceModalOpen(false);
      showToast("Bakiye kaydedildi");
    } catch {
      setCashBalanceSaveError("Bakiye kaydedilemedi.");
      showToast("Bakiye kaydedilemedi", "error");
    } finally {
      setIsSavingCashBalance(false);
    }
  };

  const handleCashBalanceKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void saveCashBalance();
      return;
    }

    if (event.key === "Escape") {
      closeCashBalanceModal();
    }
  };

  return (
    <div className={styles.container}>
      <section className={styles.card} aria-label="Portföy özeti">
        <div className={styles.grid}>
          <div className={styles.metric}>
            <div className={styles.metricHeader}>
              <span className={styles.label}>Toplam</span>
              <span
                className={`${styles.pnlBadge} ${getPnlClass(summary.totalPnL)}`}
              >
                <span className={styles.pnlBadgeValue}>
                  {formatSignedCurrency(summary.totalPnL)}
                </span>
              </span>
            </div>
            <span className={styles.valueWithIcon}>
              <span className="min-w-0 truncate">
                {formatCurrency(totalPortfolioValue)}
              </span>
            </span>
          </div>
          <div className={styles.cashMetric}>
            <div className={styles.metricHeader}>
              <span className={styles.label}>Bakiye</span>
            </div>
            <span className={styles.cashEditValue}>
              <button
                className={styles.cashEditButton}
                type="button"
                onClick={openCashBalanceModal}
                disabled={
                  cashBalanceLoading ||
                  isSavingCashBalance ||
                  cashBalanceUnavailable
                }
                aria-label="Bakiyeyi düzenle"
                title="Bakiyeyi düzenle"
              >
                <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <span
                className={`${styles.cashValue} ${
                  cashBalanceUnavailable ? styles.cashValueError : ""
                }`}
              >
                {cashBalanceUnavailable
                  ? "Bakiye alınamadı"
                  : formatCurrency(cashBalance)}
              </span>
            </span>
          </div>
        </div>
      </section>

      {isCashBalanceModalOpen && (
        <ModalShell
          backdropClassName={styles.modalBackdrop}
          onClose={closeCashBalanceModal}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cash-balance-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 id="cash-balance-modal-title" className={styles.modalTitle}>
                Bakiye
              </h2>
              <button
                className={styles.modalCloseButton}
                type="button"
                onClick={closeCashBalanceModal}
                disabled={isSavingCashBalance}
                aria-label="Kapat"
              >
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <label>
                <span className={styles.modalLabel}>Nakit bakiye</span>
                <span className={styles.modalInputFrame}>
                  <input
                    autoFocus
                    className={styles.modalInput}
                    inputMode="decimal"
                    enterKeyHint="done"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="0,00"
                    value={cashBalanceDraft}
                    onChange={(event) =>
                      handleCashBalanceChange(event.target.value)
                    }
                    onDoubleClick={(event) => {
                      event.currentTarget.select();
                    }}
                    onKeyDown={handleCashBalanceKeyDown}
                    disabled={isSavingCashBalance}
                    aria-label="Hisseye bağlı olmayan nakit bakiye"
                  />
                </span>
              </label>

              <span
                className={
                  cashBalanceSaveError ? styles.modalError : styles.modalMessage
                }
              >
                {cashBalanceSaveError ??
                  "Hisseye bağlı olmayan nakit tutarı gir."}
              </span>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelButton}
                type="button"
                onClick={closeCashBalanceModal}
                disabled={isSavingCashBalance}
              >
                Vazgeç
              </button>
              <button
                className={styles.modalSaveButton}
                type="button"
                onClick={() => void saveCashBalance()}
                disabled={isSavingCashBalance || !isCashBalanceDirty}
              >
                {isSavingCashBalance ? "Kaydediliyor" : "Kaydet"}
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
