import type { PortfolioPosition } from "@/types/portfolio";
import type { MarketPriceQuote } from "@/types/marketPrice";
import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { PencilIcon } from "@/components/ui/icons";
import {
  formatCurrency,
  formatNumber,
  getPnlClassCard,
} from "@/utils/formatters";
import { cx } from "@/utils/cx";
import { ManualPriceModal } from "./ManualPriceModal";

// --- TYPES & INTERFACES ---

export type PositionDisplayMetric =
  "totalPnL" | "unrealizedPnL" | "realizedPnL";

// --- MAIN COMPONENT ---
interface PositionCardProps {
  position: PortfolioPosition;
  marketPrice?: MarketPriceQuote | null;
  marketPricesLoading: boolean;
  displayMetric: PositionDisplayMetric;
  onMarketPriceChanged: () => void;
  onClick?: () => void;
}

export function PositionCard({
  position,
  marketPrice,
  marketPricesLoading,
  displayMetric,
  onMarketPriceChanged,
  onClick,
}: PositionCardProps) {
  const isClosed = position.isClosed;
  const quote = marketPrice ?? position.marketPrice ?? undefined;
  const hasKnownMarketValue = isClosed || position.currentPrice != null;
  const displayPnL = getDisplayPnL(position, displayMetric, {
    totalPnL: position.totalPnL,
    unrealizedPnL: position.unrealizedPnL,
  });
  const displayPnlClass = getPnlClassCard(displayPnL);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    onClick();
  };

  return (
    <div
      className={cx(
        "flex flex-col",
        onClick && "cursor-pointer",
        isClosed && "opacity-75",
      )}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between">
        {/* Left column: asset details */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate">{position.symbol}</span>
            <span className="shrink-0 text-xs text-[var(--ink-3)] before:mr-1.5 before:content-['•']">
              {isClosed
                ? "Kapalı"
                : `${formatNumber(position.netQuantity)} Adet`}
            </span>
          </div>
          <CurrentPriceMetric
            symbol={position.symbol}
            quote={quote}
            loading={marketPricesLoading}
            isClosed={isClosed}
            onChanged={onMarketPriceChanged}
          />
        </div>

        {/* Right column: portfolio impact */}
        <div className="flex flex-col items-end gap-1 text-right">
          <span>
            {hasKnownMarketValue ? formatCurrency(position.marketValue) : "-"}
          </span>
          <span className={displayPnlClass}>{formatPnL(displayPnL)}</span>
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---
interface CurrentPriceMetricProps {
  symbol: string;
  quote?: MarketPriceQuote;
  loading: boolean;
  isClosed: boolean;
  onChanged: () => void;
}
function CurrentPriceMetric({
  symbol,
  quote,
  loading,
  isClosed,
  onChanged,
}: CurrentPriceMetricProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const hasPrice =
    quote?.isAvailable &&
    quote.currentPrice !== null &&
    quote.currentPrice !== undefined;
  const currentPrice = hasPrice ? (quote.currentPrice ?? null) : null;
  const isManualPrice = quote?.isManual === true;
  const showMissingPriceEntry = !isClosed && !loading && !hasPrice;

  const stopCardClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const stopCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div
      className="flex items-baseline gap-1.5"
      onClick={stopCardClick}
      onKeyDown={stopCardKeyDown}
    >
      {showMissingPriceEntry ? (
        <button
          className="inline-flex h-6 items-center justify-center rounded-md bg-[var(--accent)] px-2.5 text-[11px] font-medium text-[var(--on-accent)] transition-all hover:bg-[var(--accent-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={openModal}
        >
          Fiyat Gir
        </button>
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-medium text-[var(--ink-2)]">
            {formatMarketPrice(quote, loading)}
          </span>
          {isManualPrice && (
            <div className="flex items-center gap-1.5 before:text-xs before:font-medium before:text-[var(--ink-3)] before:content-['•']">
              <button
                type="button"
                onClick={openModal}
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[var(--ink-3)] transition-all hover:bg-[var(--bg-2)] hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                aria-label="Fiyatı düzenle"
                title="Fiyatı düzenle"
              >
                <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <ManualPriceModal
          symbol={symbol}
          currentPrice={currentPrice}
          isManualPrice={isManualPrice}
          onClose={closeModal}
          onChanged={onChanged}
        />
      )}
    </div>
  );
}

// --- HELPER FUNCTIONS ---

function formatPnL(value: number): string {
  return formatCurrency(Math.abs(value));
}

function getDisplayPnL(
  position: PortfolioPosition,
  displayMetric: PositionDisplayMetric,
  values: { totalPnL: number; unrealizedPnL: number },
): number {
  if (displayMetric === "totalPnL") return values.totalPnL;
  if (displayMetric === "realizedPnL") return position.realizedPnL;
  return values.unrealizedPnL;
}

function formatMarketPrice(
  quote: MarketPriceQuote | undefined,
  loading: boolean,
): string {
  if (loading) return "-";
  if (
    !quote?.isAvailable ||
    quote.currentPrice === null ||
    quote.currentPrice === undefined
  ) {
    return "-";
  }

  return formatCurrency(quote.currentPrice);
}
