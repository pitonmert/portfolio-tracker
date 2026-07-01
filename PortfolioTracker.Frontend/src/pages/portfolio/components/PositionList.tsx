import { useState } from "react";

import type { PortfolioPosition } from "@/types/portfolio";
import { uiStyles } from "@/components/ui/styles";
import { PositionCard, type PositionDisplayMetric } from "./PositionCard";
import { PositionGroupHeader } from "./PositionGroupHeader";

interface PositionListProps {
  loading: boolean;
  error: string | null;
  hasRows: boolean;
  hasVisibleRows: boolean;
  filteredRows: PortfolioPosition[];
  marketPricesLoading: boolean;
  onMarketPriceChanged: () => void;
  onSelectAsset: (symbol: string) => void;
}

type MarketGroupKey = "bist" | "tefas" | "other";

interface MarketGroup {
  key: MarketGroupKey;
  title: string;
  positions: PortfolioPosition[];
  metricValue: number;
  marketValue: number;
  updatedTime: string | null;
}

const marketGroupOrder: Array<{ key: MarketGroupKey; title: string }> = [
  { key: "bist", title: "BIST Hisseleri" },
  { key: "tefas", title: "TEFAS Fonları" },
  { key: "other", title: "Diğer Varlıklar" },
];

function getMarketGroupKey(market: string | null | undefined): MarketGroupKey {
  const normalized = market?.trim().toUpperCase();
  if (normalized === "BIST") return "bist";
  if (normalized === "TEFAS") return "tefas";
  return "other";
}

function getMarketGroups(
  positions: PortfolioPosition[],
  displayMetrics: Record<MarketGroupKey, PositionDisplayMetric>,
): MarketGroup[] {
  return marketGroupOrder
    .map(({ key, title }) => {
      const groupPositions = positions.filter(
        (position) => getMarketGroupKey(position.market) === key,
      );
      const metricValue = groupPositions.reduce(
        (total, position) =>
          total + getPositionMetric(position, displayMetrics[key]),
        0,
      );
      const marketValue = groupPositions.reduce(
        (total, position) => total + position.marketValue,
        0,
      );
      const updatedTime = getOldestGroupPriceTime(groupPositions);

      return {
        key,
        title,
        positions: groupPositions,
        metricValue,
        marketValue,
        updatedTime,
      };
    })
    .filter((group) => group.positions.length > 0);
}

function getOldestGroupPriceTime(
  positions: PortfolioPosition[],
): string | null {
  let oldestTime: number | null = null;

  for (const position of positions) {
    const quote = position.marketPrice;
    const value = quote?.isManual ? quote.manualUpdatedAt : quote?.fetchedAt;
    if (!quote?.isAvailable || !value) continue;

    const time = Date.parse(value);
    if (!Number.isFinite(time)) continue;

    oldestTime = oldestTime === null ? time : Math.min(oldestTime, time);
  }

  return oldestTime === null ? null : formatTime(oldestTime);
}

function formatTime(value: number): string {
  return new Date(value).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPositionMetric(
  position: PortfolioPosition,
  displayMetric: PositionDisplayMetric,
): number {
  if (displayMetric === "totalPnL") {
    return position.totalPnL;
  }

  if (displayMetric === "realizedPnL") {
    return position.realizedPnL;
  }

  return position.unrealizedPnL;
}

function LoadingState() {
  return (
    <div
      className={`mt-4 ${uiStyles.loadingBox}`}
      role="status"
      aria-live="polite"
    >
      <span className={uiStyles.spinner} /> yükleniyor...
    </div>
  );
}

interface ErrorStateProps {
  message: string;
}

function ErrorState({ message }: ErrorStateProps) {
  return (
    <div
      className={`mt-4 ${uiStyles.errorBox}`}
      role="alert"
      aria-live="assertive"
    >
      {message}
    </div>
  );
}

interface EmptyStateProps {
  message: string;
}

function EmptyState({ message }: EmptyStateProps) {
  return <div className={`mt-4 ${uiStyles.emptyBox}`}>{message}</div>;
}

export function PositionList({
  loading,
  error,
  hasRows,
  hasVisibleRows,
  filteredRows,
  marketPricesLoading,
  onMarketPriceChanged,
  onSelectAsset,
}: PositionListProps) {
  const [displayMetrics, setDisplayMetrics] = useState<
    Record<MarketGroupKey, PositionDisplayMetric>
  >({
    bist: "unrealizedPnL",
    tefas: "unrealizedPnL",
    other: "unrealizedPnL",
  });
  const [openMetricGroup, setOpenMetricGroup] = useState<MarketGroupKey | null>(
    null,
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!hasRows) return <EmptyState message="Pozisyon bulunamadı" />;
  if (!hasVisibleRows) return <EmptyState message="Sonuç bulunamadı" />;

  const groups = getMarketGroups(filteredRows, displayMetrics);

  const handleMetricChange = (
    groupKey: MarketGroupKey,
    value: PositionDisplayMetric,
  ) => {
    setDisplayMetrics((current) => ({
      ...current,
      [groupKey]: value,
    }));
    setOpenMetricGroup(null);
  };

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-4">
          <PositionGroupHeader
            title={group.title}
            updatedTime={group.updatedTime}
            displayMetric={displayMetrics[group.key]}
            metricValue={group.metricValue}
            marketValue={group.marketValue}
            dropdownOpen={openMetricGroup === group.key}
            onDropdownToggle={() =>
              setOpenMetricGroup((current) =>
                current === group.key ? null : group.key,
              )
            }
            onMetricChange={(value) => handleMetricChange(group.key, value)}
          />

          {group.positions.map((row) => (
            <PositionCard
              key={row.symbol}
              position={row}
              marketPricesLoading={marketPricesLoading}
              displayMetric={displayMetrics[group.key]}
              onMarketPriceChanged={onMarketPriceChanged}
              onClick={() => onSelectAsset(row.symbol)}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
