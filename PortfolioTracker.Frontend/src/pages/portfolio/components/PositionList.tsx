import type { PortfolioPosition } from "../../../types/portfolio";
import {
  getMarketPriceKey,
  type MarketPriceMap,
} from "../utils/portfolioCalculations";
import { PositionCard } from "./PositionCard";

interface PositionListProps {
  loading: boolean;
  error: string | null;
  hasRows: boolean;
  hasVisibleRows: boolean;
  filteredRows: PortfolioPosition[];
  marketPrices: MarketPriceMap;
  marketPricesLoading: boolean;
  onMarketPriceChanged: () => void;
  onSelectAsset: (symbol: string) => void;
}

const styles = {
  container: "flex flex-col gap-3",
  messageBox:
    "mt-4 rounded bg-[var(--bg-2)] px-4 py-12 text-center text-sm text-[var(--ink-2)]",
  errorBox:
    "mt-4 rounded bg-[var(--bg-2)] px-4 py-10 text-center text-sm text-[var(--expense)]",
  loadingBox:
    "mt-4 rounded bg-[var(--bg-2)] px-4 py-10 text-center text-sm text-[var(--ink-2)]",
  spinner:
    "inline-block h-4 w-4 animate-spin rounded-full border-2 border-[color:var(--line-soft)] border-t-[color:var(--ink)]",
};

function LoadingState() {
  return (
    <div className={styles.loadingBox} role="status" aria-live="polite">
      <span className={styles.spinner} /> yükleniyor...
    </div>
  );
}

interface ErrorStateProps {
  message: string;
}

function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className={styles.errorBox} role="alert" aria-live="assertive">
      {message}
    </div>
  );
}

interface EmptyStateProps {
  message: string;
}

function EmptyState({ message }: EmptyStateProps) {
  return <div className={styles.messageBox}>{message}</div>;
}

export function PositionList({
  loading,
  error,
  hasRows,
  hasVisibleRows,
  filteredRows,
  marketPrices,
  marketPricesLoading,
  onMarketPriceChanged,
  onSelectAsset,
}: PositionListProps) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!hasRows) return <EmptyState message="Pozisyon bulunamadı" />;
  if (!hasVisibleRows) return <EmptyState message="Sonuç bulunamadı" />;

  return (
    <div className={styles.container}>
      {filteredRows.map((row) => (
        <PositionCard
          key={row.symbol}
          position={row}
          marketPrice={marketPrices[getMarketPriceKey(row.symbol)]}
          marketPricesLoading={marketPricesLoading}
          onMarketPriceChanged={onMarketPriceChanged}
          onClick={() => onSelectAsset(row.symbol)}
        />
      ))}
    </div>
  );
}
