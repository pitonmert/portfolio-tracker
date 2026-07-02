import { useMemo, useState } from "react";

import { PencilIcon } from "@/components/ui/icons";
import type { PortfolioDashboardSummary } from "@/types/portfolio";
import { formatCurrency, getPnlClassCard } from "@/utils/formatters";
import { CashBalanceModal } from "./CashBalanceModal";

interface PortfolioSummaryPanelProps {
  summary: PortfolioDashboardSummary | null | undefined;
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
  label: "shrink-0 text-xs font-medium uppercase text-[var(--ink-3)]",
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
};

function formatSignedCurrency(value: number): string {
  return formatCurrency(Math.abs(value));
}

export function PortfolioSummaryPanel({
  summary,
  cashBalanceLoading,
  cashBalanceError,
  onCashBalanceSave,
}: PortfolioSummaryPanelProps) {
  const [isCashBalanceModalOpen, setIsCashBalanceModalOpen] = useState(false);
  const displaySummary = useMemo(
    () =>
      summary ?? {
        cashBalance: 0,
        cashBalanceUpdatedAt: "",
        totalActivePositionCost: 0,
        totalMarketValue: 0,
        totalRealizedPnL: 0,
        totalUnrealizedPnL: 0,
        totalPnL: 0,
        totalPortfolioValue: 0,
      },
    [summary],
  );
  const cashBalanceUnavailable = cashBalanceError !== null;

  const openCashBalanceModal = () => {
    if (cashBalanceLoading || cashBalanceUnavailable) {
      return;
    }

    setIsCashBalanceModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <section className={styles.card} aria-label="Portföy özeti">
        <div className={styles.grid}>
          <div className={styles.metric}>
            <div className={styles.metricHeader}>
              <span className={styles.label}>Toplam</span>
              <span
                className={`${styles.pnlBadge} ${getPnlClassCard(displaySummary.totalPnL)}`}
              >
                <span className={styles.pnlBadgeValue}>
                  {formatSignedCurrency(displaySummary.totalPnL)}
                </span>
              </span>
            </div>
            <span className={styles.valueWithIcon}>
              <span className="min-w-0 truncate">
                {formatCurrency(displaySummary.totalPortfolioValue)}
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
                disabled={cashBalanceLoading || cashBalanceUnavailable}
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
                  : formatCurrency(displaySummary.cashBalance)}
              </span>
            </span>
          </div>
        </div>
      </section>

      {isCashBalanceModalOpen && (
        <CashBalanceModal
          cashBalance={displaySummary.cashBalance}
          onClose={() => setIsCashBalanceModalOpen(false)}
          onSave={onCashBalanceSave}
        />
      )}
    </div>
  );
}
