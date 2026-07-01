import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { marketPriceService } from "../../services/marketPriceService";
import { portfolioService } from "../../services/portfolioService";
import { useAsync } from "../../hooks/useAsync";
import { useFilteredPositions } from "./hooks/useFilteredPositions";

import AssetHistoryModal from "./components/AssetHistoryModal";
import TransactionHistoryModal from "./components/transactions/TransactionHistoryModal";
import TransactionFormModal from "./components/transactions/TransactionFormModal";
import { PositionList } from "./components/PositionList";
import { FilterBar } from "./components/FilterBar";
import { PortfolioSummaryPanel } from "./components/PortfolioSummaryPanel";
import type { FilterType, SortType } from "./components/FilterBar";
import {
  getMarketPriceKey,
  type MarketPriceMap,
} from "./utils/portfolioCalculations";
import { isClosedPosition } from "./utils/helpers";

const DEFAULT_FILTER: FilterType = "open";
const DEFAULT_SORT: SortType = "symbol_asc";
const CONTROLS_STORAGE_KEY = "portfolioTracker.portfolio.controls";
const SESSION_STORAGE_KEY = "portfolioTracker.portfolio.session";
const OLD_CASH_BALANCE_STORAGE_KEY = "portfolioTracker.portfolio.cashBalance";

interface PortfolioControls {
  filter: FilterType;
  sort: SortType;
  search: string;
}

interface PortfolioSession {
  selectedSymbol: string | null;
  scrollTop: number;
}

function isFilterType(value: string | null): value is FilterType {
  return value === "all" || value === "open" || value === "closed";
}

function isSortType(value: string | null): value is SortType {
  return (
    value === "symbol_asc" ||
    value === "symbol_desc" ||
    value === "invested_desc" ||
    value === "invested_asc" ||
    value === "pnl_desc" ||
    value === "pnl_asc" ||
    value === "quantity_desc" ||
    value === "quantity_asc" ||
    value === "open_first" ||
    value === "closed_first"
  );
}

function readJson<T>(storage: Storage, key: string): Partial<T> {
  try {
    const value = storage.getItem(key);
    if (!value) return {};

    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function readSavedControls(): Partial<PortfolioControls> {
  if (typeof window === "undefined") return {};

  const saved = readJson<PortfolioControls>(
    window.localStorage,
    CONTROLS_STORAGE_KEY,
  );

  return {
    filter: isFilterType(saved.filter ?? null) ? saved.filter : undefined,
    sort: isSortType(saved.sort ?? null) ? saved.sort : undefined,
    search: typeof saved.search === "string" ? saved.search : undefined,
  };
}

function readSavedSession(): Partial<PortfolioSession> {
  if (typeof window === "undefined") return {};

  const saved = readJson<PortfolioSession>(
    window.sessionStorage,
    SESSION_STORAGE_KEY,
  );

  return {
    selectedSymbol:
      typeof saved.selectedSymbol === "string" && saved.selectedSymbol
        ? saved.selectedSymbol
        : null,
    scrollTop:
      typeof saved.scrollTop === "number" && Number.isFinite(saved.scrollTop)
        ? saved.scrollTop
        : 0,
  };
}

function readInitialControls(searchParams: URLSearchParams): PortfolioControls {
  const hasPortfolioParams =
    searchParams.has("filter") ||
    searchParams.has("sort") ||
    searchParams.has("search");
  const saved = hasPortfolioParams ? {} : readSavedControls();
  const filterParam = searchParams.get("filter");
  const sortParam = searchParams.get("sort");
  const searchParam = searchParams.get("search");

  return {
    filter: isFilterType(filterParam)
      ? filterParam
      : (saved.filter ?? DEFAULT_FILTER),
    sort: isSortType(sortParam) ? sortParam : (saved.sort ?? DEFAULT_SORT),
    search: searchParam ?? saved.search ?? "",
  };
}

function saveControls(controls: PortfolioControls) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CONTROLS_STORAGE_KEY, JSON.stringify(controls));
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

function saveSession(session: Partial<PortfolioSession>) {
  if (typeof window === "undefined") return;

  try {
    const current = readSavedSession();
    window.sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ ...current, ...session }),
    );
  } catch {
    // Session persistence is best-effort; the page remains usable without it.
  }
}

function setOptionalParam(
  params: URLSearchParams,
  key: string,
  value: string,
  defaultValue: string,
) {
  if (!value || value === defaultValue) {
    params.delete(key);
    return;
  }

  params.set(key, value);
}

const styles = {
  pageContainer: "flex h-full w-full flex-col min-w-0 overflow-hidden",
  contentWrapper: "flex h-full w-full flex-col min-w-0",
  panel: "flex h-full w-full flex-col min-w-0",
  listScrollContainer:
    "app-scrollbar flex-1 w-full min-h-0 overflow-auto overscroll-none",
  listCenterContainer:
    "w-full flex justify-center px-5 max-[760px]:px-4 max-[420px]:px-3",
  listInnerContainer: "w-full max-w-[640px] min-w-0 pb-3",
};

export default function PortfolioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialControlsRef = useRef<PortfolioControls | null>(null);
  const initialSessionRef = useRef<Partial<PortfolioSession> | null>(null);

  if (initialControlsRef.current === null) {
    initialControlsRef.current = readInitialControls(searchParams);
  }

  if (initialSessionRef.current === null) {
    initialSessionRef.current = readSavedSession();
  }

  const initialControls = initialControlsRef.current;
  const initialSession = initialSessionRef.current;

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(
    initialSession.selectedSymbol ?? null,
  );
  const [isAllTransactionsOpen, setIsAllTransactionsOpen] = useState(false);
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [cashBalanceValue, setCashBalanceValue] = useState(0);

  const [filter, setFilter] = useState<FilterType>(initialControls.filter);
  const [sort, setSort] = useState<SortType>(initialControls.sort);
  const [search, setSearch] = useState(initialControls.search);
  const listRef = useRef<HTMLDivElement>(null);
  const didRestoreScrollRef = useRef(false);
  const didMountControlsRef = useRef(false);

  const {
    data: positions,
    loading: positionsLoading,
    error: positionsError,
  } = useAsync(() => portfolioService.getPositions(), [refreshKey]);

  const {
    data: cashBalance,
    loading: cashBalanceLoading,
    error: cashBalanceError,
    refetch: refetchCashBalance,
  } = useAsync(() => portfolioService.getCashBalance(), []);

  const activeSymbols = useMemo(
    () =>
      (positions ?? [])
        .filter((position) => !isClosedPosition(position.netQuantity))
        .map((position) => position.symbol),
    [positions],
  );
  const activeSymbolsKey = activeSymbols.map(getMarketPriceKey).join(",");

  const {
    data: marketPriceRows,
    loading: marketPricesLoading,
    refetch: refetchMarketPrices,
  } = useAsync(
    () => marketPriceService.getQuotes(activeSymbols),
    [activeSymbolsKey, refreshKey],
  );

  const marketPrices = useMemo<MarketPriceMap>(() => {
    const prices: MarketPriceMap = {};

    for (const quote of marketPriceRows ?? []) {
      prices[getMarketPriceKey(quote.symbol)] = quote;
    }

    return prices;
  }, [marketPriceRows]);

  const hasRefreshingMarketPrices = useMemo(
    () => (marketPriceRows ?? []).some((quote) => quote.isRefreshing),
    [marketPriceRows],
  );

  const { filteredRows, filterCounts, hasRows, hasVisibleRows, count } =
    useFilteredPositions(positions, filter, search, sort);

  useEffect(() => {
    try {
      window.localStorage.removeItem(OLD_CASH_BALANCE_STORAGE_KEY);
    } catch {
      // Old local-only cash balance is intentionally discarded.
    }
  }, []);

  useEffect(() => {
    if (cashBalance) {
      setCashBalanceValue(cashBalance.cashBalance);
    }
  }, [cashBalance]);

  useEffect(() => {
    if (!hasRefreshingMarketPrices || marketPricesLoading) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      refetchMarketPrices();
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [hasRefreshingMarketPrices, marketPricesLoading, refetchMarketPrices]);

  useEffect(() => {
    saveControls({ filter, sort, search });

    const nextParams = new URLSearchParams(searchParams);
    setOptionalParam(nextParams, "filter", filter, DEFAULT_FILTER);
    setOptionalParam(nextParams, "sort", sort, DEFAULT_SORT);
    setOptionalParam(nextParams, "search", search, "");

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [filter, search, searchParams, setSearchParams, sort]);

  useEffect(() => {
    saveSession({ selectedSymbol });
  }, [selectedSymbol]);

  useEffect(() => {
    if (positionsLoading || !selectedSymbol || !positions) {
      return;
    }

    const selectedKey = getMarketPriceKey(selectedSymbol);
    const existsInBackendPositions = positions.some(
      (position) => getMarketPriceKey(position.symbol) === selectedKey,
    );

    if (!existsInBackendPositions) {
      setSelectedSymbol(null);
    }
  }, [positions, positionsLoading, selectedSymbol]);

  useEffect(() => {
    if (!didMountControlsRef.current) {
      didMountControlsRef.current = true;
      return;
    }

    listRef.current?.scrollTo({ top: 0 });
    saveSession({ scrollTop: 0 });
  }, [filter, sort, search]);

  useEffect(() => {
    if (positionsLoading || didRestoreScrollRef.current || !listRef.current) {
      return;
    }

    const scrollTop = initialSession.scrollTop ?? 0;
    didRestoreScrollRef.current = true;

    window.requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: scrollTop });
    });
  }, [filteredRows.length, initialSession.scrollTop, positionsLoading]);

  const handleListScroll = useCallback(() => {
    saveSession({ scrollTop: listRef.current?.scrollTop ?? 0 });
  }, []);

  const handleTransactionsChanged = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleCashBalanceSave = useCallback(
    async (nextCashBalance: number) => {
      const updated = await portfolioService.updateCashBalance(nextCashBalance);
      setCashBalanceValue(updated.cashBalance);
      refetchCashBalance();
      return updated.cashBalance;
    },
    [refetchCashBalance],
  );

  const selectedPosition = selectedSymbol
    ? positions?.find(
        (position) =>
          getMarketPriceKey(position.symbol) === getMarketPriceKey(selectedSymbol),
      )
    : undefined;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <section className={styles.panel}>
          <PortfolioSummaryPanel
            positions={positions}
            marketPrices={marketPrices}
            cashBalance={cashBalanceValue}
            cashBalanceLoading={cashBalanceLoading}
            cashBalanceError={cashBalanceError}
            onCashBalanceSave={handleCashBalanceSave}
          />

          <FilterBar
            filter={filter}
            onFilterChange={setFilter}
            filterCounts={filterCounts}
            sort={sort}
            onSortChange={setSort}
            count={count}
            search={search}
            onSearchChange={setSearch}
            onViewAllTransactions={() => setIsAllTransactionsOpen(true)}
            onNewTransaction={() => setIsCreatingTransaction(true)}
          />

          <div
            ref={listRef}
            className={styles.listScrollContainer}
            onScroll={handleListScroll}
          >
            <div className={styles.listCenterContainer}>
              <div className={styles.listInnerContainer}>
                <PositionList
                  loading={positionsLoading}
                  error={positionsError}
                  hasRows={hasRows}
                  hasVisibleRows={hasVisibleRows}
                  filteredRows={filteredRows}
                  marketPrices={marketPrices}
                  marketPricesLoading={marketPricesLoading}
                  onMarketPriceChanged={refetchMarketPrices}
                  onSelectAsset={setSelectedSymbol}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {selectedSymbol && selectedPosition && (
        <AssetHistoryModal
          symbol={selectedPosition.symbol}
          position={selectedPosition}
          marketPrice={marketPrices[getMarketPriceKey(selectedPosition.symbol)]}
          marketPriceLoading={marketPricesLoading}
          onMarketPriceChanged={refetchMarketPrices}
          onClose={() => setSelectedSymbol(null)}
          onChanged={handleTransactionsChanged}
        />
      )}

      {isAllTransactionsOpen && (
        <TransactionHistoryModal
          onClose={() => setIsAllTransactionsOpen(false)}
          onChanged={handleTransactionsChanged}
        />
      )}

      {isCreatingTransaction && (
        <TransactionFormModal
          onSaved={handleTransactionsChanged}
          onClose={() => setIsCreatingTransaction(false)}
        />
      )}
    </div>
  );
}
