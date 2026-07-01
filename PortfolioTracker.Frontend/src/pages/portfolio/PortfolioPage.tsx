import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { portfolioService } from "@/services/portfolioService";
import { queryKeys } from "@/services/queryKeys";
import { useFilteredPositions } from "./hooks/useFilteredPositions";

import PositionHistoryModal from "./components/PositionHistoryModal";
import TransactionHistoryModal from "./components/transactions/TransactionHistoryModal";
import TransactionFormModal from "./components/transactions/TransactionFormModal";
import { PositionList } from "./components/PositionList";
import { PortfolioSummaryPanel } from "./components/PortfolioSummaryPanel";
import { PortfolioToolbar } from "./components/PortfolioToolbar";
import type { FilterType, SortType } from "./portfolioControls";
import { getMarketPriceKey } from "./utils/portfolioUiUtils";

const DEFAULT_FILTER: FilterType = "open";
const DEFAULT_SORT: SortType = "symbol_asc";
const CONTROLS_STORAGE_KEY = "portfolioTracker.portfolio.controls";
const SESSION_STORAGE_KEY = "portfolioTracker.portfolio.session";
const OLD_CASH_BALANCE_STORAGE_KEY = "portfolioTracker.portfolio.cashBalance";
const READ_MODEL_REFRESH_DELAY_MS = 1500;

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
  pageContainer:
    "flex h-full w-full flex-col min-w-0 overflow-hidden select-none",
  contentWrapper: "flex h-full w-full flex-col min-w-0",
  panel: "flex h-full w-full flex-col min-w-0",
  listScrollContainer:
    "app-scrollbar flex-1 w-full min-h-0 overflow-auto overscroll-none",
  listCenterContainer:
    "w-full flex justify-center px-5 max-[760px]:px-4 max-[420px]:px-3",
  listInnerContainer: "w-full max-w-[640px] min-w-0 pb-3",
};

function getErrorMessage(error: unknown): string | null {
  if (!error) return null;
  return error instanceof Error ? error.message : "Bir hata oluştu";
}

export default function PortfolioPage() {
  const queryClient = useQueryClient();
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

  const [filter, setFilter] = useState<FilterType>(initialControls.filter);
  const [sort, setSort] = useState<SortType>(initialControls.sort);
  const [search, setSearch] = useState(initialControls.search);
  const listRef = useRef<HTMLDivElement>(null);
  const didRestoreScrollRef = useRef(false);
  const didMountControlsRef = useRef(false);

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
    error: dashboardQueryError,
  } = useQuery({
    queryKey: queryKeys.portfolio.dashboard(),
    queryFn: portfolioService.getDashboard,
  });
  const positions = dashboard?.positions;
  const summary = dashboard?.summary;

  const { mutateAsync: updateCashBalance } = useMutation({
    mutationFn: portfolioService.updateCashBalance,
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.portfolio.cashBalance(), updated);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.portfolio.dashboard(),
      });
    },
  });

  const hasRefreshingMarketPrices = useMemo(
    () =>
      (positions ?? []).some((position) => position.marketPrice?.isRefreshing),
    [positions],
  );
  const dashboardError = getErrorMessage(dashboardQueryError);

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
    if (!hasRefreshingMarketPrices || dashboardFetching) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.portfolio.dashboard(),
      });
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [dashboardFetching, hasRefreshingMarketPrices, queryClient]);

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
    if (dashboardLoading || !selectedSymbol || !positions) {
      return;
    }

    const selectedKey = getMarketPriceKey(selectedSymbol);
    const existsInBackendPositions = positions.some(
      (position) => getMarketPriceKey(position.symbol) === selectedKey,
    );

    if (!existsInBackendPositions) {
      setSelectedSymbol(null);
    }
  }, [dashboardLoading, positions, selectedSymbol]);

  useEffect(() => {
    if (!didMountControlsRef.current) {
      didMountControlsRef.current = true;
      return;
    }

    listRef.current?.scrollTo({ top: 0 });
    saveSession({ scrollTop: 0 });
  }, [filter, sort, search]);

  useEffect(() => {
    if (dashboardLoading || didRestoreScrollRef.current || !listRef.current) {
      return;
    }

    const scrollTop = initialSession.scrollTop ?? 0;
    didRestoreScrollRef.current = true;

    window.requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: scrollTop });
    });
  }, [dashboardLoading, filteredRows.length, initialSession.scrollTop]);

  const handleListScroll = useCallback(() => {
    saveSession({ scrollTop: listRef.current?.scrollTop ?? 0 });
  }, []);

  const invalidatePortfolioReadModel = useCallback(() => {
    const invalidate = () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.portfolio.dashboard(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.portfolio.positions(),
      });
    };

    invalidate();
    window.setTimeout(invalidate, READ_MODEL_REFRESH_DELAY_MS);
  }, [queryClient]);

  const handleTransactionsChanged = useCallback(() => {
    invalidatePortfolioReadModel();
    void queryClient.invalidateQueries({
      queryKey: queryKeys.transactions.all,
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.marketPrices.all,
    });
  }, [invalidatePortfolioReadModel, queryClient]);

  const handleMarketPriceChanged = useCallback(() => {
    invalidatePortfolioReadModel();
    void queryClient.invalidateQueries({
      queryKey: queryKeys.marketPrices.all,
    });
  }, [invalidatePortfolioReadModel, queryClient]);

  const handleCashBalanceSave = useCallback(
    async (nextCashBalance: number) => {
      const updated = await updateCashBalance(nextCashBalance);
      return updated.cashBalance;
    },
    [updateCashBalance],
  );

  const selectedPosition = selectedSymbol
    ? positions?.find(
        (position) =>
          getMarketPriceKey(position.symbol) ===
          getMarketPriceKey(selectedSymbol),
      )
    : undefined;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <section className={styles.panel}>
          <PortfolioSummaryPanel
            summary={summary}
            cashBalanceLoading={dashboardLoading}
            cashBalanceError={dashboardError}
            onCashBalanceSave={handleCashBalanceSave}
          />

          <PortfolioToolbar
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
                  loading={dashboardLoading}
                  error={dashboardError}
                  hasRows={hasRows}
                  hasVisibleRows={hasVisibleRows}
                  filteredRows={filteredRows}
                  marketPricesLoading={dashboardLoading}
                  onMarketPriceChanged={handleMarketPriceChanged}
                  onSelectAsset={setSelectedSymbol}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {selectedSymbol && selectedPosition && (
        <PositionHistoryModal
          symbol={selectedPosition.symbol}
          position={selectedPosition}
          marketPrice={selectedPosition.marketPrice}
          marketPriceLoading={dashboardLoading}
          onMarketPriceChanged={handleMarketPriceChanged}
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
