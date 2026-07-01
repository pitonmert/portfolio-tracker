import { useState, type KeyboardEvent, type MouseEvent } from "react";

import { ModalShell } from "../../../components/ui/ModalShell";
import {
  TurkishLiraIcon,
  XIcon,
  PencilIcon,
} from "../../../components/ui/icons";
import { useToast } from "../../../context/ToastContext";
import { marketPriceService } from "../../../services/marketPriceService";
import type { PortfolioPosition } from "../../../types/portfolio";
import type { MarketPriceQuote } from "../../../types/marketPrice";
import { formatCurrency, formatNumber } from "../../../utils/formatters";
import { isClosedPosition } from "../utils/helpers";
import {
  getCurrentMarketValue,
  getMarketPriceValue,
  getTotalPnL,
  getUnrealizedPnL,
} from "../utils/portfolioCalculations";

interface PositionCardProps {
  position: PortfolioPosition;
  marketPrice?: MarketPriceQuote;
  marketPricesLoading: boolean;
  onMarketPriceChanged: () => void;
  onClick?: () => void;
}

function formatPnL(value: number): string {
  return formatCurrency(Math.abs(value));
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const styles = {
  cardBase:
    "flex h-[112px] w-full min-w-0 select-none flex-col justify-between overflow-hidden rounded-xl border border-[color:var(--line)] border-l-4 bg-[var(--bg)] px-4 py-3 text-left shadow transition-all",
  cardInteractive:
    "cursor-pointer hover:border-[color:var(--ink-3)] hover:bg-[var(--bg-2)] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
  cardClosed: "opacity-60",

  header: "flex w-full items-start justify-between gap-4",
  symbolWrapper: "flex min-w-0 flex-col gap-1",
  symbolValue:
    "flex min-w-0 items-baseline gap-1.5 font-mono text-[17px] font-semibold leading-tight text-[var(--ink)]",
  symbolMeta:
    "shrink-0 font-sans text-[12px] font-medium leading-none text-[var(--ink-3)]",
  marketValue:
    "font-mono text-[17px] font-semibold leading-tight tabular-nums text-[var(--ink)]",

  detailsGrid:
    "mt-auto flex w-full min-h-[48px] items-stretch justify-between gap-2",
  detailItem: "flex flex-col justify-start gap-1",
  detailItemLeft: "items-start text-left",
  detailItemCenter: "items-center text-center",
  detailItemRight: "items-end text-right",

  detailLabel:
    "text-[10px] font-medium uppercase tracking-wide text-[var(--ink-3)]",
  detailValue: "font-mono text-[13px] font-medium leading-tight tabular-nums",

  priceEntryButton:
    "inline-flex h-6 items-center justify-center rounded-md bg-[var(--accent)] px-2 text-[11px] font-medium text-[var(--on-accent)] shadow-sm transition-all hover:bg-[var(--accent-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60",
  priceValueGroup: "flex min-w-0 items-center justify-end gap-1.5",
  priceTime: "shrink-0 text-[11px] font-medium text-[var(--ink-3)]",
  modalBackdrop:
    "fixed inset-x-0 top-0 bottom-auto h-[100dvh] touch-none z-[150] flex items-start justify-center overflow-hidden bg-[var(--backdrop)] p-4 backdrop-blur sm:items-center max-[420px]:p-3",
  modal:
    "w-full max-w-sm touch-auto overflow-hidden rounded-2xl border border-[color:var(--line-soft)] bg-[var(--page-bg)] p-5 text-[var(--ink)] shadow-xl",
  modalHeader: "flex items-center justify-between gap-4",
  modalSymbol:
    "min-w-0 truncate font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--ink)]",
  modalCloseButton:
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-2)] text-[var(--ink-2)] transition-colors hover:bg-[var(--line)] hover:text-[var(--ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
  modalBody: "mt-4 flex flex-col gap-2 text-left",
  modalLabel:
    "mb-1.5 block text-left text-[10px] font-medium uppercase tracking-wide text-[var(--ink-3)]",
  modalInputFrame:
    "flex items-center gap-2 rounded-xl border border-[color:var(--line)] bg-[var(--bg)] px-3 py-2 focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[var(--focus-ring)]",
  modalCurrencyIcon: "h-4 w-4 shrink-0 text-[var(--ink)]",
  modalInput:
    "min-w-0 flex-1 border-0 bg-transparent p-0 text-left font-mono text-lg font-medium tabular-nums text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)]",
  modalMessage: "min-h-4 text-left text-[11px] font-medium text-[var(--ink-3)]",
  modalError: "min-h-4 text-left text-[11px] font-medium text-[var(--expense)]",
  modalActions: "mt-4 flex items-center justify-between gap-3",
  modalRightActions: "flex items-center justify-end gap-2",
  modalDeleteButton:
    "inline-flex h-10 items-center justify-center rounded-lg border border-[color:var(--line)] bg-[var(--bg)] px-4 text-sm font-medium text-[var(--expense)] transition-all hover:border-[color:var(--expense)] hover:bg-[var(--bg-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--expense)] disabled:cursor-not-allowed disabled:opacity-50",
  modalCancelButton:
    "inline-flex h-10 items-center justify-center rounded-lg border border-[color:var(--line)] bg-[var(--bg)] px-4 text-sm font-medium text-[var(--ink)] transition-all hover:bg-[var(--bg-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
  modalSaveButton:
    "inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-[var(--on-accent)] transition-all hover:bg-[var(--accent-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
  editPriceButton:
    "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[var(--ink-3)] transition-all hover:bg-[var(--bg-2)] hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",

  pnlPositive: "text-[var(--income)]",
  pnlNegative: "text-[var(--expense)]",
  pnlNeutral: "text-[var(--ink-3)]",
};

export function PositionCard({
  position,
  marketPrice,
  marketPricesLoading,
  onMarketPriceChanged,
  onClick,
}: PositionCardProps) {
  const isClosed = isClosedPosition(position.netQuantity);
  const currentPriceValue = getMarketPriceValue(marketPrice);
  const hasKnownMarketValue = isClosed || currentPriceValue !== null;
  const marketValue = getCurrentMarketValue(position, currentPriceValue);
  const unrealizedPnL = getUnrealizedPnL(position, currentPriceValue);
  const totalPnL = getTotalPnL(position, currentPriceValue);
  const unrealizedPnlClass = getPnlClass(unrealizedPnL);
  const totalPnlClass = getPnlClass(totalPnL);

  const pnlBorderClass =
    totalPnL > 0
      ? "border-l-[color:var(--income)] hover:border-l-[color:var(--income)]"
      : totalPnL < 0
        ? "border-l-[color:var(--expense)] hover:border-l-[color:var(--expense)]"
        : "border-l-[color:var(--line)] hover:border-l-[color:var(--line)]";

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    onClick();
  };

  return (
    <div
      className={cx(
        styles.cardBase,
        onClick && styles.cardInteractive,
        pnlBorderClass,
        isClosed && styles.cardClosed,
      )}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.header}>
        <div className={styles.symbolWrapper}>
          <div className={styles.symbolValue}>
            <span className="truncate">{position.symbol}</span>
            <span className={styles.symbolMeta}>•</span>
            <span className={styles.symbolMeta}>
              {isClosed
                ? "Kapalı"
                : `${formatNumber(position.netQuantity)} Adet`}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end text-right">
          <span className={styles.marketValue}>
            {hasKnownMarketValue ? formatCurrency(marketValue) : "-"}
          </span>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={cx(styles.detailItem, styles.detailItemLeft)}>
          <span className={styles.detailLabel}>Toplam K/Z</span>
          <span className={cx(styles.detailValue, totalPnlClass)}>
            {formatPnL(totalPnL)}
          </span>
        </div>

        {!isClosed && (
          <div className={cx(styles.detailItem, styles.detailItemCenter)}>
            <span className={styles.detailLabel}>Açık K/Z</span>
            <span className={cx(styles.detailValue, unrealizedPnlClass)}>
              {formatPnL(unrealizedPnL)}
            </span>
          </div>
        )}

        <CurrentPriceMetric
          symbol={position.symbol}
          quote={marketPrice}
          loading={marketPricesLoading}
          isClosed={isClosed}
          onChanged={onMarketPriceChanged}
        />
      </div>
    </div>
  );
}

function getPnlClass(value: number): string {
  if (value > 0) return styles.pnlPositive;
  if (value < 0) return styles.pnlNegative;
  return styles.pnlNeutral;
}

function formatManualPriceDraft(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 8,
  }).format(value);
}

function formatManualPriceInput(value: string): string {
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
  const decimalDigits = decimalPart.replace(/\D/g, "");
  const groupedInteger = integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return hasDecimalSeparator
    ? `${groupedInteger},${decimalDigits}`
    : groupedInteger;
}

function parseManualPriceDraft(value: string): number {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

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
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [value, setValue] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasPrice =
    quote?.isAvailable &&
    quote.currentPrice !== null &&
    quote.currentPrice !== undefined;
  const currentPrice = hasPrice ? (quote.currentPrice ?? null) : null;
  const updatedTime = formatMarketPriceTime(quote);
  const isManualPrice = quote?.isManual === true;
  const showMissingPriceEntry = !isClosed && !loading && !hasPrice;

  const stopCardClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const stopCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const openModal = () => {
    setValue(currentPrice !== null ? formatManualPriceDraft(currentPrice) : "");
    setDirty(false);
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setValue("");
    setDirty(false);
    setError(null);
  };

  const handleSave = async () => {
    if (saving || !dirty) return;

    setError(null);

    const isEmpty = !value.trim();
    const currentPrice = parseManualPriceDraft(value);

    if (!isEmpty && currentPrice <= 0) {
      setError("Geçerli fiyat gir.");
      return;
    }

    setSaving(true);
    try {
      if (isEmpty) {
        await marketPriceService.clearManualPrice(symbol);
        showToast("Manuel fiyat kaldırıldı");
      } else {
        await marketPriceService.saveManualPrice(symbol, currentPrice);
        setValue(formatManualPriceDraft(currentPrice));
        showToast("Fiyat kaydedildi");
      }
      setDirty(false);
      setModalOpen(false);
      onChanged();
    } catch {
      setError("İşlem başarısız.");
      showToast("İşlem başarısız", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteManualPrice = async () => {
    if (saving || !isManualPrice) return;

    setSaving(true);
    setError(null);

    try {
      await marketPriceService.clearManualPrice(symbol);
      showToast("Manuel fiyat silindi");
      setDirty(false);
      setModalOpen(false);
      onChanged();
    } catch {
      setError("Silme başarısız.");
      showToast("Silme başarısız", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (nextValue: string) => {
    setValue(formatManualPriceInput(nextValue));
    setDirty(true);
    setError(null);
  };

  return (
    <div
      className={cx(styles.detailItem, styles.detailItemRight)}
      onClick={stopCardClick}
      onKeyDown={stopCardKeyDown}
    >
      <span className={styles.detailLabel}>Güncel Fiyat</span>
      {showMissingPriceEntry ? (
        <button
          className={styles.priceEntryButton}
          type="button"
          onClick={openModal}
        >
          Fiyat Gir
        </button>
      ) : (
        <div className={styles.priceValueGroup}>
          {isManualPrice ? (
            <button
              type="button"
              onClick={openModal}
              className={styles.editPriceButton}
              aria-label="Fiyatı düzenle"
              title="Fiyatı düzenle"
            >
              <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : (
            updatedTime && (
              <span className={styles.priceTime}>{updatedTime}</span>
            )
          )}
          <span className={styles.detailValue}>
            {formatMarketPrice(quote, loading)}
          </span>
        </div>
      )}

      {modalOpen && (
        <ModalShell
          backdropClassName={styles.modalBackdrop}
          onClose={closeModal}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${symbol}-price-modal-title`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2
                id={`${symbol}-price-modal-title`}
                className={styles.modalSymbol}
              >
                {symbol}
              </h2>
              <button
                className={styles.modalCloseButton}
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Kapat"
              >
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <label>
                <span className={styles.modalLabel}>Sembol fiyatı</span>
                <span className={styles.modalInputFrame}>
                  <TurkishLiraIcon
                    className={styles.modalCurrencyIcon}
                    aria-hidden="true"
                  />
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
                    value={value}
                    onChange={(event) => handleInputChange(event.target.value)}
                    onDoubleClick={(event) => {
                      event.currentTarget.select();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleSave();
                        return;
                      }

                      if (event.key === "Escape") {
                        closeModal();
                      }
                    }}
                    disabled={saving}
                    aria-label={`${symbol} sembol fiyatı`}
                  />
                </span>
              </label>

              <span className={error ? styles.modalError : styles.modalMessage}>
                {error ?? "Güncel fiyat bulunamadı."}
              </span>
            </div>

            <div className={styles.modalActions}>
              {isManualPrice ? (
                <button
                  className={styles.modalDeleteButton}
                  type="button"
                  onClick={() => void handleDeleteManualPrice()}
                  disabled={saving}
                >
                  Sil
                </button>
              ) : (
                <span aria-hidden="true" />
              )}

              <div className={styles.modalRightActions}>
                <button
                  className={styles.modalCancelButton}
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Vazgeç
                </button>
                <button
                  className={styles.modalSaveButton}
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving || !dirty}
                >
                  {saving ? "Kaydediliyor" : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
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

function formatMarketPriceTime(
  quote: MarketPriceQuote | undefined,
): string | null {
  const value = quote?.isManual ? quote.manualUpdatedAt : quote?.fetchedAt;
  return value ? formatTime(value) : null;
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
